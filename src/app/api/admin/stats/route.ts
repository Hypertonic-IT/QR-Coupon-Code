import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        if (!cookieStore.get('admin_token')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const stats = storage.getStats();
        const recentClaims = storage.getRecentClaims(5);

        return NextResponse.json({ ...stats, recentClaims }, { status: 200 });
    } catch (error: any) {
        console.error('Stats error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
