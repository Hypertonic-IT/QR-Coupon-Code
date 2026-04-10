'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { Sparkles, QrCode, Zap, CheckCircle2, Loader2, ArrowLeft, Clock, Printer } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';

export default function GenerateQRCodes() {
    const [generating, setGenerating] = useState(false);
    const [count, setCount] = useState(10);
    const [value, setValue] = useState(50);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const [latestQrs, setLatestQrs] = useState<any[]>([]);
    const [loadingLatest, setLoadingLatest] = useState(true);
    const [lastBatch, setLastBatch] = useState<any[]>([]);
    const [origin, setOrigin] = useState('https://cashbackqr.app');

    const loadLatest = async () => {
        setLoadingLatest(true);
        try {
            const res = await fetch('/api/admin/qr');
            if (res.ok) {
                const data = await res.json();
                const sorted = data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setLatestQrs(sorted.slice(0, 10));
            }
        } finally {
            setLoadingLatest(false);
        }
    };

    useEffect(() => {
        loadLatest();
        if (typeof window !== 'undefined') {
            const loc = window.location.origin;
            if (loc.includes('localhost')) {
                setOrigin(`http://192.168.10.78:${window.location.port || '3000'}`);
            } else {
                setOrigin(loc);
            }
        }
    }, []);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setGenerating(true);
        setSuccess(null);
        setError(null);

        try {
            const res = await fetch('/api/admin/qr/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count, value }),
            });
            if (res.ok) {
                const data = await res.json();
                setSuccess(`Success! ${count} coupons worth ₹${value} each have been generated.`);
                setLastBatch(data.created || []);
                loadLatest();
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to generate QR codes.');
            }
        } catch (err) {
            setError('An error occurred while generating coupons over the network.');
        } finally {
            setGenerating(false);
        }
    };

    const [printFormat, setPrintFormat] = useState('grid');
    const handlePrint = (items: any[], type: string) => {
        if (!items.length) return;
        const win = window.open('');
        if (!win) return;

        let styles = '';
        if (type === 'grid') {
            styles = `
                body { font-family: sans-serif; text-align: center; margin: 0; padding: 20px; box-sizing: border-box; }
                .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 30px; justify-items: center; }
                .item { break-inside: avoid; display: flex; flex-direction: column; align-items: center; border: 2px dashed #e2e8f0; padding: 20px; border-radius: 16px; width: 100%; box-sizing: border-box; }
                img { width: 100%; height: auto; max-width: 140px; }
                p { font-size: 18px; font-weight: 900; margin: 12px 0 6px; color: #0f172a; }
                .val { margin: 0; color: #166534; font-weight: 800; background: #f0fdf4; padding: 6px 12px; border-radius: 8px; font-size: 16px; border: 1px solid #bbf7d0; }
            `;
        } else if (type === 'mini') {
            styles = `
                body { font-family: sans-serif; text-align: center; margin: 0; padding: 10px; }
                .grid { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
                .item { break-inside: avoid; display: flex; flex-direction: column; align-items: center; border: 1px solid #cbd5e1; padding: 8px; border-radius: 8px; width: 90px; box-sizing: border-box; }
                img { width: 100%; height: auto; max-width: 70px; }
                p { font-size: 11px; font-weight: 800; margin: 6px 0 4px; color: #0f172a; }
                .val { margin: 0; color: #166534; font-weight: 800; background: #f0fdf4; padding: 2px 6px; border-radius: 4px; font-size: 10px; border: 1px solid #bbf7d0; }
            `;
        } else if (type === 'single') {
            styles = `
                body { font-family: sans-serif; text-align: center; margin: 0; padding: 0; }
                .grid { display: block; }
                .item { break-inside: avoid; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; page-break-after: always; padding: 40px; box-sizing: border-box; }
                img { width: 60%; height: auto; max-width: 500px; }
                p { font-size: 48px; font-weight: 900; margin: 24px 0 12px; color: #0f172a; letter-spacing: 0.1em; }
                .val { margin: 0; color: #166534; font-weight: 900; background: #f0fdf4; padding: 16px 32px; border-radius: 16px; font-size: 40px; border: 3px solid #bbf7d0; }
            `;
        }

        let htmlSnippet = `<html><head><title>Print Coupons</title><style>${styles}</style></head><body><div class="grid">`;

        items.forEach(qData => {
            const canvas = document.getElementById(`qr-batch-${qData._id}`) as HTMLCanvasElement;
            if (canvas && qData) {
                const url = canvas.toDataURL('image/png');
                htmlSnippet += `<div class="item"><img src="${url}" /><p>${qData.uniqueCode}</p><div class="val">₹${qData.value}</div></div>`;
            }
        });
        htmlSnippet += `</div><script>setTimeout(function() { window.print(); window.close(); }, 800);</script></body></html>`;
        win.document.write(htmlSnippet);
        win.document.close();
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Inter', system-ui, sans-serif" }}>
            <Sidebar />
            <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

                {/* TOPBAR */}
                <div style={{
                    height: 62, background: '#fff', borderBottom: '1px solid #e5e7eb',
                    padding: '0 28px', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 200,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', gap: 16,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Link href="/admin/qr" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, background: '#f1f5f9', color: '#64748b', borderRadius: 8, transition: 'background 0.2s' }}>
                            <ArrowLeft size={18} />
                        </Link>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(79,70,229,0.35)' }}>
                            <Sparkles size={19} color="white" />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em' }}>Generate Codes</div>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 1 }}>Create new cashback coupons in bulk</div>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '40px 28px', flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '100%', maxWidth: 700 }}>
                        <div style={{ background: 'linear-gradient(140deg,#0f0c29 0%,#302b63 45%,#24243e 100%)', borderRadius: 20, marginBottom: 22, position: 'relative', overflow: 'hidden', boxShadow: '0 16px 48px rgba(15,12,41,0.4)' }}>
                            <div style={{ position: 'absolute', top: -100, right: -80, width: 360, height: 360, background: 'radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
                            <div style={{ position: 'absolute', bottom: -60, left: -40, width: 220, height: 220, background: 'radial-gradient(circle,rgba(139,92,246,0.12) 0%,transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
                            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />

                            <div style={{ position: 'relative', zIndex: 1, padding: '40px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                                    <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Sparkles size={26} color="#a5b4fc" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.025em' }}>Bulk Generator</div>
                                        <div style={{ fontSize: '0.9rem', color: 'rgba(165,180,252,0.6)', marginTop: 4 }}>Create secure batches of QR coupons instantly.</div>
                                    </div>
                                </div>

                                {success && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 12, padding: '14px 20px', marginBottom: 24, animation: 'fadeIn 0.3s' }}>
                                        <CheckCircle2 size={18} color="#6ee7b7" />
                                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#6ee7b7' }}>{success}</span>
                                    </div>
                                )}

                                {error && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 12, padding: '14px 20px', fontSize: '0.9rem', fontWeight: 600, color: '#fca5a5', marginBottom: 24 }}>
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleGenerate}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 20, marginBottom: 30 }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(165,180,252,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Quantity (Max 500)</label>
                                            <div style={{ position: 'relative' }}>
                                                <input type="number" value={count} min={1} max={500} onChange={e => setCount(parseInt(e.target.value) || 1)}
                                                    style={{ width: '100%', height: 54, boxSizing: 'border-box', paddingLeft: 46, paddingRight: 16, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, fontSize: '1.1rem', fontWeight: 700, color: '#fff', outline: 'none', transition: 'all 0.2s' }}
                                                    onFocus={e => { e.target.style.borderColor = 'rgba(165,180,252,0.6)'; e.target.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.2)'; }}
                                                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; e.target.style.boxShadow = 'none'; }}
                                                />
                                                <QrCode size={18} color="rgba(165,180,252,0.5)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(165,180,252,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Cashback Value (₹)</label>
                                            <div style={{ position: 'relative' }}>
                                                <input type="number" value={value} min={1} onChange={e => setValue(parseInt(e.target.value) || 1)}
                                                    style={{ width: '100%', height: 54, boxSizing: 'border-box', paddingLeft: 46, paddingRight: 16, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, fontSize: '1.1rem', fontWeight: 700, color: '#fff', outline: 'none', transition: 'all 0.2s' }}
                                                    onFocus={e => { e.target.style.borderColor = 'rgba(165,180,252,0.6)'; e.target.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.2)'; }}
                                                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; e.target.style.boxShadow = 'none'; }}
                                                />
                                                <span style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', color: 'rgba(165,180,252,0.5)', fontWeight: 700, pointerEvents: 'none' }}>₹</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 28 }}>
                                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span style={{ fontSize: '0.8rem', color: 'rgba(165,180,252,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Value:</span>
                                            <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#c7d2fe' }}>₹{(count * value).toLocaleString('en-IN')}</span>
                                        </div>

                                        <button type="submit" disabled={generating} style={{ height: 54, padding: '0 32px', background: generating ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: generating ? 'rgba(255,255,255,0.4)' : '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, cursor: generating ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10, boxShadow: generating ? 'none' : '0 8px 24px rgba(99,102,241,0.4)', transition: 'all 0.2s' }}>
                                            {generating ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Generating…</> : <><Zap size={18} /> Generate Coupons</>}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* CURRENT BATCH SEPARATION TABLE */}
                        {lastBatch.length > 0 && (
                            <div style={{ marginTop: 40, background: '#fff', borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '2px solid #10b981', overflow: 'hidden', animation: 'fadeIn 0.4s' }}>
                                <div style={{ padding: '20px 24px', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <CheckCircle2 size={18} color="#10b981" />
                                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#166534', margin: 0 }}>Successfully Generated</h3>
                                        <span style={{ background: '#166534', color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 800 }}>{lastBatch.length} Codes</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <select title="Print Format" value={printFormat} onChange={(e) => setPrintFormat(e.target.value)} style={{ height: 36, padding: '0 12px', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 8, background: '#f0fdf4', color: '#166534', fontWeight: 700, outline: 'none', cursor: 'pointer' }}>
                                            <option value="grid">Grid (Standard)</option>
                                            <option value="mini">Mini Stickers</option>
                                            <option value="single">Single Large</option>
                                        </select>
                                        <button type="button" onClick={() => handlePrint(lastBatch, printFormat)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 36, padding: '0 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(16,185,129,0.35)' }}>
                                            <Printer size={15} /> Print
                                        </button>
                                    </div>
                                </div>
                                <div style={{ maxHeight: 250, overflowY: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
                                            <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                <th style={{ padding: '12px 24px', fontWeight: 700 }}>QR Code</th>
                                                <th style={{ padding: '12px 24px', fontWeight: 700 }}>Value</th>
                                                <th style={{ padding: '12px 24px', fontWeight: 700 }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {lastBatch.map((qr) => (
                                                <tr key={`curr-${qr._id}`} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.86rem', color: '#334155' }}>
                                                    <td style={{ padding: '10px 24px', fontWeight: 700, fontFamily: 'monospace', color: '#166534' }}>{qr.uniqueCode}</td>
                                                    <td style={{ padding: '10px 24px', fontWeight: 700, color: '#10b981' }}>₹{qr.value}</td>
                                                    <td style={{ padding: '10px 24px' }}>
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 600, color: '#10b981' }}>
                                                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></span>
                                                            Ready
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* RECENTLY GENERATED TABLE */}
                        <div style={{ marginTop: 40, background: '#fff', borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Clock size={18} color="#4f46e5" />
                                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Latest Generated Entries</h3>
                            </div>

                            {loadingLatest ? (
                                <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
                                    <Loader2 size={24} color="#94a3b8" style={{ animation: 'spin 1s linear infinite' }} />
                                </div>
                            ) : latestQrs.length === 0 ? (
                                <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>No QR codes generated yet.</div>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            <th style={{ padding: '12px 24px', fontWeight: 700 }}>QR Code</th>
                                            <th style={{ padding: '12px 24px', fontWeight: 700 }}>Value</th>
                                            <th style={{ padding: '12px 24px', fontWeight: 700 }}>Date generated</th>
                                            <th style={{ padding: '12px 24px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {latestQrs.map((qr) => {
                                            const d = new Date(qr.createdAt);
                                            const isToday = new Date().toDateString() === d.toDateString();
                                            const timeStr = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
                                            const dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });

                                            return (
                                                <tr key={qr._id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.86rem', color: '#334155', transition: 'background 0.15s' }}>
                                                    <td style={{ padding: '14px 24px', fontWeight: 700, fontFamily: 'monospace', color: '#4f46e5' }}>{qr.uniqueCode}</td>
                                                    <td style={{ padding: '14px 24px', fontWeight: 700, color: '#16a34a' }}>₹{qr.value}</td>
                                                    <td style={{ padding: '14px 24px', color: '#64748b' }}>
                                                        {isToday ? (
                                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#0f172a', fontWeight: 600 }}>
                                                                <span style={{ background: '#eef2ff', color: '#4f46e5', padding: '2px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 800 }}>Today</span>
                                                                at {timeStr}
                                                            </span>
                                                        ) : (
                                                            <span>{dateStr} at {timeStr}</span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                                                        <button type="button" onClick={() => handlePrint([qr], 'grid')} style={{ width: 32, height: 32, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, color: '#475569', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }} title="Print Individual Tag">
                                                            <Printer size={14} />
                                                        </button>
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
            </div>

            {/* Hidden Canvases for Batch Printing */}
            <div style={{ display: 'none' }}>
                {Array.from(new Map([...lastBatch, ...latestQrs].map(qr => [qr._id, qr])).values()).map((qr: any) => (
                    <QRCodeCanvas key={`batch-${qr._id}`} id={`qr-batch-${qr._id}`} value={`${origin}/reward/${qr.uniqueCode}`} size={512} marginSize={2} />
                ))}
            </div>

            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: none; } }`}</style>
        </div>
    );
}
