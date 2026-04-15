"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  Lock,
  User,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Basic real-time validation checks for professional look
  const isLengthValid = newPassword.length >= 8;
  const hasCapital = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!isLengthValid || !hasCapital || !hasNumber) {
      setError(
        "Please ensure your new password meets all security requirements.",
      );
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Change password failed");
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => router.push("/admin"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const RequirementItem = ({ met, text }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        color: met ? "#16a34a" : "var(--text-3)",
        fontSize: 13,
        transition: "color 0.3s",
      }}
    >
      <CheckCircle2
        size={14}
        style={{ color: met ? "#16a34a" : "var(--gray-300)" }}
      />
      <span>{text}</span>
    </div>
  );

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 40 }}>
      <div
        className="page-header"
        style={{
          marginBottom: 32,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div>
          <h1 className="page-title" style={{ fontSize: 28 }}>
            Account Security
          </h1>
          <p className="page-subtitle" style={{ fontSize: 15, marginTop: 4 }}>
            Manage and secure your administrative portal credentials.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
        {/* Left/Main Form Area */}
        <div
          className="card"
          style={{
            flex: "1 1 400px",
            padding: 0,
            overflow: "hidden",
            border: "1px solid var(--gray-border)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
          }}
        >
          {/* Header Strip inside Card */}
          <div
            style={{
              padding: "24px 32px",
              borderBottom: "1px solid var(--gray-border)",
              background: "var(--gray-50)",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--gray-border)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
              }}
            >
              <Lock size={20} color="var(--primary)" />
            </div>
            <div>
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "var(--text-1)",
                }}
              >
                Update Password
              </h2>
              <div
                style={{ fontSize: 13, color: "var(--text-3)", marginTop: 2 }}
              >
                Please enter your current password to authorize changes.
              </div>
            </div>
          </div>

          <div style={{ padding: "32px" }}>
            {error && (
              <div
                className="notice notice-error"
                style={{ marginBottom: 24, fontSize: 14, padding: 14 }}
              >
                <ShieldAlert
                  size={16}
                  style={{ flexShrink: 0, marginTop: 1, color: "#dc2626" }}
                />
                {error}
              </div>
            )}

            {success && (
              <div
                className="notice notice-success"
                style={{
                  marginBottom: 24,
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  color: "#166534",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 14,
                  borderRadius: 8,
                  fontSize: 14,
                }}
              >
                <ShieldCheck size={20} style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ display: "block", marginBottom: 2 }}>
                    Success!
                  </strong>
                  Your password has been securely updated. Redirecting to
                  dashboard...
                </div>
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="form-field" style={{ marginBottom: 20 }}>
                <label
                  className="form-label"
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text-2)",
                  }}
                >
                  Username
                </label>
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      left: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-4)",
                    }}
                  >
                    <User size={16} />
                  </div>
                  <input
                    className="input"
                    value={username}
                    readOnly
                    style={{
                      paddingLeft: 40,
                      background: "var(--gray-50)",
                      color: "var(--text-2)",
                      cursor: "not-allowed",
                      borderColor: "var(--gray-200)",
                    }}
                  />
                </div>
              </div>

              <div className="form-field" style={{ marginBottom: 28 }}>
                <label
                  className="form-label"
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text-2)",
                  }}
                >
                  Current Password
                </label>
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      left: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-4)",
                    }}
                  >
                    <Lock size={16} />
                  </div>
                  <input
                    className="input"
                    type={showCurrentPw ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    style={{ paddingLeft: 40, paddingRight: 40 }}
                  />

                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "var(--text-4)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid var(--gray-border)",
                  margin: "0 -32px 28px -32px",
                }}
              />

              <div className="form-field" style={{ marginBottom: 8 }}>
                <label
                  className="form-label"
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text-2)",
                  }}
                >
                  New Password
                </label>
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      left: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-4)",
                    }}
                  >
                    <KeyRound size={16} />
                  </div>
                  <input
                    className="input"
                    type={showNewPw ? "text" : "password"}
                    placeholder="E.g. SecurePass123"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={{
                      paddingLeft: 40,
                      paddingRight: 40,
                      borderColor:
                        newPassword &&
                        (!isLengthValid || !hasCapital || !hasNumber)
                          ? "#fca5a5"
                          : "",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "var(--text-4)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Password Requirements Container */}
              <div
                style={{
                  alignSelf: "flex-start",
                  background: "var(--gray-50)",
                  padding: 14,
                  borderRadius: 8,
                  marginBottom: 32,
                  border: "1px solid var(--gray-border)",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text-2)",
                    marginBottom: 8,
                  }}
                >
                  Password Requirements:
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <RequirementItem
                    met={isLengthValid}
                    text="Minimum 8 characters long"
                  />
                  <RequirementItem
                    met={hasCapital}
                    text="Contains at least 1 uppercase letter"
                  />
                  <RequirementItem
                    met={hasNumber}
                    text="Contains at least 1 number"
                  />
                </div>
              </div>

              <div
                style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}
              >
                <button
                  type="button"
                  className="btn"
                  style={{
                    background: "white",
                    border: "1px solid var(--gray-border)",
                    color: "var(--text-2)",
                  }}
                  onClick={() => {
                    setCurrentPassword("");
                    setNewPassword("");
                    setError(null);
                    setSuccess(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ padding: "0 24px", position: "relative" }}
                >
                  {loading ? (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <Loader2
                        size={16}
                        style={{ animation: "spin 1s linear infinite" }}
                      />{" "}
                      Processing...
                    </div>
                  ) : (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <ShieldCheck size={16} /> Update Password
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side Info Area */}
        <div style={{ flex: "1 1 250px" }}>
          <div
            className="card"
            style={{
              background: "var(--gray-50)",
              border: "none",
              padding: 24,
            }}
          >
            <div
              style={{
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "var(--text-1)",
              }}
            >
              <ShieldCheck size={18} color="var(--primary)" />
              <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>
                Security Notice
              </h3>
            </div>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-3)",
                lineHeight: 1.6,
                marginBottom: 16,
              }}
            >
              Your administrator password provides full access to the QR
              cashback portal. Avoid using passwords you actively use on other
              websites.
            </p>
            <ul
              style={{
                fontSize: 13,
                color: "var(--text-3)",
                paddingLeft: 18,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <li>Never share this password with staff members.</li>
              <li>
                We will <strong>never</strong> ask for your password via email.
              </li>
              <li>Update your password every 90 days.</li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
