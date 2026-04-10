'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QrCode, Eye, EyeOff, ShieldCheck, ArrowLeft, Loader2, KeyRound } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [username, setUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [showSecret, setShowSecret] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError(null);
        try {
            const res = await fetch('/api/admin/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, newPassword, secretKey }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Password reset failed');
            setSuccess(true);
            setTimeout(() => {
                router.push('/admin/login');
            }, 2000);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-left">
                <div className="login-brand">
                    <div className="login-brand-mark"><QrCode size={18} color="white" /></div>
                    <div className="login-brand-name">CashbackQR</div>
                </div>

                <h1 className="login-headline">
                    Regain access to your<br />
                    <em>dashboard.</em>
                </h1>
                <p className="login-tagline">
                    Reset your password using your administrative secret key.
                </p>

                <div className="login-features" style={{ marginTop: 40 }}>
                    <div className="login-feature">
                        <div className="login-feature-icon"><KeyRound size={17} /></div>
                        <div>
                            <div className="login-feature-title">Admin Secret Key</div>
                            <div className="login-feature-desc">Required to verify your identity and authorize the change.</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="login-right">
                <div className="login-box">
                    <div className="login-box-title">Reset Password</div>
                    <div className="login-box-sub">Enter your details to create a new password.</div>

                    {error && (
                        <div className="notice notice-error" style={{ marginBottom: 20 }}>
                            <ShieldCheck size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="notice notice-success" style={{ marginBottom: 20, background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: 8 }}>
                            <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                            Password reset successful! Redirecting to login...
                        </div>
                    )}

                    {!success && (
                        <form className="login-form" onSubmit={handleReset}>
                            <div className="form-field">
                                <label className="form-label">Username</label>
                                <input
                                    className="input input-lg"
                                    placeholder="e.g. admin"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    required autoFocus
                                />
                            </div>

                            <div className="form-field">
                                <label className="form-label">New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        className="input input-lg"
                                        type={showPw ? 'text' : 'password'}
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        required
                                        style={{ paddingRight: 44 }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPw(!showPw)}
                                        style={{
                                            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                            color: 'var(--text-4)', display: 'flex', background: 'none', border: 'none', cursor: 'pointer'
                                        }}
                                    >
                                        {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-field">
                                <label className="form-label">Admin Secret Key</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        className="input input-lg"
                                        type={showSecret ? 'text' : 'password'}
                                        placeholder="Enter your secret key"
                                        value={secretKey}
                                        onChange={e => setSecretKey(e.target.value)}
                                        required
                                        style={{ paddingRight: 44 }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowSecret(!showSecret)}
                                        style={{
                                            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                            color: 'var(--text-4)', display: 'flex', background: 'none', border: 'none', cursor: 'pointer'
                                        }}
                                    >
                                        {showSecret ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 8 }}>
                                    Default key is <strong>hyperpass</strong> unless set in environment.
                                </div>
                            </div>

                            <button
                                type="submit" disabled={loading}
                                className="btn btn-primary btn-lg btn-full"
                                style={{ marginTop: 4, justifyContent: 'center' }}
                            >
                                {loading
                                    ? <><Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> Resetting…</>
                                    : <>Reset Password</>
                                }
                            </button>
                        </form>
                    )}

                    <div style={{ marginTop: 20, textAlign: 'center' }}>
                        <Link href="/admin/login" style={{ color: 'var(--text-3)', textDecoration: 'none', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <ArrowLeft size={14} /> Back to Login
                        </Link>
                    </div>
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
