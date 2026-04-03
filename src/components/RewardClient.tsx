'use client';
import React, { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface Props {
    coupon: { _id: string; uniqueCode: string; value: number; };
}

export default function RewardClient({ coupon }: Props) {
    const [step, setStep] = useState<'claim' | 'success'>('claim');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [accountType, setAccountType] = useState('UPI_ID');
    const [accountNumber, setAccountNumber] = useState('');
    const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
    const [ifsc, setIfsc] = useState('');
    const [upiValue, setUpiValue] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        let finalAccountValue = '';
        if (accountType === 'BANK_ACCOUNT') {
            if (accountNumber !== confirmAccountNumber) {
                setError('Account numbers do not match.');
                return;
            }
            if (!ifsc) {
                setError('IFSC code is required.');
                return;
            }
            finalAccountValue = `A/C: ${accountNumber} | IFSC: ${ifsc.toUpperCase()}`;
        } else {
            if (!upiValue) {
                setError('UPI ID or Number is required.');
                return;
            }
            finalAccountValue = upiValue;
        }

        setLoading(true);
        const form = new FormData(e.currentTarget);
        form.append('qrCouponId', coupon._id);
        form.append('uniqueCode', coupon.uniqueCode);
        form.delete('accountValue'); // Remove standard DOM input mapping
        form.append('accountValue', finalAccountValue);
        try {
            const res = await fetch('/api/submit-claim', { method: 'POST', body: form });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Submission failed.');
            setStep('success');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (step === 'success') {
        return (
            <div className="rw-layout" style={{ alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', padding: 32, maxWidth: 400 }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: '50%',
                        background: 'rgba(16,185,129,0.12)',
                        border: '1.5px solid rgba(16,185,129,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px',
                    }}>
                        <CheckCircle2 size={36} color="#34d399" />
                    </div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white', marginBottom: 10, letterSpacing: '-0.03em' }}>
                        Claim Submitted!
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, fontSize: '0.88rem', marginBottom: 24 }}>
                        Thank you! Our team will verify your payment and credit{' '}
                        <strong style={{ color: 'white' }}>₹{coupon.value}</strong> to your account within{' '}
                        <strong style={{ color: 'white' }}>2–3 working days.</strong>
                    </p>
                    <div style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 12, padding: '12px 16px',
                        fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)'
                    }}>
                        Keep your payment reference number handy for any follow-up queries.
                    </div>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div className="rw-layout">
            {/* Header */}
            <div className="rw-header">
                <div style={{
                    width: 30, height: 30,
                    background: 'linear-gradient(135deg, var(--brand-600), var(--purple-600))',
                    borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
                    color: 'white', fontWeight: 800, fontSize: '14px'
                }}>
                    ₹
                </div>
                <div>
                    <div className="rw-header-brand">CashbackQR</div>
                    <div className="rw-header-tag">Reward Claim Portal</div>
                </div>
            </div>

            <div className="rw-body">
                <div className="rw-card">

                    <>
                        <div style={{ textAlign: 'center', marginBottom: 28 }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(165,180,252,0.1)', color: 'var(--brand-400)', padding: '6px 14px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>
                                🎉 Cashback Unlocked
                            </div>
                            <h2 style={{ fontWeight: 800, color: 'white', fontSize: '1.35rem', marginBottom: 8, letterSpacing: '-0.02em' }}>
                                Claim ₹{coupon.value} Reward
                            </h2>
                            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                                Enter your preferred payment details below so we can securely credit your account.
                            </p>
                        </div>

                        {error && (
                            <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: '0.82rem', color: '#fca5a5' }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <label className="rw-label">Full Name *</label>
                            <input name="name" className="rw-input" placeholder="e.g. Rahul Sharma" required />

                            <label className="rw-label">Mobile Number *</label>
                            <input name="mobile" className="rw-input" type="tel" placeholder="+91 98765 43210" required />

                            <label className="rw-label">Payment Account Type *</label>
                            <select
                                name="accountType"
                                className="rw-input"
                                value={accountType}
                                onChange={e => setAccountType(e.target.value)}
                                required
                            >
                                <option value="UPI_ID">UPI ID (e.g. name@bank)</option>
                                <option value="BANK_ACCOUNT">Bank Account + IFSC</option>
                                <option value="UPI_NUMBER">UPI Mobile Number</option>
                            </select>

                            {accountType === 'BANK_ACCOUNT' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4, background: 'rgba(255,255,255,0.03)', padding: '14px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <label className="rw-label">IFSC Code *</label>
                                    <input className="rw-input" placeholder="e.g. HDFC0001234" value={ifsc} onChange={e => setIfsc(e.target.value)} required style={{ textTransform: 'uppercase' }} />

                                    <label className="rw-label" style={{ marginTop: 10 }}>Account Number *</label>
                                    <input type="password" className="rw-input" placeholder="Enter Account Number" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} required />

                                    <label className="rw-label" style={{ marginTop: 10 }}>Confirm Account Number *</label>
                                    <input type="text" className="rw-input" placeholder="Re-enter Account Number" value={confirmAccountNumber} onChange={e => setConfirmAccountNumber(e.target.value)} required />
                                </div>
                            ) : accountType === 'UPI_ID' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                                    <label className="rw-label">UPI ID *</label>
                                    <input
                                        type="text"
                                        className="rw-input"
                                        placeholder="e.g. username@okhdfcbank"
                                        value={upiValue}
                                        onChange={e => setUpiValue(e.target.value)}
                                        required
                                    />
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                                    <label className="rw-label">UPI Mobile Number *</label>
                                    <input
                                        type="tel"
                                        className="rw-input"
                                        placeholder="e.g. 9876543210"
                                        value={upiValue}
                                        onChange={e => setUpiValue(e.target.value)}
                                        required
                                    />
                                </div>
                            )}

                            <button type="submit" className="rw-btn" disabled={loading} style={{ marginTop: 16 }}>
                                {loading
                                    ? <><Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</>
                                    : <><CheckCircle2 size={17} /> Submit & Claim</>
                                }
                            </button>
                        </form>
                    </>
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes spin-ring { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
