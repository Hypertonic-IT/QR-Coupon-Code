import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { storage } from '@/lib/storage';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();

        // Verification against local storage
        const admin = storage.getAdmin(username);

        if (!admin) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
        if (admin.passwordHash !== passwordHash) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        const cookieStore = await cookies();
        cookieStore.set('admin_token', 'authenticated_session_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 // 1 day
        });

        return NextResponse.json({ message: 'Login successful' }, { status: 200 });
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
