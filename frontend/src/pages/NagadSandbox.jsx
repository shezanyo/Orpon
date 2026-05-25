import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { API_URL } from "../utils/api";

export default function NagadSandbox() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [step, setStep] = useState(1); // 1: Mobile number, 2: OTP, 3: PIN, 4: Loading/Complete
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMobileSubmit = (e) => {
    e.preventDefault();
    if (!mobileNumber.match(/^01[3-9]\d{8}$/)) {
      setError("Please enter a valid 11-digit Bangladeshi mobile number.");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1000);
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (otp !== "123456") {
      setError("Invalid OTP. For sandbox testing, use OTP: 123456");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 1000);
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    if (pin !== "12121") {
      setError("Invalid PIN. For sandbox testing, use PIN: 12121");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/payment/nagad/callback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          otp,
          pin,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || "Nagad payment verification failed.");
        setLoading(false);
        return;
      }

      setStep(4);
      setLoading(false);
      // Redirect to frontend success route
      window.location.href = `/payment/success?donationId=${data.donationId}&amount=${data.amount}`;
    } catch (err) {
      console.error("Nagad callback API exception:", err);
      setError("Unable to reach Orpon verification server.");
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#F5F5F5", fontFamily: "Arial, sans-serif" }}>
      <div style={{ width: 380, background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}>
        {/* HEADER */}
        <div style={{ background: "linear-gradient(135deg, #EC1C24 0%, #F58220 100%)", padding: "24px 20px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, tracking: 1, textShadow: "1px 1px 2px rgba(0,0,0,0.2)" }}>nagad</div>
            <div style={{ fontSize: 10, opacity: 0.9, marginTop: 2 }}>Sandbox checkout</div>
          </div>
          <div style={{ border: "2px solid #fff", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 700 }}>
            ৳ Sandbox
          </div>
        </div>

        {/* CONTAINER */}
        <div style={{ padding: "30px 24px" }}>
          {error && (
            <div style={{ background: "#FDE8E8", color: "#E02424", padding: "10px 12px", borderRadius: 8, fontSize: 12, marginBottom: 16, border: "1px solid #F8B4B4", lineHeight: 1.4 }}>
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0" }}>
              <div className="nagad-spinner" style={{ width: 40, height: 40, border: "4px solid rgba(245,130,32,0.2)", borderTop: "4px solid #F58220", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
              `}</style>
              <p style={{ marginTop: 16, fontSize: 14, color: "#888", fontWeight: 600 }}>Verifying payment session...</p>
            </div>
          ) : (
            <>
              {step === 1 && (
                <form onSubmit={handleMobileSubmit}>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontSize: 13, color: "#555", fontWeight: 700, marginBottom: 8 }}>Merchant Account</label>
                    <input readOnly value="Orpon Donation Platform" style={{ width: "100%", boxSizing: "border-box", padding: "12px", border: "1px solid #E5E7EB", borderRadius: 6, fontSize: 14, background: "#F9FAFB", color: "#374151", fontWeight: 600 }} />
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontSize: 13, color: "#555", fontWeight: 700, marginBottom: 8 }}>Your Nagad Account Number</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 017XXXXXXXX" 
                      required 
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                      maxLength={11}
                      style={{ width: "100%", boxSizing: "border-box", padding: "12px", border: "1px solid #D1D5DB", borderRadius: 6, fontSize: 14, outline: "none" }} 
                    />
                  </div>

                  <div style={{ fontSize: 11, color: "#777", lineHeight: 1.4, marginBottom: 24 }}>
                    By clicking "Proceed", you agree with Nagad's <strong>Terms & Conditions</strong>. Keep this sandbox page active to finalize your simulation.
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button type="button" onClick={() => window.location.href = "/payment/cancel"} style={{ flex: 1, padding: "12px", background: "#E5E7EB", border: "none", borderRadius: 6, color: "#4B5563", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                      Cancel
                    </button>
                    <button type="submit" style={{ flex: 1, padding: "12px", background: "#F58220", border: "none", borderRadius: 6, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                      Proceed
                    </button>
                  </div>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleOtpSubmit}>
                  <div style={{ marginBottom: 20, textAlign: "center" }}>
                    <p style={{ fontSize: 14, color: "#555", marginBottom: 6 }}>Verification Code sent to mobile</p>
                    <strong style={{ fontSize: 15, color: "#111" }}>{mobileNumber}</strong>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontSize: 13, color: "#555", fontWeight: 700, marginBottom: 8 }}>Verification Code (OTP)</label>
                    <input 
                      type="text" 
                      placeholder="Enter 123456" 
                      required 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      maxLength={6}
                      style={{ width: "100%", boxSizing: "border-box", padding: "12px", border: "1px solid #D1D5DB", borderRadius: 6, fontSize: 14, outline: "none", letterSpacing: 6, textAlign: "center", fontWeight: 700 }} 
                    />
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button type="button" onClick={() => setStep(1)} style={{ flex: 1, padding: "12px", background: "#E5E7EB", border: "none", borderRadius: 6, color: "#4B5563", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                      Back
                    </button>
                    <button type="submit" style={{ flex: 1, padding: "12px", background: "#F58220", border: "none", borderRadius: 6, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                      Proceed
                    </button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={handlePinSubmit}>
                  <div style={{ marginBottom: 20, textAlign: "center" }}>
                    <p style={{ fontSize: 14, color: "#555", marginBottom: 6 }}>Final validation step</p>
                    <strong style={{ fontSize: 14, color: "#F58220" }}>Enter test PIN to authorize payment</strong>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontSize: 13, color: "#555", fontWeight: 700, marginBottom: 8 }}>Nagad PIN</label>
                    <input 
                      type="password" 
                      placeholder="Enter 12121" 
                      required 
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                      maxLength={5}
                      style={{ width: "100%", boxSizing: "border-box", padding: "12px", border: "1px solid #D1D5DB", borderRadius: 6, fontSize: 14, outline: "none", letterSpacing: 8, textAlign: "center", fontWeight: 700 }} 
                    />
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button type="button" onClick={() => setStep(2)} style={{ flex: 1, padding: "12px", background: "#E5E7EB", border: "none", borderRadius: 6, color: "#4B5563", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                      Back
                    </button>
                    <button type="submit" style={{ flex: 1, padding: "12px", background: "#F58220", border: "none", borderRadius: 6, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                      Submit
                    </button>
                  </div>
                </form>
              )}

              {step === 4 && (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: 44, color: "#F58220", marginBottom: 12 }}>✓</div>
                  <strong style={{ fontSize: 16, color: "#111", display: "block" }}>Payment Authorized</strong>
                  <p style={{ fontSize: 12, color: "#888", marginTop: 6 }}>Redirecting back to Orpon...</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* FOOTER */}
        <div style={{ background: "#F9FAFB", padding: "14px 20px", borderTop: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "#888" }}>
          <span>Helpline: 16167</span>
          <span>© Nagad Sandbox 2026</span>
        </div>
      </div>
    </div>
  );
}
