import { NextResponse } from "next/server";
import crypto from "crypto";
import { storage } from "@/lib/storage";
import { cookies } from "next/headers";

export async function POST(req) {
    try {
        const cookieStore = await cookies();
        if (!cookieStore.get("admin_token")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { currentPassword, newPassword } = await req.json();
        const admin = storage.getAdmin("admin");

        const currentHash = crypto
            .createHash("sha256")
            .update(currentPassword)
            .digest("hex");
        if (admin.passwordHash !== currentHash) {
            return NextResponse.json(
                { message: "Incorrect current password" },
                { status: 401 },
            );
        }

        const newHash = crypto
            .createHash("sha256")
            .update(newPassword)
            .digest("hex");
        storage.updateAdminPassword("admin", newHash);

        return NextResponse.json({ message: "Password updated" }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error updating password" },
            { status: 500 },
        );
    }
}
