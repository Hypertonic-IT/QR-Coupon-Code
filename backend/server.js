const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { storage } = require('./storage');
const Papa = require('papaparse');

const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev';

// Middleware for Admin Auth
const authMiddleware = (req, res, next) => {
    const token = req.cookies.admin_token;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    try {
        jwt.verify(token, JWT_SECRET);
        next();
    } catch (e) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// LOGIN
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    const admin = storage.getAdmin(username);
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    if (admin.passwordHash !== passwordHash) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('admin_token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.json({ message: 'Login successful' });
});

// LOGOUT
app.post('/api/admin/logout', (req, res) => {
    res.clearCookie('admin_token');
    res.json({ message: 'Logged out' });
});

// CHANGE PASSWORD
app.patch('/api/admin/change-password', authMiddleware, (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const admin = storage.getAdmin('admin');
    const currentHash = crypto.createHash('sha256').update(currentPassword).digest('hex');

    if (admin.passwordHash !== currentHash) {
        return res.status(400).json({ message: 'Incorrect current password' });
    }
    const newHash = crypto.createHash('sha256').update(newPassword).digest('hex');
    storage.updateAdminPassword('admin', newHash);
    res.json({ message: 'Password updated successfully' });
});

// FORGOT PASSWORD
app.post('/api/admin/forgot-password', (req, res) => {
    const { username, newPassword, secretKey } = req.body;
    const expectedSecret = process.env.ADMIN_SECRET_KEY || 'hyperpass';

    if (secretKey !== expectedSecret) {
        return res.status(401).json({ message: 'Invalid Admin Secret Key' });
    }

    const admin = storage.getAdmin(username);
    if (!admin) {
        return res.status(404).json({ message: 'Admin username not found' });
    }

    const passwordHash = crypto.createHash('sha256').update(newPassword).digest('hex');
    const success = storage.updateAdminPassword(username, passwordHash);

    if (success) {
        return res.json({ message: 'Password reset successfully' });
    } else {
        return res.status(500).json({ message: 'Failed to update password' });
    }
});

// STATS
app.get('/api/admin/stats', authMiddleware, (req, res) => {
    const stats = storage.getStats();
    const recent = storage.getRecentClaims(10);
    res.json({ ...stats, recentClaims: recent });
});

// QR CRUD
app.get('/api/admin/qr', authMiddleware, (req, res) => {
    res.json(storage.getCoupons());
});

app.post('/api/admin/qr/generate', authMiddleware, (req, res) => {
    let { count, value } = req.body;
    count = parseInt(count) || 1;
    value = parseInt(value) || 1;
    if (count > 500) return res.status(400).json({ message: 'Max 500' });

    const coupons = Array(count).fill(0).map(() => ({
        uniqueCode: crypto.randomBytes(3).toString('hex').toUpperCase(),
        value
    }));
    const created = storage.addCoupons(coupons);
    res.json({ message: `Generated ${count} codes`, created });
});

app.delete('/api/admin/qr/:id', authMiddleware, (req, res) => {
    const ok = storage.deleteCoupon(req.params.id);
    if (!ok) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
});

app.delete('/api/admin/qr-bulk', authMiddleware, (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ message: 'Invalid payload' });
    const deletedCount = storage.deleteCoupons(ids);
    res.json({ message: `Deleted ${deletedCount} coupons` });
});

// SUBMISSIONS
app.get('/api/admin/submissions', authMiddleware, (req, res) => {
    res.json(storage.getSubmissions());
});

app.patch('/api/admin/submissions/:id', authMiddleware, (req, res) => {
    const { status } = req.body;
    const sub = storage.updateSubmissionStatus(req.params.id, status);
    if (!sub) return res.status(404).json({ message: 'Not found' });

    // If updating to PAID, also mark QR used
    if (status === 'PAID') {
        const qr = storage.getCoupons().find(c => c._id === sub.qrCouponId);
        if (qr) storage.updateCouponStatus(qr._id, 'PAID');
    }
    res.json({ message: 'Status updated', submission: sub });
});

// EXPORT CSV
app.get('/api/admin/export-csv', authMiddleware, (req, res) => {
    const submissions = storage.getSubmissions() || [];
    const data = submissions.map(s => ({
        ID: s._id,
        Name: s.name,
        Mobile: s.mobile,
        AccountType: s.accountType,
        AccountValue: s.accountValue,
        QRCodeID: s.qrCoupon?.uniqueCode || 'N/A',
        Value: s.qrCoupon?.value || 0,
        Status: s.status,
        SubmittedAt: s.createdAt,
        Screenshot: s.screenshotUrl || ''
    }));

    const csv = Papa.unparse(data);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=submissions.csv');
    res.status(200).send(csv);
});

// PUBLIC: Get Coupon Status
app.get('/api/public/qr/:code', (req, res) => {
    const coupon = storage.getCouponByCode(req.params.code);
    if (!coupon) return res.status(404).json({ message: 'Invalid QR Code' });
    res.json(coupon);
});

// PUBLIC: Verify Code and Submit Claim
app.post('/api/submit-claim', (req, res) => {
    const { code, name, mobile, accountType, accountValue } = req.body;
    const coupon = storage.getCouponByCode(code);

    if (!coupon) return res.status(404).json({ message: 'Invalid QR Code' });
    if (coupon.isUsed) return res.status(400).json({ message: 'Code already claimed' });

    storage.markCouponUsed(code);
    storage.addSubmission({
        qrCouponId: coupon._id,
        name,
        mobile,
        accountType,
        accountValue,
        screenshotUrl: req.body.screenshot || ''
    });

    res.json({ message: 'Claim submitted successfully' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
