import React from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default function ThankYouPage() {
    return (
        <main className="container animate-fade-in" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh'
        }}>
            <div className="glass" style={{
                maxWidth: '500px',
                padding: '3rem',
                textAlign: 'center',
                borderColor: 'var(--success)'
            }}>
                <CheckCircle2 color="var(--success)" size={64} style={{ marginBottom: '1.5rem', display: 'inline-block' }} />
                <h1 style={{ marginBottom: '1rem' }}>Submission Successful</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Thank you! Your details have been submitted. Your cashback reward will be credited within 2–3 working days after verification.
                </p>
                <Link href="/" className="btn btn-primary">
                    Back to Home
                </Link>
            </div>
        </main>
    );
}
