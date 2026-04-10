import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { storage } from '@/lib/storage';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        if (!cookieStore.get('admin_token')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { count, value } = await req.json();

        if (!count || count < 1 || !value || value < 0) {
            return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
        }

        const couponsToCreate = [];
        for (let i = 0; i < count; i++) {
            const uniqueCode = crypto.randomBytes(3).toString('hex').toUpperCase();
            couponsToCreate.push({ uniqueCode, value });
        }

        const created = storage.addCoupons(couponsToCreate);

        return NextResponse.json({ message: `${created.length} coupons generated`, created }, { status: 201 });
    } catch (error: any) {
        console.error('QR creation error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        if (!cookieStore.get('admin_token')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const qrs = storage.getCoupons();
        return NextResponse.json(qrs, { status: 200 });
    } catch (err: any) {
        return NextResponse.json({ message: 'Fetch error' }, { status: 500 });
    }
}
