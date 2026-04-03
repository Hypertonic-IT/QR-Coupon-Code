'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import {
    QrCode, Users, IndianRupee, TrendingUp, Plus, Download,
    ArrowRight, Loader2, CheckCircle2, Clock, XCircle,
    Bell, Search, ChevronDown, ArrowUpRight, LogOut,
    Wallet, Ban, Activity, RefreshCw, ExternalLink,
    BarChart3, Zap, FileDown
} from 'lucide-react';

/* ─────────────────────── SVG Donut Chart ─────────────────────── */
function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
    const total = data.reduce((s, d) => s + d.value, 0);
    const r = 52, cx = 64, cy = 64, stroke = 14;
    const circ = 2 * Math.PI * r;
    let offset = 0;

    const segments = total === 0
        ? [{ label: 'Empty', color: '#f3f4f6', dash: circ, gap: 0 }]
        : data.map(d => {
            const dash = (d.value / total) * circ;
            const seg = { ...d, dash, gap: circ - dash, offset };
            offset += dash;
            return seg;
        });

    return (
        <svg width={128} height={128} viewBox="0 0 128 128" style={{ display: 'block' }}>
            {total === 0 ? (
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
            ) : (
                segments.map((s: any, i) => (
                    <circle
                        key={i} cx={cx} cy={cy} r={r}
                        fill="none" stroke={s.color} strokeWidth={stroke}
                        strokeDasharray={`${s.dash} ${s.gap}`}
                        strokeDashoffset={-s.offset}
                        strokeLinecap="butt"
                        style={{ transform: 'rotate(-90deg)', transformOrigin: '64px 64px' }}
                    />
                ))
            )}
            {/* Center */}
            <circle cx={cx} cy={cy} r={r - stroke / 2 - 2} fill="white" />
            <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="800" fill="#111827" fontFamily="Inter, sans-serif">
                {total}
            </text>
            <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fontWeight="600" fill="#9ca3af" fontFamily="Inter, sans-serif">
                TOTAL
            </text>
        </svg>
    );
}

