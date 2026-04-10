import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { storage } from '@/lib/storage';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { username, currentPassword, newPassword } = await req.json();

        const admin = storage.getAdmin(username);

        if (!admin) {
            return NextResponse.json({ message: 'Admin not found' }, { status: 404 });
        }

        const currentHash = crypto.createHash('sha256').update(currentPassword).digest('hex');
        if (admin.passwordHash !== currentHash) {
            return NextResponse.json({ message: 'Incorrect current password' }, { status: 403 });
        }

        const newHash = crypto.createHash('sha256').update(newPassword).digest('hex');

        const success = storage.updateAdminPassword(username, newHash);

        if (success) {
            return NextResponse.json({ message: 'Password changed successfully' }, { status: 200 });
        } else {
            return NextResponse.json({ message: 'Failed to update password' }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Change password error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
