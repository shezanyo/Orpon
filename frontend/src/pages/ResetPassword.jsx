import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyResetToken, resetPassword } from "../utils/api";
import { KeyRound, CheckCircle2, AlertTriangle, Loader2, Check, X, Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  // Password Validation Rules
  const requirements = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "At least one uppercase letter (A-Z)", valid: /[A-Z]/.test(password) },
    { label: "At least one lowercase letter (a-z)", valid: /[a-z]/.test(password) },
    { label: "At least one number (0-9)", valid: /\d/.test(password) },
    { label: "At least one special character (@$!%*?&)", valid: /[@$!%*?&]/.test(password) }
  ];

  const allRulesMet = requirements.every(req => req.valid);

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setError("Invalid request. Missing reset token.");
        setVerifying(false);
        return;
      }

      try {
        const response = await verifyResetToken(token);
        if (response.success) {
          setTokenValid(true);
        } else {
          setError(response.message || "Invalid or expired password reset link.");
        }
      } catch (err) {
        setError(err.message || "Invalid or expired password reset link.");
      } finally {
        setVerifying(false);
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!allRulesMet) {
      setError("Please satisfy all password strength requirements.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword(token, password);
      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.message || "Failed to reset password. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Failed to reset password. Please try again.");
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
            <KeyRound size={24} />
          </div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: "#1B4332", marginBottom: 8 }}>
            Reset Password
          </h2>
          <p style={{ color: "#666", fontSize: 14, lineHeight: 1.5 }}>
            Create a secure, strong password for your Orpon account.
          </p>
        </div>

        {verifying ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "20px 0" }}>
            <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#2D6A4F" }} />
            <span style={{ fontSize: 14, color: "#666" }}>Verifying security token...</span>
          </div>
        ) : success ? (
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
                Password Reset Successful
              </span>
              <p style={{ fontSize: 13, color: "#2D6A4F", lineHeight: 1.5 }}>
                Your password has been successfully updated. You can now use your new password to log in.
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
              Go to Home & Log In
            </button>
          </div>
        ) : !tokenValid ? (
          <div style={{ animation: "fadeUp 0.3s ease both" }}>
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "#FDF0ED",
              border: "1px solid #F8D7DA",
              borderRadius: 16,
              padding: 24,
              textAlign: "center",
              marginBottom: 24
            }}>
              <AlertTriangle size={36} color="#DC3545" style={{ marginBottom: 12 }} />
              <span style={{ fontSize: 15, fontWeight: 700, color: "#842029", marginBottom: 6 }}>
                Invalid or Expired Link
              </span>
              <p style={{ fontSize: 13, color: "#842029", lineHeight: 1.5 }}>
                {error || "The password reset link is invalid, expired, or has already been used."}
              </p>
            </div>

            <button
              onClick={() => navigate("/forgot-password")}
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
              Request New Link
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

            {/* Password input */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor="password" style={{ fontSize: 12, fontWeight: 700, color: "#1B4332", textTransform: "uppercase", letterSpacing: 0.5 }}>
                New Password
              </label>
              <div style={{ position: "relative", display: "flex", width: "100%" }}>
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  disabled={loading}
                  style={{
                    padding: "13px 44px 13px 14px",
                    border: "1px solid #EDE9E0",
                    borderRadius: 12,
                    fontSize: 14,
                    outline: "none",
                    width: "100%",
                    transition: "border-color 0.2s"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#2D6A4F"}
                  onBlur={(e) => e.target.style.borderColor = "#EDE9E0"}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 4,
                    display: "flex",
                    alignItems: "center",
                    color: "#888"
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Live requirements list */}
            <div style={{
              background: "#F8F6F0",
              border: "1px solid #EDE9E0",
              borderRadius: 12,
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 8
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#1B4332", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Password Requirements
              </span>
              {requirements.map((req, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: req.valid ? "#2D6A4F" : "#777" }}>
                  {req.valid ? (
                    <Check size={14} strokeWidth={3} style={{ color: "#2D6A4F" }} />
                  ) : (
                    <X size={14} strokeWidth={3} style={{ color: "#DC3545" }} />
                  )}
                  <span style={{ textDecoration: req.valid ? "line-through" : "none", opacity: req.valid ? 0.7 : 1 }}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Confirm password input */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor="confirmPassword" style={{ fontSize: 12, fontWeight: 700, color: "#1B4332", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type={showPass ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
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
              disabled={loading || !allRulesMet || !confirmPassword}
              style={{
                background: loading ? "#999" : (allRulesMet && confirmPassword) ? "#1B4332" : "#ccc",
                color: "#fff",
                border: "none",
                padding: "14px 0",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                cursor: (loading || !allRulesMet || !confirmPassword) ? "not-allowed" : "pointer",
                marginTop: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "opacity 0.2s"
              }}
              onMouseOver={(e) => (allRulesMet && confirmPassword && !loading) && (e.currentTarget.style.opacity = 0.9)}
              onMouseOut={(e) => (allRulesMet && confirmPassword && !loading) && (e.currentTarget.style.opacity = 1)}
            >
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  Updating Password...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
