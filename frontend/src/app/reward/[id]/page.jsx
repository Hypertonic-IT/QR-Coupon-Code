import React from "react";
import RewardClient from "@/components/RewardClient";
import { QrCode, AlertCircle } from "lucide-react";

async function getCoupon(id) {
  try {
    const res = await fetch(`http://node.coupenqrcode.clients.hypertonic.co/api/public/qr/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function RewardPage({ params }) {
  const { id } = await params;
  const coupon = await getCoupon(id);

  if (!coupon) {
    return (
      <div
        className="rw-layout"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <div style={{ textAlign: "center", padding: "3rem", maxWidth: 420 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
            }}
          >
            <AlertCircle size={36} color="#f87171" />
          </div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "white",
              marginBottom: "0.75rem",
            }}
          >
            Invalid QR Code
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
            This coupon doesn't exist or the link is damaged. Please scan the
            original QR code again.
          </p>
        </div>
      </div>
    );
  }

  if (coupon.isUsed) {
    return (
      <div
        className="rw-layout"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <div style={{ textAlign: "center", padding: "3rem", maxWidth: 420 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(245, 158, 11, 0.15)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
            }}
          >
            <QrCode size={36} color="#fcd34d" />
          </div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "white",
              marginBottom: "0.75rem",
            }}
          >
            Already Claimed
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1.6,
              marginBottom: "2rem",
            }}
          >
            This coupon has already been used. Each QR coupon can only be
            redeemed once.
          </p>
          <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.3)" }}>
            Coupon ID:{" "}
            <code
              style={{
                background: "rgba(255,255,255,0.08)",
                padding: "0.2rem 0.5rem",
                borderRadius: 4,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              {id}
            </code>
          </p>
        </div>
      </div>
    );
  }

  return <RewardClient coupon={coupon} />;
}
