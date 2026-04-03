'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, Eye, EyeOff, ArrowRight, Shield, Zap, BarChart3, Loader2 } from 'lucide-react';

const features = [
    { icon: Shield, title: 'Secure One-Time Codes', desc: 'Cryptographically unique QR codes that self-invalidate after a single use.' },
    { icon: Zap, title: 'Real-Time Verification', desc: 'Review and approve cashback claims the moment they arrive.' },
    { icon: BarChart3, title: 'Analytics & CSV Export', desc: 'Track every payout, conversion rate, and distribution metric.' },
];

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError(null);
        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Login failed');
            router.push('/admin');
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Left brand panel */}
            <div className="login-left">
                <div className="login-brand">
                    <div className="login-brand-mark"><QrCode size={18} color="white" /></div>
                    <div className="login-brand-name">CashbackQR</div>
                </div>

                <h1 className="login-headline">
                    Manage your<br />rewards with{' '}
                    <em>confidence.</em>
                </h1>
                <p className="login-tagline">
                    A complete platform to generate, distribute, and verify
                    QR coupon cashback claims — all in one place.
                </p>

                <div className="login-features">
                    {features.map(({ icon: Icon, title, desc }) => (
                        <div className="login-feature" key={title}>
                            <div className="login-feature-icon"><Icon size={17} /></div>
                            <div>
                                <div className="login-feature-title">{title}</div>
                                <div className="login-feature-desc">{desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right form panel */}
            <div className="login-right">
                <div className="login-box">
                    <div className="login-box-title">Welcome back</div>
                    <div className="login-box-sub">Sign in to access the admin dashboard.</div>

                    {error && (
                        <div className="notice notice-error" style={{ marginBottom: 20 }}>
                            <Shield size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                            {error}
                        </div>
                    )}

                    <form className="login-form" onSubmit={handleLogin}>
                        <div className="form-field">
                            <label className="form-label">Username</label>
                            <input
                                className="input input-lg"
                                placeholder="e.g. admin"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required autoFocus autoComplete="username"
                            />
                        </div>

                        <div className="form-field">
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    className="input input-lg"
                                    type={showPw ? 'text' : 'password'}
                                    placeholder="Your password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
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

                        <button
                            type="submit" disabled={loading}
                            className="btn btn-primary btn-lg btn-full"
                            style={{ marginTop: 4, justifyContent: 'center' }}
                        >
                            {loading
                                ? <><Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> Signing in…</>
                                : <>Sign In <ArrowRight size={16} /></>
                            }
                        </button>
                    </form>

                    <div className="login-hint">
                        <strong>Default credentials</strong>
                        Username: <code style={{ background: 'var(--gray-100)', padding: '1px 5px', borderRadius: 4 }}>admin</code>
                        &nbsp;&nbsp; Password: <code style={{ background: 'var(--gray-100)', padding: '1px 5px', borderRadius: 4 }}>admin123</code>
                    </div>
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
