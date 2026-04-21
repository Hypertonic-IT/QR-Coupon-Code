import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { storage } from "@/lib/storage";

export async function POST(req) {
    try {
        const cookieStore = await cookies();
        if (!cookieStore.get("admin_token")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { ids } = await req.json();
        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
        }

        const deletedCount = storage.deleteCoupons(ids);
        return NextResponse.json({ success: true, count: deletedCount });
    } catch (error) {
        return NextResponse.json({ error: "Bulk delete failed" }, { status: 500 });
    }
}
