import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { storage } from '@/lib/storage';

// Auth guard
async function isAuthed(): Promise<boolean> {
    const cookieStore = await cookies();
    return !!cookieStore.get('admin_token')?.value;
}

/* ── PATCH /api/admin/qr/[id] — Toggle status ── */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { status } = await req.json();

    const updated = storage.updateCouponStatus(id, status);
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ success: true, coupon: updated });
}

/* ── DELETE /api/admin/qr/[id] — Remove coupon ── */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const deleted = storage.deleteCoupon(id);
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ success: true });
}
