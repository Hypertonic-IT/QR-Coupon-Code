import express from 'express';
import crypto from 'crypto';
import { storage } from '../lib/storage.js';
import Papa from 'papaparse';

const router = express.Router();

// Auth Middleware
const authGuard = (req, res, next) => {
    if (req.cookies.admin_token === 'authenticated_session_token') {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = storage.getAdmin(username);

        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const passwordHash = crypto
            .createHash('sha256')
            .update(password)
            .digest('hex');

        if (admin.passwordHash !== passwordHash) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.cookie('admin_token', 'authenticated_session_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 1000, // 1 day in ms
        });

        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    res.clearCookie('admin_token');
    res.status(200).json({ message: 'Logged out' });
});

// Stats
router.get('/stats', authGuard, (req, res) => {
    try {
        const stats = storage.getStats();
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

// QR - List
router.get('/qr', authGuard, (req, res) => {
    try {
        const qrs = storage.getCoupons();
        const sorted = [...qrs].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        res.status(200).json(sorted);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching QR codes' });
    }
});

// QR - Generate
router.post('/qr/generate', authGuard, (req, res) => {
    try {
        const { count, value } = req.body;
        if (!count || count < 1 || !value || value < 0) {
            return res.status(400).json({ message: 'Invalid input' });
        }

        const couponsToCreate = [];
        for (let i = 0; i < count; i++) {
            const uniqueCode = crypto.randomBytes(3).toString('hex').toUpperCase();
            couponsToCreate.push({ uniqueCode, value: Number(value) });
        }

        const created = storage.addCoupons(couponsToCreate);
        res.status(201).json({ message: `${created.length} coupons generated`, created });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// QR - Update status
router.patch('/qr/:id', authGuard, (req, res) => {
    try {
        const { status } = req.body;
        const updated = storage.updateCouponStatus(req.params.id, status);
        if (!updated) return res.status(404).json({ message: 'Not found' });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Update failed' });
    }
});

// QR - Delete
router.delete('/qr/:id', authGuard, (req, res) => {
    try {
        const success = storage.deleteCoupon(req.params.id);
        if (!success) return res.status(404).json({ message: 'Not found' });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed' });
    }
});

// QR - Bulk Delete
router.post('/qr-bulk', authGuard, (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'No IDs provided' });
        }
        const deletedCount = storage.deleteCoupons(ids);
        res.status(200).json({ success: true, count: deletedCount });
    } catch (error) {
        res.status(500).json({ error: 'Bulk delete failed' });
    }
});

// Submissions - List
router.get('/submissions', authGuard, (req, res) => {
    try {
        const submissions = storage.getSubmissions();
        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching submissions' });
    }
});

// Submissions - Update status
router.patch('/submissions/:id', authGuard, (req, res) => {
    try {
        const { status } = req.body;
        const updated = storage.updateSubmissionStatus(req.params.id, status);
        if (!updated) return res.status(404).json({ message: 'Not found' });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Update failed' });
    }
});

// Change Password
router.post('/change-password', authGuard, (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const admin = storage.getAdmin('admin');

        const currentHash = crypto.createHash('sha256').update(currentPassword).digest('hex');
        if (admin.passwordHash !== currentHash) {
            return res.status(401).json({ message: 'Incorrect current password' });
        }

        const newHash = crypto.createHash('sha256').update(newPassword).digest('hex');
        storage.updateAdminPassword('admin', newHash);
        res.status(200).json({ message: 'Password updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating password' });
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    try {
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
            res.status(200).json({ message: 'Password reset successfully' });
        } else {
            res.status(500).json({ message: 'Failed to update password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Export CSV
router.get('/export-csv', authGuard, (req, res) => {
    try {
        const submissions = storage.getSubmissions();
        const data = (submissions || []).map((s) => ({
            ID: s._id,
            Name: s.name,
            Mobile: s.mobile,
            AccountType: s.accountType,
            AccountValue: s.accountValue,
            QRCodeID: s.qrCoupon?.uniqueCode || 'N/A',
            Value: s.qrCoupon?.value || 0,
            Status: s.status,
            SubmittedAt: s.createdAt,
            Screenshot: s.screenshotUrl,
        }));

        const csv = Papa.unparse(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=submissions.csv');
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Export failed' });
    }
});

export default router;
