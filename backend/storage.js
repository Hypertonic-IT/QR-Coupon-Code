const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
    fs.mkdirSync(path.join(process.cwd(), 'data'));
}

const INITIAL_DATA = {
    qr_coupons: [],
    submissions: [],
    admins: [
        { username: 'admin', passwordHash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9' }
    ]
};

const readDB = () => {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_DATA, null, 2));
        return INITIAL_DATA;
    }
    const content = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(content);
};

const writeDB = (data) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

const storage = {
    getCoupons: () => {
        const db = readDB();
        return db.qr_coupons.map(c => ({
            ...c,
            status: c.status || (c.isUsed ? 'PAID' : 'UNPAID')
        }));
    },
    getCouponByCode: (code) => readDB().qr_coupons.find(c => c.uniqueCode === code),
    addCoupons: (coupons) => {
        const db = readDB();
        const newCoupons = coupons.map(c => ({
            ...c,
            _id: crypto.randomUUID(),
            isUsed: false,
            status: 'UNPAID',
            createdAt: new Date().toISOString()
        }));
        db.qr_coupons.push(...newCoupons);
        writeDB(db);
        return newCoupons;
    },
    markCouponUsed: (code) => {
        const db = readDB();
        const coupon = db.qr_coupons.find(c => c.uniqueCode === code);
        if (coupon) {
            coupon.isUsed = true;
            coupon.status = 'PAID';
            writeDB(db);
        }
    },
    updateCouponStatus: (id, status) => {
        const db = readDB();
        const coupon = db.qr_coupons.find(c => c._id === id);
        if (!coupon) return null;
        coupon.status = status;
        coupon.isUsed = status === 'PAID';
        writeDB(db);
        return coupon;
    },
    deleteCoupon: (id) => {
        const db = readDB();
        const idx = db.qr_coupons.findIndex(c => c._id === id);
        if (idx === -1) return false;
        db.qr_coupons.splice(idx, 1);
        writeDB(db);
        return true;
    },
    deleteCoupons: (ids) => {
        const db = readDB();
        const initialCount = db.qr_coupons.length;
        db.qr_coupons = db.qr_coupons.filter(c => !ids.includes(c._id));
        if (db.qr_coupons.length !== initialCount) writeDB(db);
        return initialCount - db.qr_coupons.length;
    },
    getSubmissions: () => {
        const db = readDB();
        return db.submissions.map(s => ({
            ...s,
            qrCoupon: db.qr_coupons.find(c => c._id === s.qrCouponId)
        })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    addSubmission: (submission) => {
        const db = readDB();
        const newSub = {
            ...submission,
            _id: crypto.randomUUID(),
            status: 'PENDING',
            createdAt: new Date().toISOString()
        };
        db.submissions.push(newSub);
        writeDB(db);
        return newSub;
    },
    updateSubmissionStatus: (id, status) => {
        const db = readDB();
        const sub = db.submissions.find(s => s._id === id);
        if (sub) {
            sub.status = status;
            writeDB(db);
        }
        return sub;
    },
    getRecentClaims: (n) => {
        const db = readDB();
        return db.submissions
            .map(s => ({ ...s, qrCoupon: db.qr_coupons.find(c => c._id === s.qrCouponId) }))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, n);
    },
    getAdmin: (username) => readDB().admins.find(a => a.username === username),
    updateAdminPassword: (username, newPasswordHash) => {
        const db = readDB();
        const admin = db.admins.find(a => a.username === username);
        if (admin) {
            admin.passwordHash = newPasswordHash;
            writeDB(db);
            return true;
        }
        return false;
    },
    getStats: () => {
        const db = readDB();
        const totalQRs = db.qr_coupons.length;
        const usedQRs = db.qr_coupons.filter(c => c.isUsed).length;
        const totalPayout = db.qr_coupons
            .filter(c => c.isUsed)
            .reduce((sum, c) => sum + (c.value || 0), 0);

        const pendingCount = db.submissions.filter(s => s.status === 'PENDING').length;
        const approvedCount = db.submissions.filter(s => s.status === 'APPROVED').length;
        const paidCount = db.submissions.filter(s => s.status === 'PAID').length;
        const rejectedCount = db.submissions.filter(s => s.status === 'REJECTED').length;

        return { totalQRs, usedQRs, totalPayout, pendingCount, approvedCount, paidCount, rejectedCount };
    }
};

module.exports = { storage };
