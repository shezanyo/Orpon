import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../utils/api";
import { Mail, ArrowLeft, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await forgotPassword(email.trim());
      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Failed to submit request. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: 460,
      margin: "60px auto 100px",
      padding: "0 20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        style={{
          alignSelf: "flex-start",
          background: "none",
          border: "none",
          color: "#888",
          fontSize: 14,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 6,
          cursor: "pointer",
          marginBottom: 24,
          padding: "4px 8px",
          borderRadius: 8,
          transition: "all 0.2s"
        }}
        onMouseOver={(e) => { e.currentTarget.style.color = "#1B4332"; e.currentTarget.style.background = "#EDE9E0"; }}
        onMouseOut={(e) => { e.currentTarget.style.color = "#888"; e.currentTarget.style.background = "none"; }}
      >
        <ArrowLeft size={16} /> Back to Home
      </button>

      <div style={{
        background: "#fff",
        borderRadius: 28,
        border: "1px solid #EDE9E0",
        padding: "40px 36px",
        width: "100%",
        boxShadow: "0 20px 50px rgba(0,0,0,0.04)",
        animation: "fadeUp 0.4s ease both"
      }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            background: "#F8F6F0",
            color: "#1B4332",
            width: 56,
            height: 56,
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px auto",
            border: "1px solid #EDE9E0"
          }}>
            <Mail size={24} />
          </div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: "#1B4332", marginBottom: 8 }}>
            Forgot Password?
          </h2>
          <p style={{ color: "#666", fontSize: 14, lineHeight: 1.5 }}>
            Enter your email address below and we'll send you a secure link to reset your password.
          </p>
        </div>

        {success ? (
          <div style={{ animation: "fadeUp 0.3s ease both" }}>
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "#EAF5F0",
              border: "1px solid #C7E5D6",
              borderRadius: 16,
              padding: 24,
              textAlign: "center",
              marginBottom: 24
            }}>
              <CheckCircle2 size={36} color="#2D6A4F" style={{ marginBottom: 12 }} />
              <span style={{ fontSize: 15, fontWeight: 700, color: "#1B4332", marginBottom: 6 }}>
                Reset Email Requested
              </span>
              <p style={{ fontSize: 13, color: "#2D6A4F", lineHeight: 1.5 }}>
                If that email is registered, we have sent a secure password reset link to it. Please check your inbox and spam folder.
              </p>
            </div>

            <button
              onClick={() => navigate("/")}
              style={{
                width: "100%",
                background: "#1B4332",
                color: "#fff",
                border: "none",
                padding: "14px 0",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                transition: "opacity 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = 0.9}
              onMouseOut={(e) => e.currentTarget.style.opacity = 1}
            >
              Back to Home
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {error && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 14px",
                background: "#fee",
                border: "1px solid #fcc",
                borderRadius: 12,
                fontSize: 13,
                color: "#c33"
              }}>
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor="email" style={{ fontSize: 12, fontWeight: 700, color: "#1B4332", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                disabled={loading}
                style={{
                  padding: "13px 14px",
                  border: "1px solid #EDE9E0",
                  borderRadius: 12,
                  fontSize: 14,
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#2D6A4F"}
                onBlur={(e) => e.target.style.borderColor = "#EDE9E0"}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? "#999" : "#1B4332",
                color: "#fff",
                border: "none",
                padding: "14px 0",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "opacity 0.2s"
              }}
              onMouseOver={(e) => !loading && (e.currentTarget.style.opacity = 0.9)}
              onMouseOut={(e) => !loading && (e.currentTarget.style.opacity = 1)}
            >
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  Sending Link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
