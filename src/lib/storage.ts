import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
    fs.mkdirSync(path.join(process.cwd(), 'data'));
}

// Initial structure
const INITIAL_DATA = {
    qr_coupons: [] as any[],
    submissions: [] as any[],
    admins: [
        { username: 'admin', passwordHash: crypto.createHash('sha256').update('admin123').digest('hex') }
    ]
};

// Helper to read DB
const readDB = () => {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_DATA, null, 2));
        return INITIAL_DATA;
    }
    const content = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(content);
};

// Helper to write DB
const writeDB = (data: any) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

export const storage = {
    // Coupon methods
    getCoupons: () => {
        const db = readDB();
        return db.qr_coupons.map((c: any) => ({
            ...c,
            status: c.status || (c.isUsed ? 'PAID' : 'UNPAID')
        }));
    },
    getCouponByCode: (code: string) => readDB().qr_coupons.find((c: any) => c.uniqueCode === code),
    addCoupons: (coupons: any[]) => {
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
    markCouponUsed: (code: string) => {
        const db = readDB();
        const coupon = db.qr_coupons.find((c: any) => c.uniqueCode === code);
        if (coupon) {
            coupon.isUsed = true;
            coupon.status = 'PAID';
            writeDB(db);
        }
    },
    updateCouponStatus: (id: string, status: string) => {
        const db = readDB();
        const coupon = db.qr_coupons.find((c: any) => c._id === id);
        if (!coupon) return null;
        coupon.status = status;
        coupon.isUsed = status === 'PAID';
        writeDB(db);
        return coupon;
    },
    deleteCoupon: (id: string) => {
        const db = readDB();
        const idx = db.qr_coupons.findIndex((c: any) => c._id === id);
        if (idx === -1) return false;
        db.qr_coupons.splice(idx, 1);
        writeDB(db);
        return true;
    },
    deleteCoupons: (ids: string[]) => {
        const db = readDB();
        const initialCount = db.qr_coupons.length;
        db.qr_coupons = db.qr_coupons.filter((c: any) => !ids.includes(c._id));
        if (db.qr_coupons.length !== initialCount) writeDB(db);
        return initialCount - db.qr_coupons.length;
    },

    // Submission methods
    getSubmissions: () => {
        const db = readDB();
        // Replicate Mongoose populate
        return db.submissions.map((s: any) => ({
            ...s,
            qrCoupon: db.qr_coupons.find((c: any) => c._id === s.qrCouponId)
        })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    addSubmission: (submission: any) => {
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
    updateSubmissionStatus: (id: string, status: string) => {
        const db = readDB();
        const sub = db.submissions.find((s: any) => s._id === id);
        if (sub) {
            sub.status = status;
            writeDB(db);
        }
        return sub;
    },

    // Recent claims
    getRecentClaims: (n: number) => {
        const db = readDB();
        return db.submissions
            .map((s: any) => ({ ...s, qrCoupon: db.qr_coupons.find((c: any) => c._id === s.qrCouponId) }))
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, n);
    },

    // Admin methods
    getAdmin: (username: string) => readDB().admins.find((a: any) => a.username === username),

    // Stats
    getStats: () => {
        const db = readDB();
        const totalQRs = db.qr_coupons.length;
        const usedQRs = db.qr_coupons.filter((c: any) => c.isUsed).length;
        const totalPayout = db.qr_coupons
            .filter((c: any) => c.isUsed)
            .reduce((sum: number, c: any) => sum + c.value, 0);

        const pendingCount = db.submissions.filter((s: any) => s.status === 'PENDING').length;
        const approvedCount = db.submissions.filter((s: any) => s.status === 'APPROVED').length;
        const paidCount = db.submissions.filter((s: any) => s.status === 'PAID').length;
        const rejectedCount = db.submissions.filter((s: any) => s.status === 'REJECTED').length;

        return { totalQRs, usedQRs, totalPayout, pendingCount, approvedCount, paidCount, rejectedCount };
    }
};
