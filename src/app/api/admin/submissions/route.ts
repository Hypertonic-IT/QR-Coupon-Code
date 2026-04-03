import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        if (!cookieStore.get('admin_token')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const submissions = storage.getSubmissions();
        return NextResponse.json(submissions, { status: 200 });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ message: 'Fetch error' }, { status: 500 });
    }
}
