import React from "react";
import Link from "next/link";
import {
  QrCode,
  ShieldCheck,
  Zap,
  TrendingUp,
  ArrowRight,
  LayoutDashboard,
} from "lucide-react";

const features = [
  {
    icon: QrCode,
    title: "Unique QR Codes",
    desc: "Generate secure, single-use QR coupons with custom values in seconds.",
    color: "indigo",
  },
  {
    icon: ShieldCheck,
    title: "Fraud Prevention",
    desc: "Built-in validation ensures each coupon can only be claimed once.",
    color: "green",
  },
  {
    icon: Zap,
    title: "Instant Verification",
    desc: "Real-time payment screenshot verification and status tracking.",
    color: "amber",
  },
  {
    icon: TrendingUp,
    title: "Analytics & Reports",
    desc: "Monitor conversions, payout totals, and export data as CSV anytime.",
    color: "pink",
  },
];

const steps = [
  {
    num: 1,
    title: "Scan the QR Code",
    desc: "User scans the printed coupon with any camera.",
  },
  {
    num: 2,
    title: "Make Payment",
    desc: "Scan the UPI code and complete the payment.",
  },
  {
    num: 3,
    title: "Submit Details",
    desc: "Fill in account information and upload screenshot.",
  },
  {
    num: 4,
    title: "Receive Cashback",
    desc: "Admin verifies and credits within 2–3 working days.",
  },
];

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          padding: "0 5%",
          height: "70px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(255, 255, 255, 0.04)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              borderRadius: 9,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <QrCode size={18} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "white" }}>
            CashbackQR
          </span>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Link
            href="/admin/login"
            style={{
              fontSize: "0.875rem",
              color: "rgba(255,255,255,0.65)",
              fontWeight: 500,
            }}
          >
            Sign In
          </Link>
          <Link
            href="/admin"
            style={{
              background: "white",
              color: "#0f172a",
              padding: "0.5rem 1.25rem",
              borderRadius: 8,
              fontSize: "0.875rem",
              fontWeight: 700,
            }}
          >
            Admin Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: "7rem 5% 5rem", textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "rgba(99, 102, 241, 0.15)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            borderRadius: 9999,
            padding: "0.4rem 1rem",
            marginBottom: "2rem",
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "#a5b4fc",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              background: "#818cf8",
              borderRadius: "50%",
              display: "inline-block",
            }}
          ></span>
          Smart QR Reward Management Platform
        </div>

        <h1
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 800,
            color: "white",
            lineHeight: 1.1,
            letterSpacing: "-0.04em",
            marginBottom: "1.5rem",
            maxWidth: 900,
            margin: "0 auto 1.5rem",
          }}
        >
          Turn every QR scan into a{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #818cf8 0%, #c084fc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            cashback reward
          </span>
        </h1>

        <p
          style={{
            fontSize: "1.15rem",
            color: "rgba(255,255,255,0.55)",
            maxWidth: 600,
            margin: "0 auto 3rem",
            lineHeight: 1.7,
          }}
        >
          Generate unique QR coupons, validate claims instantly, and manage your
          entire reward program from a single professional dashboard.
        </p>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/admin"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              color: "white",
              padding: "0.875rem 2rem",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: "1rem",
              boxShadow: "0 8px 32px rgba(79, 70, 229, 0.45)",
            }}
          >
            Open Admin Panel <ArrowRight size={18} />
          </Link>
          <a
            href="#how-it-works"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(255, 255, 255, 0.08)",
              color: "white",
              padding: "0.875rem 2rem",
              borderRadius: 10,
              fontWeight: 600,
              fontSize: "1rem",
              border: "1px solid rgba(255, 255, 255, 0.12)",
            }}
          >
            How it Works
          </a>
        </div>

        {/* Mockup Stats Strip */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            justifyContent: "center",
            marginTop: "4rem",
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "Coupons Generated", val: "10,000+" },
            { label: "Claims Processed", val: "2,500+" },
            { label: "Payout Accuracy", val: "99.9%" },
            { label: "Avg. Processing Time", val: "< 24 hrs" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: 12,
                padding: "1rem 1.5rem",
                minWidth: 140,
              }}
            >
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "white",
                  letterSpacing: "-0.02em",
                }}
              >
                {s.val}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.45)",
                  marginTop: "0.25rem",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section
        style={{
          padding: "5rem 5%",
          background: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "#a5b4fc",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "0.75rem",
              }}
            >
              Features
            </div>
            <h2
              style={{
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                fontWeight: 800,
                color: "white",
                letterSpacing: "-0.03em",
              }}
            >
              Everything you need to run rewards at scale
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 16,
                  padding: "1.75rem",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    marginBottom: "1.25rem",
                    background:
                      color === "indigo"
                        ? "rgba(99, 102, 241, 0.2)"
                        : color === "green"
                          ? "rgba(16, 185, 129, 0.2)"
                          : color === "amber"
                            ? "rgba(245, 158, 11, 0.2)"
                            : "rgba(219, 39, 119, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color:
                      color === "indigo"
                        ? "#a5b4fc"
                        : color === "green"
                          ? "#6ee7b7"
                          : color === "amber"
                            ? "#fcd34d"
                            : "#f9a8d4",
                  }}
                >
                  <Icon size={22} />
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    color: "white",
                    fontSize: "1rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "rgba(255,255,255,0.5)",
                    lineHeight: 1.6,
                  }}
                >
                  {desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" style={{ padding: "5rem 5%" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "#a5b4fc",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "0.75rem",
              }}
            >
              How It Works
            </div>
            <h2
              style={{
                fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
                fontWeight: 800,
                color: "white",
                letterSpacing: "-0.03em",
              }}
            >
              Claim a reward in under 2 minutes
            </h2>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {steps.map((step, i) => (
              <div
                key={step.num}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.5rem",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 14,
                  padding: "1.25rem 1.5rem",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    flexShrink: 0,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "1.1rem",
                    color: "white",
                  }}
                >
                  {step.num}
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      color: "white",
                      fontSize: "1rem",
                    }}
                  >
                    {step.title}
                  </div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "rgba(255,255,255,0.5)",
                      marginTop: "0.25rem",
                    }}
                  >
                    {step.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "2rem 5%",
          borderTop: "1px solid rgba(255, 255, 255, 0.07)",
          background: "rgba(0,0,0,0.3)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: 28,
              height: 28,
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              borderRadius: 7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <QrCode size={14} color="white" />
          </div>
          <span style={{ fontWeight: 700, color: "white", fontSize: "0.9rem" }}>
            CashbackQR
          </span>
        </div>
        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.3)" }}>
          © {new Date().getFullYear()} CashbackQR. All rights reserved.
        </p>
        <Link
          href="/admin"
          style={{
            fontSize: "0.8rem",
            color: "#a5b4fc",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
          }}
        >
          <LayoutDashboard size={14} /> Admin Portal
        </Link>
      </footer>
    </div>
  );
}
