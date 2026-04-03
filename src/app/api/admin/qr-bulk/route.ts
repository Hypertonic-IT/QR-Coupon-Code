import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { storage } from '@/lib/storage';

// Auth guard
async function isAuthed(): Promise<boolean> {
    const cookieStore = await cookies();
    return !!cookieStore.get('admin_token')?.value;
}

export async function POST(req: NextRequest) {
    if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { ids } = await req.json();
        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
        }

        const deletedCount = storage.deleteCoupons(ids);
        return NextResponse.json({ success: true, count: deletedCount });
    } catch (error) {
        return NextResponse.json({ error: 'Bulk delete failed' }, { status: 500 });
    }
}
