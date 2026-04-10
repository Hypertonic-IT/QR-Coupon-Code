import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { storage } from '@/lib/storage';

export async function POST(req: NextRequest) {
    try {
        const { username, newPassword, secretKey } = await req.json();

        // Very basic security: hardcoded secret or environment variable
        const expectedSecret = process.env.ADMIN_SECRET_KEY || 'hyperpass';

        if (secretKey !== expectedSecret) {
            return NextResponse.json({ message: 'Invalid Admin Secret Key' }, { status: 401 });
        }

        const admin = storage.getAdmin(username);

        if (!admin) {
            return NextResponse.json({ message: 'Admin username not found' }, { status: 404 });
        }

        const passwordHash = crypto.createHash('sha256').update(newPassword).digest('hex');

        const success = storage.updateAdminPassword(username, passwordHash);

        if (success) {
            return NextResponse.json({ message: 'Password reset successfully' }, { status: 200 });
        } else {
            return NextResponse.json({ message: 'Failed to update password' }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Password reset error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
