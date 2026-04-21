import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import Papa from "papaparse";
import { cookies } from "next/headers";

export async function GET() {
    try {
        const cookieStore = await cookies();
        if (!cookieStore.get("admin_token")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const submissions = storage.getSubmissions();

        const data = (submissions || []).map((s) => ({
            ID: s._id,
            Name: s.name,
            Mobile: s.mobile,
            AccountType: s.accountType,
            AccountValue: s.accountValue,
            QRCodeID: s.qrCoupon?.uniqueCode || "N/A",
            Value: s.qrCoupon?.value || 0,
            Status: s.status,
            SubmittedAt: s.createdAt,
            Screenshot: s.screenshotUrl,
        }));

        const csv = Papa.unparse(data);

        return new NextResponse(csv, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": "attachment; filename=submissions.csv",
            },
        });
    } catch (error) {
        console.error("CSV Export Error:", error);
        return NextResponse.json({ message: "Export failed" }, { status: 500 });
    }
}
