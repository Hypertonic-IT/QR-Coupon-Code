import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { cookies } from "next/headers";

export async function PATCH(req, { params }) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        if (!cookieStore.get("admin_token")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { status } = await req.json();
        const updated = storage.updateSubmissionStatus(id, status);

        if (!updated) {
            return NextResponse.json(
                { message: "Submission not found" },
                { status: 404 },
            );
        }

        return NextResponse.json(updated);
    } catch (err) {
        return NextResponse.json({ message: "Update failed" }, { status: 500 });
    }
}
