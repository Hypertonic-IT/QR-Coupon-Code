import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { cookies } from "next/headers";

export async function GET() {
    try {
        const cookieStore = await cookies();
        if (!cookieStore.get("admin_token")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const qrs = storage.getCoupons();
        // Sort by newest
        const sorted = [...qrs].sort(
            (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        return NextResponse.json(sorted, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message: "Fetch error" }, { status: 500 });
    }
}
