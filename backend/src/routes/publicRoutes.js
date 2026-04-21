import express from 'express';
import { storage } from '../lib/storage.js';

const router = express.Router();

// Submit Claim
router.post('/submit-claim', async (req, res) => {
    try {
        const {
            qrCouponId,
            uniqueCode,
            name,
            mobile,
            accountType,
            accountValue,
            screenshot // base64
        } = req.body;

        if (!name || !mobile || !accountType || !accountValue) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate QR Code
        const coupon = storage.getCouponByCode(uniqueCode);
        if (!coupon || coupon.isUsed) {
            return res.status(400).json({ message: 'QR Code is invalid or already used' });
        }

        // Create Submission
        storage.addSubmission({
            qrCouponId: coupon._id,
            name,
            mobile,
            accountType,
            accountValue,
            screenshot: screenshot || null // Save screenshot if provided
        });

        // Mark QR as used
        storage.markCouponUsed(uniqueCode);

        res.status(201).json({ message: 'Claim submitted successfully' });
    } catch (error) {
        console.error('Submission error:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
});

// Get QR Details
router.get('/qr/:code', async (req, res) => {
    try {
        const coupon = storage.getCouponByCode(req.params.code);
        if (!coupon) {
            return res.status(404).json({ message: 'QR Code is invalid' });
        }
        res.status(200).json(coupon);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching QR details' });
    }
});

export default router;
