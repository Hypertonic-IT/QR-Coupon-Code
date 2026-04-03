import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { cookies } from 'next/headers';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies();
        if (!cookieStore.get('admin_token')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { status } = await req.json();

        const sub = storage.updateSubmissionStatus(id, status);
        if (!sub) return NextResponse.json({ message: 'Submission not found' }, { status: 404 });

        return NextResponse.json(sub, { status: 200 });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
