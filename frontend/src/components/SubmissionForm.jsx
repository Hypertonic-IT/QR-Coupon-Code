"use client";

import React, { useState } from "react";
import { Camera, Send, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SubmissionForm({ couponId, uniqueCode }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [accountType, setAccountType] = useState("UPI_ID");
  const router = useRouter();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      qrCouponId: couponId,
      code: uniqueCode,
      screenshot: screenshotPreview || "",
      name: formData.get("name"),
      mobile: formData.get("mobile"),
      accountType: formData.get("accountType"),
      accountValue: formData.get("accountValue"),
    };

    try {
      const res = await fetch("/api/submit-claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error("Backend connection failed. Please try again.");
      }

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/thank-you");
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        className="glass animate-fade-in"
        style={{
          padding: "2rem",
          textAlign: "center",
          borderColor: "var(--success)",
        }}
      >
        <CheckCircle2
          color="var(--success)"
          size={48}
          style={{ marginBottom: "1rem" }}
        />
        <h2>Submission Successful!</h2>
        <p style={{ color: "var(--text-muted)" }}>
          Thank you! Your cashback will be credited within 2–3 working days.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      <div>
        <label
          style={{
            display: "block",
            marginBottom: "0.5rem",
            fontSize: "0.9rem",
            color: "var(--text-muted)",
          }}
        >
          Full Name
        </label>
        <input name="name" className="input" placeholder="Your Name" required />
      </div>

      <div>
        <label
          style={{
            display: "block",
            marginBottom: "0.5rem",
            fontSize: "0.9rem",
            color: "var(--text-muted)",
          }}
        >
          Mobile Number
        </label>
        <input
          name="mobile"
          className="input"
          type="tel"
          placeholder="+91 00000 00000"
          required
        />
      </div>

      <div>
        <label
          style={{
            display: "block",
            marginBottom: "0.5rem",
            fontSize: "0.9rem",
            color: "var(--text-muted)",
          }}
        >
          Account Type
        </label>
        <select
          name="accountType"
          className="input"
          value={accountType}
          onChange={(e) => setAccountType(e.target.value)}
          required
        >
          <option value="UPI_ID">UPI ID (e.g. name@upi)</option>
          <option value="BANK_ACCOUNT">Bank Account & IFSC</option>
          <option value="UPI_NUMBER">UPI Mobile Number</option>
        </select>
      </div>

      <div>
        <label
          style={{
            display: "block",
            marginBottom: "0.5rem",
            fontSize: "0.9rem",
            color: "var(--text-muted)",
          }}
        >
          Details (UPI ID / Account Number / UPI Number)
        </label>
        <input
          name="accountValue"
          className="input"
          placeholder="Enter details here"
          required
        />
      </div>

      <div>
        <label
          style={{
            display: "block",
            marginBottom: "0.5rem",
            fontSize: "0.9rem",
            color: "var(--text-muted)",
          }}
        >
          Payment Screenshot
        </label>
        <div
          style={{
            border: "2px dashed var(--card-border)",
            borderRadius: "var(--radius)",
            padding: "2rem",
            textAlign: "center",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
          }}
          onClick={() => document.getElementById("screenshot-input")?.click()}
        >
          {screenshotPreview ? (
            <img
              src={screenshotPreview}
              alt="Screenshot Preview"
              style={{ width: "100%", height: "150px", objectFit: "contain" }}
            />
          ) : (
            <>
              <Camera
                size={32}
                color="var(--text-muted)"
                style={{ marginBottom: "0.5rem" }}
              />
              <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                Upload Screenshot
              </p>
            </>
          )}
          <input
            id="screenshot-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>
      </div>

      {error && (
        <div style={{ color: "var(--error)", fontSize: "0.9rem" }}>{error}</div>
      )}

      <button
        className="btn btn-primary"
        type="submit"
        disabled={loading}
        style={{ marginTop: "1rem" }}
      >
        {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
        {loading ? "Submitting..." : "Claim Cashback"}
      </button>
    </form>
  );
}
