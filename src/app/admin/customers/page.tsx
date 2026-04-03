'use client';
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import {
    Check, X, CreditCard, Image as ImageIcon, Loader2,
    ExternalLink, RefreshCw, Download, Users
} from 'lucide-react';

const STATUS_MAP: Record<string, { cls: string; label: string }> = {
    PENDING: { cls: 'badge-amber', label: 'Pending' },
    APPROVED: { cls: 'badge-green', label: 'Approved' },
    PAID: { cls: 'badge-blue', label: 'Paid' },
    REJECTED: { cls: 'badge-red', label: 'Rejected' },
};

export default function Customers() {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => { fetchSubmissions(); }, []);

    const fetchSubmissions = async () => {
        setLoading(true);
        try { const res = await fetch('/api/admin/submissions'); setSubmissions((await res.json()) || []); }
        finally { setLoading(false); }
    };

    const handleStatus = async (id: string, status: string) => {
        setUpdating(id);
        await fetch(`/api/admin/submissions/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        await fetchSubmissions();
        setUpdating(null);
    };

    const counts: Record<string, number> = { ALL: submissions.length, PENDING: 0, APPROVED: 0, PAID: 0, REJECTED: 0 };
    submissions.forEach(s => { if (counts[s.status] !== undefined) counts[s.status]++; });
    const filtered = filter === 'ALL' ? submissions : submissions.filter(s => s.status === filter);

    return (
        <div className="admin-shell">
            <Sidebar />
            <div className="main-content">

                {/* Topbar */}
                <div className="topbar">
                    <div className="topbar-left">
                        <div className="topbar-title">Customers</div>
                        <div className="topbar-sub">Review and process customer cashback claims</div>
                    </div>
                    <div className="topbar-right">
                        <a href="/api/admin/export-csv" target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                            <Download size={13} /> Export CSV
                        </a>
                        <button className="btn btn-primary btn-sm" onClick={fetchSubmissions}>
                            <RefreshCw size={13} /> Refresh
                        </button>
                    </div>
                </div>

                <div className="page">

                    {/* Filter Tabs */}
                    <div className="filter-tabs" style={{ marginBottom: 16 }}>
                        {(['ALL', 'PENDING', 'APPROVED', 'PAID', 'REJECTED'] as const).map(tab => (
                            <button key={tab} className={`filter-tab${filter === tab ? ' active' : ''}`} onClick={() => setFilter(tab)}>
                                {tab === 'ALL' ? 'All Claims' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                                <span className="tab-count">{counts[tab]}</span>
                            </button>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="tbl-card">
                        <div className="tbl-header">
                            <span className="tbl-title">Claims</span>
                            <span className="tbl-count">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="tbl-wrap">
                            {loading ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px', gap: 10, color: 'var(--text-4)' }}>
                                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', color: 'var(--brand-600)' }} /> Loading…
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="tbl-empty">
                                    <div className="tbl-empty-icon"><Users size={22} /></div>
                                    <div className="tbl-empty-title">No customers found</div>
                                    <div className="tbl-empty-desc">
                                        {filter !== 'ALL' ? `No ${filter.toLowerCase()} claims yet.` : 'No customers have submitted claims yet.'}
                                    </div>
                                </div>
                            ) : (
                                <table>
                                    <thead><tr>
                                        <th>Customer</th>
                                        <th>Payment Details</th>
                                        <th>QR Code</th>
                                        <th>Amount</th>
                                        <th>Proof</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr></thead>
                                    <tbody>
                                        {filtered.map(sub => {
                                            const statusInfo = STATUS_MAP[sub.status] || { cls: 'badge-gray', label: sub.status };
                                            return (
                                                <tr key={sub._id}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                            <div style={{
                                                                width: 32, height: 32, borderRadius: '50%',
                                                                background: 'var(--brand-100)', color: 'var(--brand-700)',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                fontSize: '0.78rem', fontWeight: 800, flexShrink: 0
                                                            }}>
                                                                {sub.name?.charAt(0)?.toUpperCase() || '?'}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-1)' }}>{sub.name}</div>
                                                                <div style={{ fontSize: '0.73rem', color: 'var(--text-4)' }}>{sub.mobile}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--brand-600)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                                                            {sub.accountType?.replace('_', ' ')}
                                                        </div>
                                                        <code style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>{sub.accountValue}</code>
                                                    </td>
                                                    <td><span className="chip">{sub.qrCoupon?.uniqueCode || '—'}</span></td>
                                                    <td style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-1)' }}>
                                                        ₹{sub.qrCoupon?.value || 0}
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${statusInfo.cls}`}>
                                                            <span className="badge-dot" />{statusInfo.label}
                                                        </span>
                                                    </td>
                                                    <td style={{ color: 'var(--text-4)', fontSize: '0.78rem' }}>
                                                        {new Date(sub.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: 5 }}>
                                                            {sub.status === 'PENDING' && (
                                                                <>
                                                                    <button className="btn btn-success btn-sm" title="Approve"
                                                                        onClick={() => handleStatus(sub._id, 'APPROVED')}
                                                                        disabled={updating === sub._id}>
                                                                        {updating === sub._id
                                                                            ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                                                                            : <><Check size={13} /> Approve</>
                                                                        }
                                                                    </button>
                                                                    <button className="btn btn-danger btn-sm" title="Reject"
                                                                        onClick={() => handleStatus(sub._id, 'REJECTED')}
                                                                        disabled={updating === sub._id}>
                                                                        <X size={13} />
                                                                    </button>
                                                                </>
                                                            )}
                                                            {sub.status === 'APPROVED' && (
                                                                <button className="btn btn-primary btn-sm"
                                                                    onClick={() => handleStatus(sub._id, 'PAID')}
                                                                    disabled={updating === sub._id}>
                                                                    {updating === sub._id
                                                                        ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                                                                        : <><CreditCard size={13} /> Mark Paid</>
                                                                    }
                                                                </button>
                                                            )}
                                                            {(sub.status === 'PAID' || sub.status === 'REJECTED') && (
                                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-4)', padding: '0 4px' }}>—</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    );
}
