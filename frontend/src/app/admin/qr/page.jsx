"use client";

import React, { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import {
  QrCode,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Loader2,
  Search,
  Download,
  Copy,
  Check,
  Layers,
  Trash2,
  Sparkles,
  AlertTriangle,
  X,
  DollarSign,
  XCircle,
  Printer,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";

/* ═══════════════════════════════════════════
   Copy Chip
═══════════════════════════════════════════ */
function CopyChip({ code }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
      title="Click to copy"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "#f5f3ff",
        border: "1px solid #ddd6fe",
        borderRadius: 7,
        padding: "4px 10px",
        fontSize: "0.8rem",
        fontWeight: 800,
        color: "#5b21b6",
        fontFamily: '"JetBrains Mono","Fira Code","Courier New",monospace',
        cursor: "pointer",
        transition: "all 0.15s",
        letterSpacing: "0.04em",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#ede9fe")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "#f5f3ff")}
    >
      {code}
      {copied ? (
        <Check size={11} color="#10b981" strokeWidth={3} />
      ) : (
        <Copy size={11} color="#a78bfa" />
      )}
    </button>
  );
}

function DeleteModal({ code, onConfirm, onCancel, loading }) {
  const isBulk = code.includes("selected");
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 18,
          padding: "28px 30px",
          maxWidth: 420,
          width: "90%",
          boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
          animation: "slideup 0.18s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 14,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              background: "#fff1f2",
              border: "1px solid #fecaca",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Trash2 size={20} color="#dc2626" />
          </div>
          <div>
            <div
              style={{
                fontSize: "1rem",
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: 4,
              }}
            >
              {isBulk ? "Delete Selected Coupons?" : "Delete Coupon?"}
            </div>
            <div
              style={{ fontSize: "0.83rem", color: "#64748b", lineHeight: 1.5 }}
            >
              This will permanently delete{" "}
              <span
                style={{
                  fontFamily: "monospace",
                  fontWeight: 700,
                  color: "#4f46e5",
                  background: "#eef2ff",
                  padding: "1px 6px",
                  borderRadius: 4,
                }}
              >
                {code}
              </span>
              . This action cannot be undone.
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              height: 38,
              padding: "0 18px",
              borderRadius: 9,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              fontSize: "0.84rem",
              fontWeight: 700,
              color: "#475569",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              height: 38,
              padding: "0 18px",
              borderRadius: 9,
              background: loading ? "#fca5a5" : "#dc2626",
              border: "none",
              fontSize: "0.84rem",
              fontWeight: 800,
              color: "#fff",
              cursor: loading ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 7,
              boxShadow: "0 2px 8px rgba(220,38,38,0.35)",
            }}
          >
            {loading ? (
              <Loader2
                size={14}
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              <Trash2 size={14} />
            )}
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   QR Management Page
═══════════════════════════════════════════ */
export default function QRManagement() {
  const [qrs, setQrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [count, setCount] = useState(10);
  const [value, setValue] = useState(50);
  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [statusLoading, setStatusLoading] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [previewQR, setPreviewQR] = useState(null);

  // Bulk Select State
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [showBulkExport, setShowBulkExport] = useState(false);
  const [bulkExporting, setBulkExporting] = useState(false);

  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);
  // Print / Export
  const [printSize, setPrintSize] = useState(512);

  const router = useRouter();

  const [origin, setOrigin] = useState("https://cashbackqr.app");

  useEffect(() => {
    loadQRs();
    if (typeof window !== "undefined") {
      const loc = window.location.origin;
      // Magic fix: If visiting via localhost, inject the actual LAN IP for mobile scanning to work
      if (loc.includes("localhost")) {
        setOrigin(`http://192.168.10.78:${window.location.port || "3000"}`);
      } else {
        setOrigin(loc);
      }
    }
  }, []);

  // Filter resets selection to avoid invisible selected items
  useEffect(() => {
    setSelectedIds(new Set());
  }, [filter, search]);

  const toast = (msg, type = "success") => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  };

  const loadQRs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/qr");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      setQrs((await res.json()) || []);
      setSelectedIds(new Set());
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/qr/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count, value }),
      });
      if (res.ok) {
        setSuccess(`${count} coupons worth ₹${value} each generated!`);
        loadQRs();
      }
    } finally {
      setGenerating(false);
    }
  };

  /* Change status */
  const handleStatusChange = async (qr, newStatus) => {
    setStatusLoading(qr._id);
    try {
      const res = await fetch(`/api/admin/qr/${qr._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setQrs((prev) =>
          prev.map((q) =>
            q._id === qr._id
              ? { ...q, status: newStatus, isUsed: newStatus === "PAID" }
              : q,
          ),
        );
        toast(`Coupon ${qr.uniqueCode} marked as ${newStatus}`);
      } else {
        toast("Failed to update status", "error");
      }
    } finally {
      setStatusLoading(null);
    }
  };

  /* Delete Single */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/qr/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setQrs((prev) => prev.filter((q) => q._id !== deleteTarget.id));
        toast(`Coupon ${deleteTarget.code} deleted`);
        setSelectedIds((prev) => {
          const n = new Set(prev);
          n.delete(deleteTarget.id);
          return n;
        });
        setDeleteTarget(null);
      } else {
        toast("Delete failed", "error");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  /* Delete Bulk */
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkDeleteLoading(true);
    try {
      const res = await fetch("/api/admin/qr-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      if (res.ok) {
        setQrs((prev) => prev.filter((q) => !selectedIds.has(q._id)));
        toast(`${selectedIds.size} coupons deleted`);
        setSelectedIds(new Set());
        setShowBulkDelete(false);
      } else {
        toast("Bulk delete failed", "error");
      }
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  /* Bulk Export */
  const handleBulkDownloadZip = async () => {
    setBulkExporting(true);
    try {
      const imported = await import("jszip");
      const JSZip = imported.default || imported;
      const zip = new JSZip();

      Array.from(selectedIds).forEach((id) => {
        const canvas = document.getElementById(`qr-bulk-${id}`);
        const qData = qrs.find((q) => q._id === id);
        if (canvas && qData) {
          const data = canvas.toDataURL("image/png").split(",")[1];
          zip.file(`Coupon-${qData.uniqueCode}-${printSize}px.png`, data, {
            base64: true,
          });
        }
      });

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Cashback-Coupons-Bulk.zip`;
      link.click();
      toast("Downloaded ZIP successfully!");
    } catch (e) {
      toast("Export failed", "error");
    } finally {
      setBulkExporting(false);
      setShowBulkExport(false);
    }
  };

  const handleBulkPrint = () => {
    const win = window.open("");
    if (!win) return;
    let htmlSnippet = `<html><head><title>Print Bulk Coupons</title><style>
            body { font-family: sans-serif; text-align: center; margin: 0; padding: 20px; box-sizing: border-box; }
            .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 30px; justify-items: center; }
            .item { break-inside: avoid; display: flex; flex-direction: column; align-items: center; border: 2px dashed #e2e8f0; padding: 20px; border-radius: 16px; width: 100%; box-sizing: border-box; }
            img { width: 100%; height: auto; max-width: ${printSize}px; }
            p { font-size: 18px; font-weight: 900; margin: 12px 0 6px; color: #0f172a; letter-spacing: 0.05em; }
            .val { margin: 0; color: #166534; font-weight: 800; background: #f0fdf4; padding: 6px 12px; border-radius: 8px; font-size: 16px; border: 1px solid #bbf7d0; }
        </style></head><body><div class="grid">`;

    Array.from(selectedIds).forEach((id) => {
      const canvas = document.getElementById(`qr-bulk-${id}`);
      const qData = qrs.find((q) => q._id === id);
      if (canvas && qData) {
        const url = canvas.toDataURL("image/png");
        htmlSnippet += `<div class="item"><img src="${url}" /><p>${qData.uniqueCode}</p><div class="val">₹${qData.value} Cashback</div></div>`;
      }
    });

    htmlSnippet += `</div><script>window.onload = function() { window.print(); window.close(); }</script></body></html>`;
    win.document.write(htmlSnippet);
    win.document.close();
    setShowBulkExport(false);
  };

  const total = qrs.length;
  const unpaidCount = qrs.filter((q) => q.status === "UNPAID").length;
  const paidCount = qrs.filter((q) => q.status === "PAID").length;
  const cancelledCount = qrs.filter((q) => q.status === "CANCELLED").length;
  const utilPct = total > 0 ? Math.round((paidCount / total) * 100) : 0;

  const filtered = qrs.filter((q) => {
    const fMatch = filter === "ALL" || q.status === filter;
    const sMatch =
      !search || q.uniqueCode.toLowerCase().includes(search.toLowerCase());
    return fMatch && sMatch;
  });

  /* Select logic */
  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(new Set(filtered.map((q) => q._id)));
    else setSelectedIds(new Set());
  };
  const handleSelectOne = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const cardBase = {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    overflow: "hidden",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f1f5f9",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <Sidebar />
      <div
        style={{
          flex: 1,
          marginLeft: 260,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        {/* ══════ TOPBAR ══════ */}
        <div
          style={{
            height: 62,
            background: "#fff",
            borderBottom: "1px solid #e5e7eb",
            padding: "0 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 200,
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(79,70,229,0.35)",
              }}
            >
              <QrCode size={19} color="white" />
            </div>
            <div>
              <div
                style={{
                  fontSize: "1.02rem",
                  fontWeight: 800,
                  color: "#0f172a",
                  letterSpacing: "-0.025em",
                }}
              >
                QR Codes
              </div>
              <div
                style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: 1 }}
              >
                Generate &amp; manage reward coupons
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={() => router.push("/admin/qr/generate")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "0 14px",
                height: 36,
                background: "#4f46e5",
                color: "#fff",
                border: "none",
                borderRadius: 9,
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(79,70,229,0.3)",
              }}
            >
              <Sparkles size={13} /> Generate Codes
            </button>
            <a
              href="/api/admin/export-csv"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "0 14px",
                height: 36,
                background: "#f8fafc",
                color: "#475569",
                border: "1px solid #e2e8f0",
                borderRadius: 9,
                fontSize: "0.8rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <Download size={13} /> Export CSV
            </a>
            <button
              onClick={loadQRs}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "0 14px",
                height: 36,
                background: "#f8fafc",
                color: "#475569",
                border: "1px solid #e2e8f0",
                borderRadius: 9,
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <RefreshCw
                size={13}
                style={{
                  animation: loading ? "spin 1s linear infinite" : "none",
                }}
              />{" "}
              Refresh
            </button>
          </div>
        </div>

        {/* ══════ PAGE BODY ══════ */}
        <div style={{ padding: "26px 28px 48px", flex: 1 }}>
          {/* ── STAT CARDS ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 16,
              marginBottom: 22,
            }}
          >
            {[
              {
                label: "Total Generated",
                value: total,
                sub: "Coupons created all time",
                icon: Layers,
                iconBg: "linear-gradient(135deg,#eef2ff,#e0e7ff)",
                iconColor: "#4f46e5",
                bar: "linear-gradient(90deg,#6366f1,#8b5cf6)",
                pct: 100,
              },
              {
                label: "Unpaid",
                value: unpaidCount,
                sub: "Currently available or pending",
                icon: CheckCircle2,
                iconBg: "linear-gradient(135deg,#ecfdf5,#d1fae5)",
                iconColor: "#059669",
                bar: "linear-gradient(90deg,#059669,#34d399)",
                pct: total > 0 ? (unpaidCount / total) * 100 : 0,
              },
              {
                label: "Paid",
                value: paidCount,
                sub: `${utilPct}% utilization`,
                icon: TrendingUp,
                iconBg: "linear-gradient(135deg,#fff1f2,#ffe4e6)",
                iconColor: "#dc2626",
                bar: "linear-gradient(90deg,#dc2626,#fb7185)",
                pct: utilPct,
              },
            ].map(
              ({
                label,
                value: val,
                sub,
                icon: Icon,
                iconBg,
                iconColor,
                bar,
                pct,
              }) => (
                <div
                  key={label}
                  style={{ ...cardBase, cursor: "default" }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.transform = "translateY(-3px)";
                    el.style.boxShadow = "0 12px 30px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.transform = "none";
                    el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
                  }}
                >
                  <div style={{ height: 4, background: bar }} />
                  <div style={{ padding: "22px 24px 20px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 18,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      >
                        {label}
                      </span>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 11,
                          background: iconBg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon size={19} color={iconColor} />
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: "2.6rem",
                        fontWeight: 900,
                        color: "#0f172a",
                        letterSpacing: "-0.06em",
                        lineHeight: 1,
                        marginBottom: 4,
                      }}
                    >
                      {val}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#94a3b8",
                        marginBottom: 16,
                      }}
                    >
                      {sub}
                    </div>
                    <div
                      style={{
                        height: 5,
                        background: "#f1f5f9",
                        borderRadius: 99,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          background: bar,
                          borderRadius: 99,
                          width: `${pct}%`,
                          transition: "width 0.8s ease",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>

          {/* ── TABLE CARD ── */}
          <div style={{ ...cardBase }}>
            {/* Toolbar */}
            <div
              style={{
                padding: "16px 22px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
                minHeight: 64,
              }}
            >
              {selectedIds.size > 0 ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    animation: "slideup 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.92rem",
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    {selectedIds.size} Selected
                  </div>
                  <button
                    onClick={() => setShowBulkExport(true)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "7px 14px",
                      background: "#eef2ff",
                      color: "#4f46e5",
                      border: "1px solid #c7d2fe",
                      borderRadius: 9,
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget;
                      el.style.background = "#e0e7ff";
                      el.style.borderColor = "#a5b4fc";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget;
                      el.style.background = "#eef2ff";
                      el.style.borderColor = "#c7d2fe";
                    }}
                  >
                    <Download size={13} /> Export Selected
                  </button>
                  <button
                    onClick={() => setShowBulkDelete(true)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "7px 14px",
                      background: "#fff1f2",
                      color: "#dc2626",
                      border: "1px solid #fecaca",
                      borderRadius: 9,
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget;
                      el.style.background = "#fee2e2";
                      el.style.borderColor = "#fca5a5";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget;
                      el.style.background = "#fff1f2";
                      el.style.borderColor = "#fecaca";
                    }}
                  >
                    <Trash2 size={13} /> Delete Selected
                  </button>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      fontSize: "0.92rem",
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    All QR Coupons
                  </div>
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: "#94a3b8",
                      marginTop: 2,
                    }}
                  >
                    {filtered.length} of {total} coupons
                  </div>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ position: "relative" }}>
                  <Search
                    size={13}
                    style={{
                      position: "absolute",
                      left: 11,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#cbd5e1",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    placeholder="Search by code…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      height: 34,
                      paddingLeft: 32,
                      paddingRight: 12,
                      width: 170,
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: 9,
                      fontSize: "0.8rem",
                      color: "#374151",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#a5b4fc";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(165,180,252,0.2)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e2e8f0";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    padding: 4,
                    gap: 2,
                  }}
                >
                  {[
                    { key: "ALL", label: "All", cnt: total },
                    { key: "UNPAID", label: "Unpaid", cnt: unpaidCount },
                    { key: "PAID", label: "Paid", cnt: paidCount },
                    {
                      key: "CANCELLED",
                      label: "Cancelled",
                      cnt: cancelledCount,
                    },
                  ].map(({ key, label, cnt }) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      style={{
                        padding: "4px 12px",
                        borderRadius: 7,
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.76rem",
                        fontWeight: 700,
                        background: filter === key ? "#fff" : "transparent",
                        color: filter === key ? "#4f46e5" : "#94a3b8",
                        boxShadow:
                          filter === key ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        transition: "all 0.15s",
                      }}
                    >
                      {label}
                      <span
                        style={{
                          background: filter === key ? "#eef2ff" : "#f1f5f9",
                          color: filter === key ? "#4f46e5" : "#94a3b8",
                          borderRadius: 99,
                          padding: "1px 7px",
                          fontSize: "0.68rem",
                          fontWeight: 800,
                        }}
                      >
                        {cnt}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto" }}>
              {loading ? (
                <div
                  style={{
                    padding: "64px 20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <Loader2
                    size={30}
                    color="#6366f1"
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  <span
                    style={{
                      fontSize: "0.84rem",
                      color: "#94a3b8",
                      fontWeight: 500,
                    }}
                  >
                    Loading coupons…
                  </span>
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: "64px 20px", textAlign: "center" }}>
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                      color: "#cbd5e1",
                    }}
                  >
                    <QrCode size={26} />
                  </div>
                  <div
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 800,
                      color: "#334155",
                      marginBottom: 6,
                    }}
                  >
                    No coupons found
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                    {search
                      ? `No results for "${search}"`
                      : "Adjust filters or generate a new batch."}
                  </div>
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        background: "#f8fafc",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      <th
                        style={{
                          padding: "10px 20px",
                          width: 44,
                          textAlign: "center",
                        }}
                      >
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={
                            filtered.length > 0 &&
                            selectedIds.size === filtered.length
                          }
                          style={{
                            cursor: "pointer",
                            accentColor: "#4f46e5",
                            width: 14,
                            height: 14,
                          }}
                        />
                      </th>
                      {[
                        "#",
                        "QR",
                        "Code",
                        "Cashback",
                        "Status",
                        "Generated On",
                        "Reward URL",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "10px 20px",
                            fontSize: "0.67rem",
                            fontWeight: 700,
                            color: "#94a3b8",
                            textTransform: "uppercase",
                            letterSpacing: "0.09em",
                            textAlign:
                              h === "Actions" || h === "#" ? "center" : "left",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((qr, i) => (
                      <tr
                        key={qr._id}
                        style={{
                          borderBottom:
                            i < filtered.length - 1
                              ? "1px solid #f8fafc"
                              : "none",
                          transition: "background 0.12s",
                          background: selectedIds.has(qr._id)
                            ? "#f5f3ff"
                            : "transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (!selectedIds.has(qr._id))
                            e.currentTarget.style.background = "#fafbff";
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedIds.has(qr._id))
                            e.currentTarget.style.background = "transparent";
                        }}
                        onClick={(e) => {
                          // Prevent row click if clicking buttons/links
                          if (
                            e.target.tagName !== "BUTTON" &&
                            e.target.tagName !== "A" &&
                            !e.target.closest("button")
                          ) {
                            handleSelectOne(qr._id);
                          }
                        }}
                      >
                        {/* Checkbox */}
                        <td
                          style={{ padding: "13px 20px", textAlign: "center" }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.has(qr._id)}
                            onChange={() => {}}
                            style={{
                              cursor: "pointer",
                              accentColor: "#4f46e5",
                              width: 14,
                              height: 14,
                              pointerEvents: "none",
                            }}
                          />
                        </td>
                        {/* # */}
                        <td
                          style={{
                            padding: "13px 20px",
                            fontSize: "0.76rem",
                            color: "#cbd5e1",
                            fontWeight: 600,
                            width: 40,
                            textAlign: "center",
                          }}
                        >
                          {i + 1}
                        </td>
                        {/* QR */}
                        <td style={{ padding: "13px 20px" }}>
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewQR(qr);
                            }}
                            title="Click to view full size"
                            style={{
                              width: 44,
                              height: 44,
                              background: "#fff",
                              border: "1px solid #e2e8f0",
                              borderRadius: 10,
                              padding: 4,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "zoom-in",
                              transition: "border-color 0.2s, box-shadow 0.2s",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = "#8b5cf6";
                              e.currentTarget.style.boxShadow =
                                "0 4px 12px rgba(139,92,246,0.15)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = "#e2e8f0";
                              e.currentTarget.style.boxShadow =
                                "0 2px 4px rgba(0,0,0,0.02)";
                            }}
                          >
                            <QRCodeSVG
                              value={`${origin}/reward/${qr.uniqueCode}`}
                              size={34}
                            />
                          </div>
                        </td>
                        {/* Code */}
                        <td style={{ padding: "13px 20px" }}>
                          <div onClick={(e) => e.stopPropagation()}>
                            <CopyChip code={qr.uniqueCode} />
                          </div>
                        </td>
                        {/* Value */}
                        <td style={{ padding: "13px 20px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              background: "#f0fdf4",
                              border: "1px solid #bbf7d0",
                              color: "#166534",
                              borderRadius: 7,
                              padding: "4px 11px",
                              fontSize: "0.85rem",
                              fontWeight: 800,
                            }}
                          >
                            ₹{qr.value}
                          </span>
                        </td>
                        {/* Status Label */}
                        <td style={{ padding: "13px 20px" }}>
                          {qr.status === "PAID" ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                background: "#f5f3ff",
                                border: "1px solid #ddd6fe",
                                color: "#5b21b6",
                                borderRadius: 99,
                                padding: "4px 11px",
                                fontSize: "0.72rem",
                                fontWeight: 700,
                              }}
                            >
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  background: "#8b5cf6",
                                  flexShrink: 0,
                                }}
                              />
                              Paid
                            </span>
                          ) : qr.status === "CANCELLED" ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                background: "#f1f5f9",
                                border: "1px solid #e2e8f0",
                                color: "#64748b",
                                borderRadius: 99,
                                padding: "4px 11px",
                                fontSize: "0.72rem",
                                fontWeight: 700,
                              }}
                            >
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  background: "#94a3b8",
                                  flexShrink: 0,
                                }}
                              />
                              Cancelled
                            </span>
                          ) : (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                background: "#f0fdf4",
                                border: "1px solid #bbf7d0",
                                color: "#15803d",
                                borderRadius: 99,
                                padding: "4px 11px",
                                fontSize: "0.72rem",
                                fontWeight: 700,
                              }}
                            >
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  background: "#22c55e",
                                  flexShrink: 0,
                                }}
                              />
                              Unpaid
                            </span>
                          )}
                        </td>
                        {/* Date */}
                        <td
                          style={{
                            padding: "13px 20px",
                            fontSize: "0.8rem",
                            color: "#64748b",
                            whiteSpace: "nowrap",
                            fontWeight: 500,
                          }}
                        >
                          {new Date(qr.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        {/* URL to QR Modal */}
                        <td style={{ padding: "13px 20px" }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setPreviewQR(qr);
                            }}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              color: "#4f46e5",
                              fontSize: "0.79rem",
                              fontWeight: 600,
                              background: "#eef2ff",
                              border: "1px solid #c7d2fe",
                              borderRadius: 7,
                              padding: "4px 10px",
                              transition: "all 0.15s",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) => {
                              const el = e.currentTarget;
                              el.style.background = "#e0e7ff";
                              el.style.borderColor = "#a5b4fc";
                            }}
                            onMouseLeave={(e) => {
                              const el = e.currentTarget;
                              el.style.background = "#eef2ff";
                              el.style.borderColor = "#c7d2fe";
                            }}
                          >
                            /reward/<strong>{qr.uniqueCode}</strong>
                            <QrCode size={11} />
                          </button>
                        </td>
                        {/* Actions */}
                        <td
                          style={{ padding: "13px 20px", textAlign: "center" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 8,
                            }}
                          >
                            {loading === qr._id ? (
                              <Loader2
                                size={16}
                                strokeWidth={3}
                                color="#94a3b8"
                                style={{ animation: "spin 1s linear infinite" }}
                              />
                            ) : qr.status === "UNPAID" ? (
                              <>
                                {/* Mark Paid action */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(qr, "PAID");
                                  }}
                                  disabled={statusLoading === qr._id}
                                  title="Mark as Paid"
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 5,
                                    height: 30,
                                    padding: "0 10px",
                                    background: "#f0fdf4",
                                    border: "1px solid #bbf7d0",
                                    color: "#166534",
                                    borderRadius: 7,
                                    cursor: "pointer",
                                    fontSize: "0.72rem",
                                    fontWeight: 700,
                                    transition: "all 0.15s",
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.background =
                                      "#dcfce7")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.background =
                                      "#f0fdf4")
                                  }
                                >
                                  <DollarSign size={13} strokeWidth={3} /> Paid
                                </button>

                                {/* Cancel Action */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(qr, "CANCELLED");
                                  }}
                                  disabled={statusLoading === qr._id}
                                  title="Cancel Coupon"
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 5,
                                    height: 30,
                                    padding: "0 10px",
                                    background: "#fff1f2",
                                    border: "1px solid #fecaca",
                                    color: "#be123c",
                                    borderRadius: 7,
                                    cursor: "pointer",
                                    fontSize: "0.72rem",
                                    fontWeight: 700,
                                    transition: "all 0.15s",
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.background =
                                      "#ffe4e6")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.background =
                                      "#fff1f2")
                                  }
                                >
                                  <XCircle size={13} strokeWidth={2.5} /> Cancel
                                </button>
                              </>
                            ) : (
                              // Frozen state for PAID / CANCELLED
                              <div
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 5,
                                  height: 30,
                                  padding: "0 10px",
                                  background: "#f8fafc",
                                  border: "1px solid #e2e8f0",
                                  color: "#94a3b8",
                                  borderRadius: 7,
                                  fontSize: "0.72rem",
                                  fontWeight: 700,
                                  cursor: "not-allowed",
                                }}
                              >
                                <Check size={13} strokeWidth={3} />{" "}
                                {qr.status === "PAID" ? "Paid" : "Cancelled"}
                              </div>
                            )}

                            {/* Delete */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget({
                                  id: qr._id,
                                  code: qr.uniqueCode,
                                });
                              }}
                              title="Delete coupon"
                              style={{
                                width: 30,
                                height: 30,
                                background: "#fff",
                                border: "1px solid #e2e8f0",
                                borderRadius: 7,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#94a3b8",
                                transition: "all 0.15s",
                              }}
                              onMouseEnter={(e) => {
                                const el = e.currentTarget;
                                el.style.background = "#fff1f2";
                                el.style.borderColor = "#fecaca";
                                el.style.color = "#dc2626";
                              }}
                              onMouseLeave={(e) => {
                                const el = e.currentTarget;
                                el.style.background = "#fff";
                                el.style.borderColor = "#e2e8f0";
                                el.style.color = "#94a3b8";
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            {filtered.length > 0 && (
              <div
                style={{
                  padding: "11px 22px",
                  borderTop: "1px solid #f1f5f9",
                  background: "#fafbff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: "0.76rem", color: "#94a3b8" }}>
                  Showing{" "}
                  <strong style={{ color: "#475569" }}>
                    {filtered.length}
                  </strong>{" "}
                  of <strong style={{ color: "#475569" }}>{total}</strong>{" "}
                  coupons
                </span>
                <div style={{ display: "flex", gap: 14 }}>
                  {[
                    { dot: "#22c55e", label: `${unpaidCount} Unpaid` },
                    { dot: "#8b5cf6", label: `${paidCount} Paid` },
                    { dot: "#94a3b8", label: `${cancelledCount} Cancelled` },
                  ].map(({ dot, label }) => (
                    <span
                      key={label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: "0.73rem",
                        color: "#94a3b8",
                        fontWeight: 600,
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: dot,
                          display: "inline-block",
                          boxShadow: `0 0 4px ${dot}`,
                        }}
                      />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ DELETE MODALS ══ */}
      {deleteTarget && (
        <DeleteModal
          code={deleteTarget.code}
          onConfirm={handleDelete}
          onCancel={() => {
            if (!deleteLoading) setDeleteTarget(null);
          }}
          loading={deleteLoading}
        />
      )}

      {showBulkDelete && (
        <DeleteModal
          code={`${selectedIds.size} selected coupons`}
          onConfirm={handleBulkDelete}
          onCancel={() => {
            if (!bulkDeleteLoading) setShowBulkDelete(false);
          }}
          loading={bulkDeleteLoading}
        />
      )}

      {/* ══ BULK EXPORT MODAL ══ */}
      {showBulkExport && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 3000,
            background: "rgba(15,23,42,0.6)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "fadeIn 0.2s ease",
          }}
          onClick={() => !bulkExporting && setShowBulkExport(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              width: "90%",
              maxWidth: 380,
              borderRadius: 24,
              padding: 32,
              textAlign: "center",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.3)",
              animation: "slideup 0.2s ease",
              position: "relative",
            }}
          >
            <button
              onClick={() => setShowBulkExport(false)}
              disabled={bulkExporting}
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                background: "#f1f5f9",
                border: "none",
                width: 32,
                height: 32,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: bulkExporting ? "not-allowed" : "pointer",
                color: "#64748b",
              }}
            >
              <X size={16} />
            </button>

            <div
              style={{
                width: 64,
                height: 64,
                background: "#eef2ff",
                borderRadius: "50%",
                margin: "0 auto 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#4f46e5",
              }}
            >
              <Download size={28} strokeWidth={2.5} />
            </div>
            <div
              style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: 6,
              }}
            >
              Export {selectedIds.size} Coupons
            </div>
            <div
              style={{
                fontSize: "0.88rem",
                color: "#64748b",
                marginBottom: 26,
                lineHeight: 1.5,
              }}
            >
              Download a ZIP archive or perfectly arrange them on a printable
              sheet.
            </div>

            <div style={{ textAlign: "left", marginBottom: 24 }}>
              <label
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 8,
                  display: "block",
                }}
              >
                Resolution / Print Quality
              </label>
              <select
                value={printSize}
                onChange={(e) => setPrintSize(Number(e.target.value))}
                style={{
                  width: "100%",
                  height: 44,
                  padding: "0 14px",
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "#334155",
                  outline: "none",
                  cursor: "pointer",
                  appearance: "none",
                }}
              >
                <option value={256}>Small — 256 x 256 px</option>
                <option value={512}>Medium — 512 x 512 px</option>
                <option value={1024}>Large — 1024 x 1024 px</option>
                <option value={2048}>Poster — 2048 x 2048 px</option>
              </select>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <button
                onClick={handleBulkDownloadZip}
                disabled={bulkExporting}
                style={{
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: "#fff",
                  border: "2px solid #e2e8f0",
                  borderRadius: 12,
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  color: "#334155",
                  cursor: bulkExporting ? "wait" : "pointer",
                }}
              >
                {bulkExporting ? (
                  <Loader2
                    size={15}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                ) : (
                  <Download size={15} />
                )}{" "}
                {bulkExporting ? "Zipping..." : "Zip PNGs"}
              </button>

              <button
                onClick={handleBulkPrint}
                disabled={bulkExporting}
                style={{
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: "#4f46e5",
                  border: "none",
                  borderRadius: 12,
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  color: "#fff",
                  cursor: bulkExporting ? "wait" : "pointer",
                  boxShadow: "0 4px 12px rgba(79,70,229,0.25)",
                }}
              >
                <Printer size={15} /> Print Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Canvases for Bulk Data Handling */}
      <div style={{ display: "none" }}>
        {Array.from(selectedIds).map((id) => {
          const qData = qrs.find((q) => q._id === id);
          if (!qData) return null;
          return (
            <QRCodeCanvas
              key={`bulk-${id}`}
              id={`qr-bulk-${id}`}
              value={`${origin}/reward/${qData.uniqueCode}`}
              size={printSize}
              marginSize={2}
            />
          );
        })}
      </div>

      {/* ══ QR PREVIEW MODAL ══ */}
      {previewQR && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 3000,
            background: "rgba(15,23,42,0.6)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "fadeIn 0.2s ease",
          }}
          onClick={() => setPreviewQR(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              width: "90%",
              maxWidth: 360,
              borderRadius: 24,
              padding: 32,
              textAlign: "center",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.3)",
              animation: "slideup 0.2s ease",
              position: "relative",
            }}
          >
            <button
              onClick={() => setPreviewQR(null)}
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                background: "#f1f5f9",
                border: "none",
                width: 32,
                height: 32,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#64748b",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#e2e8f0")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#f1f5f9")
              }
            >
              <X size={16} />
            </button>
            <div
              style={{
                fontSize: "1.1rem",
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: 24,
              }}
            >
              Scan to Claim Reward
            </div>
            <div
              style={{
                background: "#fff",
                padding: 20,
                border: "2px solid #e2e8f0",
                borderRadius: 20,
                display: "inline-block",
                marginBottom: 20,
                boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
              }}
            >
              <QRCodeSVG
                value={`${origin}/reward/${previewQR.uniqueCode}`}
                size={220}
              />

              {/* Hidden canvas used exclusively for generating high-res exports */}
              <div style={{ display: "none" }}>
                <QRCodeCanvas
                  id="qr-export-canvas"
                  value={`${origin}/reward/${previewQR.uniqueCode}`}
                  size={printSize}
                  marginSize={2}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "#64748b",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Coupon Code:
              </span>
              <span
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 900,
                  color: "#4f46e5",
                  letterSpacing: "0.05em",
                  background: "#eef2ff",
                  padding: "4px 12px",
                  borderRadius: 8,
                }}
              >
                {previewQR.uniqueCode}
              </span>
            </div>
            <div
              style={{
                fontSize: "0.95rem",
                color: "#166534",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                marginBottom: 24,
              }}
            >
              <CheckCircle2 size={16} /> ₹{previewQR.value} Cashback
            </div>

            {/* Export Controls */}
            <div
              style={{
                background: "#f8fafc",
                borderRadius: 16,
                padding: "16px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 10,
                  textAlign: "left",
                }}
              >
                Export Settings
              </div>
              <select
                value={printSize}
                onChange={(e) => setPrintSize(Number(e.target.value))}
                style={{
                  width: "100%",
                  height: 38,
                  marginBottom: 12,
                  padding: "0 12px",
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#334155",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value={256}>Small — 256 x 256 px</option>
                <option value={512}>Medium — 512 x 512 px</option>
                <option value={1024}>Large — 1024 x 1024 px</option>
                <option value={2048}>Poster — 2048 x 2048 px</option>
              </select>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const canvas = document.getElementById("qr-export-canvas");
                    if (canvas) {
                      const url = canvas.toDataURL("image/png");
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `Coupon-${previewQR.uniqueCode}-${printSize}px.png`;
                      link.click();
                    }
                  }}
                  style={{
                    height: 38,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    background: "#fff",
                    border: "1px solid #cbd5e1",
                    borderRadius: 10,
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "#334155",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f1f5f9")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#fff")
                  }
                >
                  <Download size={14} /> Download
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const canvas = document.getElementById("qr-export-canvas");
                    if (canvas) {
                      const url = canvas.toDataURL("image/png");
                      const win = window.open("");
                      win?.document.write(
                        `<html><head><title>Print QR Code ${previewQR.uniqueCode}</title></head><body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;"><img src="${url}" style="width:100%;max-width:${printSize}px;height:auto;" onload="window.print();window.close()"/></body></html>`,
                      );
                      win?.document.close();
                    }
                  }}
                  style={{
                    height: 38,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    background: "#4f46e5",
                    border: "none",
                    borderRadius: 10,
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "#fff",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(79,70,229,0.3)",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#4338ca")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#4f46e5")
                  }
                >
                  <Printer size={14} /> Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ TOAST STACK ══ */}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 3000,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 16px",
              borderRadius: 10,
              background: t.type === "success" ? "#0f172a" : "#7f1d1d",
              border: `1px solid ${t.type === "success" ? "#1e293b" : "#991b1b"}`,
              color: "#fff",
              fontSize: "0.84rem",
              fontWeight: 600,
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              animation: "slideup 0.2s ease",
            }}
          >
            {t.type === "success" ? (
              <Check size={15} color="#4ade80" strokeWidth={3} />
            ) : (
              <AlertTriangle size={15} color="#fca5a5" />
            )}
            {t.msg}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideup { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
      `}</style>
    </div>
  );
}