/* ─────────────────────── Main Dashboard ─────────────────────── */
export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [profileOpen, setProfileOpen] = useState(false);
    const [searching, setSearching] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const now = new Date();
    const hr = now.getHours();
    const greeting = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
    const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(r => { if (r.status === 401) { router.push('/admin/login'); throw new Error(); } return r.json(); })
            .then(d => setStats(d))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        router.push('/admin/login');
    };

    const available = (stats?.totalQRs ?? 0) - (stats?.usedQRs ?? 0);
    const conversion = stats?.totalQRs > 0 ? ((stats.usedQRs / stats.totalQRs) * 100).toFixed(1) : '0.0';

    const claimData = [
        { label: 'Pending', value: stats?.pendingCount ?? 0, color: '#f59e0b' },
        { label: 'Approved', value: stats?.approvedCount ?? 0, color: '#10b981' },
        { label: 'Paid', value: stats?.paidCount ?? 0, color: '#3b82f6' },
        { label: 'Rejected', value: stats?.rejectedCount ?? 0, color: '#ef4444' },
    ];

    const statusBadge: Record<string, { label: string; bg: string; color: string; dot: string }> = {
        PENDING: { label: 'Pending', bg: '#fffbeb', color: '#92400e', dot: '#f59e0b' },
        APPROVED: { label: 'Approved', bg: '#ecfdf5', color: '#065f46', dot: '#10b981' },
        PAID: { label: 'Paid', bg: '#eff6ff', color: '#1e40af', dot: '#3b82f6' },
        REJECTED: { label: 'Rejected', bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' },
    };

    /* ── Shell ── */
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6fb', fontFamily: "'Inter', system-ui, sans-serif" }}>
            <Sidebar />

            <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

                {/* ══════════════ TOPBAR ══════════════ */}
                <div style={{
                    height: 60, background: '#fff',
                    borderBottom: '1px solid #e5e7eb',
                    padding: '0 24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    position: 'sticky', top: 0, zIndex: 200,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                    gap: 16, flexShrink: 0,
                }}>
                    {/* Left: Title */}
                    <div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>Dashboard</div>
                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 1 }}>{dateStr}</div>
                    </div>

                    {/* Center: Search */}
                    <div style={{
                        flex: 1, maxWidth: 360,
                        position: 'relative',
                    }}>
                        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            placeholder="Search QR codes, claims…"
                            onFocus={() => setSearching(true)}
                            onBlur={() => setSearching(false)}
                            style={{
                                width: '100%', height: 36,
                                paddingLeft: 34, paddingRight: 12,
                                background: '#f9fafb',
                                border: `1px solid ${searching ? '#6366f1' : '#e5e7eb'}`,
                                borderRadius: 8,
                                fontSize: '0.82rem', color: '#374151',
                                outline: 'none',
                                boxShadow: searching ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none',
                                transition: 'all 0.15s ease',
                            }}
                        />
                    </div>

                    {/* Right: Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        {/* Notification Bell */}
                        <button style={{
                            width: 36, height: 36, borderRadius: 8,
                            background: '#f9fafb', border: '1px solid #e5e7eb',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: '#6b7280', position: 'relative',
                        }}>
                            <Bell size={15} />
                            {(stats?.pendingCount ?? 0) > 0 && (
                                <div style={{
                                    position: 'absolute', top: 7, right: 7,
                                    width: 7, height: 7, borderRadius: '50%',
                                    background: '#ef4444', border: '1.5px solid #fff',
                                }} />
                            )}
                        </button>

                        {/* Refresh */}
                        <button
                            onClick={() => { setLoading(true); fetch('/api/admin/stats').then(r => r.json()).then(d => setStats(d)).finally(() => setLoading(false)); }}
                            style={{
                                width: 36, height: 36, borderRadius: 8,
                                background: '#f9fafb', border: '1px solid #e5e7eb',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: '#6b7280',
                            }}
                            title="Refresh"
                        >
                            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                        </button>

                        {/* Divider */}
                        <div style={{ width: 1, height: 24, background: '#e5e7eb', margin: '0 4px' }} />

                        {/* Profile Dropdown */}
                        <div style={{ position: 'relative' }} ref={profileRef}>
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    background: profileOpen ? '#f9fafb' : 'transparent',
                                    border: '1px solid', borderColor: profileOpen ? '#e5e7eb' : 'transparent',
                                    borderRadius: 8, padding: '4px 8px 4px 4px',
                                    cursor: 'pointer', transition: 'all 0.15s ease',
                                }}
                            >
                                <div style={{
                                    width: 28, height: 28, borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.75rem', fontWeight: 800, color: 'white', flexShrink: 0,
                                }}>A</div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>Admin</div>
                                    <div style={{ fontSize: '0.65rem', color: '#9ca3af', lineHeight: 1 }}>Super Admin</div>
                                </div>
                                <ChevronDown size={13} color="#9ca3af" style={{ transform: profileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
                            </button>

                            {profileOpen && (
                                <div style={{
                                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                                    background: '#fff', border: '1px solid #e5e7eb',
                                    borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                                    minWidth: 180, zIndex: 9999, overflow: 'hidden',
                                }}>
                                    <div style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6' }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111827' }}>Administrator</div>
                                        <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>admin@cashbackqr.com</div>
                                    </div>
                                    <button onClick={handleLogout} style={{
                                        width: '100%', padding: '10px 14px',
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        fontSize: '0.82rem', color: '#dc2626', fontWeight: 600,
                                        textAlign: 'left',
                                    }}>
                                        <LogOut size={14} /> Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ══════════════ PAGE CONTENT ══════════════ */}
                <div style={{ padding: '24px', flex: 1, maxWidth: '100%', overflow: 'hidden' }}>

                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 14 }}>
                            <Loader2 size={32} color="#4f46e5" style={{ animation: 'spin 1s linear infinite' }} />
                            <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Loading dashboard…</span>
                        </div>
                    ) : (
                        <>

                            {/* ══ A. HERO DECISION PANEL ══ */}
                            <div style={{
                                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 35%, #4338ca 70%, #6d28d9 100%)',
                                borderRadius: 20,
                                padding: '28px 32px',
                                marginBottom: 24,
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                gap: 24, flexWrap: 'wrap',
                                position: 'relative', overflow: 'hidden',
                                boxShadow: '0 12px 40px rgba(67,56,202,0.3)',
                            }}>
                                {/* Orbs */}
                                <div style={{ position: 'absolute', width: 400, height: 400, background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 65%)', right: -80, top: -120, borderRadius: '50%', pointerEvents: 'none' }} />
                                <div style={{ position: 'absolute', width: 200, height: 200, background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 65%)', left: 200, bottom: -60, borderRadius: '50%', pointerEvents: 'none' }} />

                                {/* Left: Greeting + Stats */}
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(199,210,254,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                                        👋 {greeting}
                                    </div>
                                    <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', margin: '0 0 16px', lineHeight: 1.1 }}>
                                        Administrator
                                    </h1>

                                    {/* Quick stats pills */}
                                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                        {[
                                            { icon: QrCode, label: `${available} Coupons Available`, bg: 'rgba(99,102,241,0.25)', border: 'rgba(165,180,252,0.3)' },
                                            { icon: Clock, label: `${stats?.pendingCount ?? 0} Claims Pending`, bg: 'rgba(245,158,11,0.2)', border: 'rgba(253,230,138,0.3)' },
                                            { icon: IndianRupee, label: `₹${stats?.totalPayout ?? 0} Total Payout`, bg: 'rgba(16,185,129,0.2)', border: 'rgba(110,231,183,0.3)' },
                                        ].map(({ icon: Icon, label, bg, border }) => (
                                            <div key={label} style={{
                                                display: 'flex', alignItems: 'center', gap: 7,
                                                background: bg, border: `1px solid ${border}`,
                                                borderRadius: 8, padding: '6px 12px',
                                                fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)',
                                            }}>
                                                <Icon size={13} />{label}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right: Primary CTAs */}
                                <div style={{ display: 'flex', gap: 12, flexShrink: 0, position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
                                    <Link href="/admin/submissions" style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 8,
                                        background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
                                        border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
                                        borderRadius: 12, padding: '12px 20px',
                                        fontSize: '0.88rem', fontWeight: 700, textDecoration: 'none',
                                        transition: 'background 0.15s ease',
                                    }}>
                                        <Users size={16} /> Review Claims
                                        {(stats?.pendingCount ?? 0) > 0 && (
                                            <span style={{ background: '#ef4444', color: '#fff', borderRadius: 999, padding: '1px 7px', fontSize: '0.7rem', fontWeight: 800 }}>
                                                {stats.pendingCount}
                                            </span>
                                        )}
                                    </Link>
                                    <Link href="/admin/qr" style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 8,
                                        background: '#fff', color: '#4338ca',
                                        border: '1px solid rgba(255,255,255,0.4)',
                                        borderRadius: 12, padding: '12px 20px',
                                        fontSize: '0.88rem', fontWeight: 800, textDecoration: 'none',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                    }}>
                                        <Plus size={16} /> Generate QR Codes
                                    </Link>
                                </div>
                            </div>

                            {/* ══ B. KPI CARDS ══ */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
                                {[
                                    {
                                        icon: QrCode, label: 'Total QR Codes', value: stats?.totalQRs ?? 0,
                                        trend: stats?.totalQRs > 0 ? `${stats.totalQRs} generated` : 'None yet',
                                        trendUp: (stats?.totalQRs ?? 0) > 0,
                                        iconBg: '#eef2ff', iconColor: '#4f46e5',
                                        bar: 'linear-gradient(90deg, #6366f1, #818cf8)',
                                        sub: 'Generated since launch',
                                    },
                                    {
                                        icon: CheckCircle2, label: 'Claimed', value: stats?.usedQRs ?? 0,
                                        trend: `${conversion}% conversion`,
                                        trendUp: parseFloat(conversion) > 0,
                                        iconBg: '#ecfdf5', iconColor: '#059669',
                                        bar: 'linear-gradient(90deg, #10b981, #34d399)',
                                        sub: 'Total redeemed',
                                    },
                                    {
                                        icon: IndianRupee, label: 'Total Payout', value: `₹${stats?.totalPayout ?? 0}`,
                                        trend: (stats?.totalPayout ?? 0) > 0 ? 'Disbursed' : 'No activity yet',
                                        trendUp: (stats?.totalPayout ?? 0) > 0,
                                        iconBg: '#fff1f2', iconColor: '#e11d48',
                                        bar: 'linear-gradient(90deg, #f43f5e, #fb7185)',
                                        sub: 'Combined value redeemed',
                                    },
                                    {
                                        icon: TrendingUp, label: 'Available', value: available,
                                        trend: available > 0 ? 'Ready to distribute' : 'Generate more',
                                        trendUp: available > 0,
                                        iconBg: '#fffbeb', iconColor: '#d97706',
                                        bar: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                                        sub: 'Coupons not yet claimed',
                                    },
                                ].map(({ icon: Icon, label, value, trend, trendUp, iconBg, iconColor, bar, sub }) => (
                                    <div key={label} style={{
                                        background: '#fff', border: '1px solid #e5e7eb',
                                        borderRadius: 16, padding: '0 20px 18px', overflow: 'hidden',
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                                        transition: 'box-shadow 0.18s, transform 0.18s',
                                        cursor: 'default',
                                    }}
                                        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 8px 28px rgba(0,0,0,0.1)'; el.style.transform = 'translateY(-2px)'; }}
                                        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; el.style.transform = 'none'; }}
                                    >
                                        {/* Accent bar */}
                                        <div style={{ height: 3, background: bar, borderRadius: '16px 16px 0 0', margin: '0 -20px 18px', marginLeft: -20, marginRight: -20 }} />

                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                                            <div style={{ fontSize: '0.67rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.09em' }}>{label}</div>
                                            <div style={{ width: 36, height: 36, borderRadius: 9, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor, flexShrink: 0, marginTop: -4 }}>
                                                <Icon size={17} />
                                            </div>
                                        </div>

                                        <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#111827', letterSpacing: '-0.05em', lineHeight: 1, marginBottom: 6 }}>{value}</div>
                                        <div style={{ fontSize: '0.73rem', color: '#9ca3af', marginBottom: 8 }}>{sub}</div>

                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 99, background: trendUp ? '#ecfdf5' : '#f9fafb', color: trendUp ? '#059669' : '#9ca3af', fontSize: '0.7rem', fontWeight: 700 }}>
                                            {trendUp ? '↑' : '—'} {trend}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* ══ C. CHART ROW + QUICK ACTIONS ══ */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>

                                {/* Claims Donut Chart */}
                                <div style={{
                                    background: '#fff', border: '1px solid #e5e7eb',
                                    borderRadius: 16, overflow: 'hidden',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                                }}>
                                    <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827' }}>Claims Overview</div>
                                            <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 2 }}>Status breakdown of all submissions</div>
                                        </div>
                                        <Link href="/admin/submissions" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '0.72rem', fontWeight: 600, color: '#4f46e5', textDecoration: 'none' }}>
                                            View all <ArrowRight size={11} />
                                        </Link>
                                    </div>
                                    <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 24 }}>
                                        <DonutChart data={claimData} />
                                        <div style={{ flex: 1 }}>
                                            {claimData.map(({ label, value, color }) => (
                                                <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                                                        <span style={{ fontSize: '0.82rem', color: '#374151', fontWeight: 500 }}>{label}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <div style={{ height: 5, width: 60, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                                                            <div style={{ height: '100%', background: color, borderRadius: 99, width: `${(stats?.pendingCount + stats?.approvedCount + stats?.paidCount + stats?.rejectedCount) > 0 ? (value / (stats?.pendingCount + stats?.approvedCount + stats?.paidCount + stats?.rejectedCount)) * 100 : 0}%`, transition: 'width 0.6s ease' }} />
                                                        </div>
                                                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#111827', minWidth: 20, textAlign: 'right' }}>{value}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Conversion + Quick Stats card */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                                    {/* Conversion Rate */}
                                    <div style={{
                                        background: '#fff', border: '1px solid #e5e7eb',
                                        borderRadius: 16, padding: '18px 20px',
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                                        flex: 1,
                                    }}>
                                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111827', marginBottom: 4 }}>Conversion Rate</div>
                                        <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: 16 }}>QR codes claimed vs generated</div>

                                        {/* Progress bar */}
                                        <div style={{ marginBottom: 12 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                                <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Claimed</span>
                                                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#4f46e5' }}>{conversion}%</span>
                                            </div>
                                            <div style={{ height: 8, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                                                <div style={{
                                                    height: '100%', borderRadius: 99,
                                                    background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                                                    width: `${conversion}%`,
                                                    transition: 'width 0.8s ease',
                                                    boxShadow: '0 1px 4px rgba(99,102,241,0.4)',
                                                }} />
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#4f46e5' }}>{stats?.usedQRs ?? 0}</div>
                                                <div style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Claimed</div>
                                            </div>
                                            <div style={{ width: 1, background: '#f3f4f6' }} />
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#111827' }}>{available}</div>
                                                <div style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available</div>
                                            </div>
                                            <div style={{ width: 1, background: '#f3f4f6' }} />
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#111827' }}>{stats?.totalQRs ?? 0}</div>
                                                <div style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Actions — compact */}
                                    <div style={{
                                        background: '#fff', border: '1px solid #e5e7eb',
                                        borderRadius: 16, padding: '16px 20px',
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                                    }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 12 }}>
                                            ⚡ Quick Actions
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            {[
                                                { href: '/admin/qr', icon: Plus, label: 'Generate QR', primary: true, external: false },
                                                { href: '/admin/submissions', icon: Users, label: 'Review Claims', primary: false, external: false },
                                                { href: '/api/admin/export-csv', icon: FileDown, label: 'Export CSV', primary: false, external: true },
                                            ].map(({ href, icon: Icon, label, primary, external }) => {
                                                const style = {
                                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                                    padding: '7px 14px', borderRadius: 8,
                                                    fontSize: '0.8rem', fontWeight: 700,
                                                    cursor: 'pointer', textDecoration: 'none',
                                                    transition: 'all 0.15s ease',
                                                    border: '1px solid',
                                                    ...(primary
                                                        ? { background: '#4f46e5', color: '#fff', borderColor: '#4f46e5', boxShadow: '0 2px 6px rgba(79,70,229,0.3)' }
                                                        : { background: '#f9fafb', color: '#374151', borderColor: '#e5e7eb' }
                                                    ),
                                                };
                                                if (external) return <a key={label} href={href} target="_blank" rel="noreferrer" style={style}><Icon size={14} />{label}</a>;
                                                return <Link key={label} href={href} style={style}><Icon size={14} />{label}</Link>;
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ══ D. RECENT CLAIMS TABLE ══ */}
                            <div style={{
                                background: '#fff', border: '1px solid #e5e7eb',
                                borderRadius: 16, overflow: 'hidden',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                            }}>
                                <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827' }}>Recent Claims</div>
                                        <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 2 }}>Latest submissions from users</div>
                                    </div>
                                    <Link href="/admin/submissions" style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 5,
                                        background: '#f9fafb', border: '1px solid #e5e7eb',
                                        borderRadius: 8, padding: '6px 12px',
                                        fontSize: '0.78rem', fontWeight: 600, color: '#374151',
                                        textDecoration: 'none',
                                    }}>
                                        View all <ArrowRight size={13} />
                                    </Link>
                                </div>

                                {(!stats?.recentClaims || stats.recentClaims.length === 0) ? (
                                    <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                                        <div style={{ width: 48, height: 48, background: '#f3f4f6', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: '#9ca3af' }}>
                                            <Users size={22} />
                                        </div>
                                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#374151', marginBottom: 4 }}>No claims yet</div>
                                        <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>When users submit claims, they'll appear here.</div>
                                    </div>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ background: '#f9fafb' }}>
                                                    {['User', 'Mobile', 'QR Code', 'Amount', 'Status', 'Date', 'Action'].map(h => (
                                                        <th key={h} style={{ padding: '9px 16px', fontSize: '0.67rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stats.recentClaims.map((claim: any, i: number) => {
                                                    const badge = statusBadge[claim.status] ?? { label: claim.status, bg: '#f3f4f6', color: '#374151', dot: '#9ca3af' };
                                                    return (
                                                        <tr key={claim._id} style={{ borderBottom: i < stats.recentClaims.length - 1 ? '1px solid #f3f4f6' : 'none', transition: 'background 0.12s' }}
                                                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fafafa'}
                                                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                                                        >
                                                            <td style={{ padding: '12px 16px' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                                                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>
                                                                        {claim.name?.charAt(0)?.toUpperCase() || '?'}
                                                                    </div>
                                                                    <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#111827' }}>{claim.name}</span>
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: '#6b7280' }}>{claim.mobile}</td>
                                                            <td style={{ padding: '12px 16px' }}>
                                                                <span style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 5, padding: '2px 7px', fontSize: '0.76rem', fontWeight: 700, color: '#4f46e5', fontFamily: 'monospace' }}>
                                                                    {claim.qrCoupon?.uniqueCode || '—'}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '12px 16px', fontSize: '0.88rem', fontWeight: 800, color: '#111827' }}>₹{claim.qrCoupon?.value || 0}</td>
                                                            <td style={{ padding: '12px 16px' }}>
                                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: badge.bg, color: badge.color, borderRadius: 99, padding: '3px 9px', fontSize: '0.7rem', fontWeight: 700 }}>
                                                                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: badge.dot }} />
                                                                    {badge.label}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: '#9ca3af' }}>
                                                                {new Date(claim.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                            </td>
                                                            <td style={{ padding: '12px 16px' }}>
                                                                <Link href="/admin/submissions" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', fontWeight: 600, color: '#4f46e5', textDecoration: 'none', background: '#eef2ff', borderRadius: 6, padding: '4px 10px' }}>
                                                                    Review <ArrowUpRight size={12} />
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                        </>
                    )}
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
