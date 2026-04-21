import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export async function POST(req) {
    try {
        const formData = await req.formData();

        const qrCouponId = formData.get("qrCouponId");
        const uniqueCode = formData.get("uniqueCode");
        const name = formData.get("name");
        const mobile = formData.get("mobile");
        const accountType = formData.get("accountType");
        const accountValue = formData.get("accountValue");

        if (!name || !mobile || !accountType || !accountValue) {
            return NextResponse.json(
                { message: "All fields are required" },
                { status: 400 },
            );
        }

        // Validate QR Code
        const coupon = storage.getCouponByCode(uniqueCode);
        if (!coupon || coupon.isUsed) {
            return NextResponse.json(
                { message: "QR Code is invalid or already used" },
                { status: 400 },
            );
        }

        // Create Submission
        storage.addSubmission({
            qrCouponId: coupon._id,
            name,
            mobile,
            accountType,
            accountValue,
        });

        // Mark QR as used
        storage.markCouponUsed(uniqueCode);

        return NextResponse.json(
            { message: "Claim submitted successfully" },
            { status: 201 },
        );
    } catch (error) {
        console.error("Submission error:", error);
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 },
        );
    }
}
