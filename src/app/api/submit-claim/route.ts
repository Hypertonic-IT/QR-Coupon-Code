import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        const qrCouponId = formData.get('qrCouponId') as string;
        const uniqueCode = formData.get('uniqueCode') as string;
        const name = formData.get('name') as string;
        const mobile = formData.get('mobile') as string;
        const accountType = formData.get('accountType') as string;
        const accountValue = formData.get('accountValue') as string;

        if (!name || !mobile || !accountType || !accountValue) {
            return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
        }

        // Validate QR Code using storage engine
        const coupon = storage.getCouponByCode(uniqueCode);
        if (!coupon || coupon.isUsed) {
            return NextResponse.json({ message: 'QR Code is invalid or already used' }, { status: 400 });
        }

        // Create Submission using storage engine
        storage.addSubmission({
            qrCouponId: coupon._id,
            name,
            mobile,
            accountType,
            accountValue,
        });

        // Mark QR as used
        storage.markCouponUsed(uniqueCode);

        return NextResponse.json({ message: 'Claim submitted successfully' }, { status: 201 });
    } catch (error: any) {
        console.error('Submission error:', error);
        return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
    }
}
