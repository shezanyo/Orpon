import { useState } from "react";
import { loginUser, registerUser } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck } from "lucide-react";

export default function LoginModal({ loginTab, setLoginTab, setShowLogin, setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nid, setNid] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();

  const handleSubmit = async () => {
    setError("");
    
    if (!email || !pass) {
      setError("Email and password are required");
      return;
    }

    if (loginTab === "signup") {
      if (!name || !phone || !nid || !confirmPass) {
        setError("Full name, phone number, NID, and password confirmation are required");
        return;
      }

      if (pass !== confirmPass) {
        setError("Passwords do not match");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError("Please enter a valid email address");
        return;
      }

      const phoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
      if (!phoneRegex.test(phone.trim())) {
        setError("Please enter a valid Bangladeshi mobile number (e.g. 01XXXXXXXXX)");
        return;
      }

      const nidRegex = /^\d{10}$|^\d{13}$|^\d{17}$/;
      if (!nidRegex.test(nid.trim())) {
        setError("Please enter a valid Bangladeshi NID card number (exactly 10, 13, or 17 digits)");
        return;
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(pass)) {
        setError("Password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, one number, and one special character");
        return;
      }
    }

    setLoading(true);

    try {
      let response;

      if (loginTab === "login") {
        response = await loginUser(email, pass);
      } else {
        response = await registerUser(name, email, pass, phone, nid, address);
      }

      if (response.token && response.user) {
        login(response.token, response.user);
      } else if (response.token) {
        // Fallback
        login(response.token, { email });
      }

      // Legacy prop fallback
      if (setIsLoggedIn) {
        setIsLoggedIn(true);
      }
      setShowLogin(false);
      
      // Reset form
      setEmail("");
      setPass("");
      setConfirmPass("");
      setName("");
      setPhone("");
      setNid("");
      setAddress("");
      setShowPass(false);
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={e => e.target === e.currentTarget && setShowLogin(false)}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <div style={{ background: "#fff", borderRadius: 28, padding: "40px 36px", width: "100%", maxWidth: 420, animation: "fadeUp 0.3s ease", transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)", boxShadow: "0 40px 100px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: "#1B4332", marginBottom: 4 }}>অ Orpon</div>
          <div style={{ display: "flex", background: "#F8F6F0", borderRadius: 12, padding: 4, marginTop: 20 }}>
            {["login", "signup"].map(tab => (
              <button key={tab} onClick={() => { setLoginTab(tab); setError(""); setConfirmPass(""); setShowPass(false); }} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", background: loginTab === tab ? "#fff" : "transparent", color: loginTab === tab ? "#1A1A2E" : "#888", fontSize: 14, fontWeight: loginTab === tab ? 600 : 400, cursor: "pointer", boxShadow: loginTab === tab ? "0 2px 8px rgba(0,0,0,0.08)" : "none", transition: "all 0.2s" }}>
                {tab === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {error && (
            <div style={{ padding: "10px 12px", background: "#fee", border: "1px solid #fcc", borderRadius: 8, fontSize: 13, color: "#c33", textAlign: "center" }}>
              {error}
            </div>
          )}
          
          <div style={{
            maxHeight: loginTab === "signup" ? "260px" : "0px",
            opacity: loginTab === "signup" ? 1 : 0,
            overflow: "hidden",
            transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
            display: "flex",
            flexDirection: "column",
            gap: 12
          }}>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" style={{ padding: "13px 14px", border: "1px solid #EDE9E0", borderRadius: 12, fontSize: 14, outline: "none" }} />
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone Number (e.g. 017XXXXXXXX)" style={{ padding: "13px 14px", border: "1px solid #EDE9E0", borderRadius: 12, fontSize: 14, outline: "none" }} />
            <input value={nid} onChange={e => setNid(e.target.value)} placeholder="NID Card Number (10, 13, or 17 digits)" style={{ padding: "13px 14px", border: "1px solid #EDE9E0", borderRadius: 12, fontSize: 14, outline: "none" }} />
            <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Address (Optional)" style={{ padding: "13px 14px", border: "1px solid #EDE9E0", borderRadius: 12, fontSize: 14, outline: "none" }} />
          </div>

          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email" style={{ padding: "13px 14px", border: "1px solid #EDE9E0", borderRadius: 12, fontSize: 14, outline: "none" }} />
          
          <div style={{ position: "relative", display: "flex", width: "100%" }}>
            <input
              value={pass}
              onChange={e => setPass(e.target.value)}
              placeholder="Password"
              type={showPass ? "text" : "password"}
              style={{ padding: "13px 44px 13px 14px", border: "1px solid #EDE9E0", borderRadius: 12, fontSize: 14, outline: "none", width: "100%" }}
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
                fontSize: 15,
                cursor: "pointer",
                padding: 4,
                display: "flex",
                alignItems: "center",
                userSelect: "none"
              }}
              title={showPass ? "Hide password" : "Show password"}
            >
              {showPass ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>

          <div style={{
            maxHeight: loginTab === "signup" ? "60px" : "0px",
            opacity: loginTab === "signup" ? 1 : 0,
            overflow: "hidden",
            transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
            display: "flex",
            flexDirection: "column"
          }}>
            <input
              value={confirmPass}
              onChange={e => setConfirmPass(e.target.value)}
              placeholder="Confirm Password"
              type={showPass ? "text" : "password"}
              style={{ padding: "13px 14px", border: "1px solid #EDE9E0", borderRadius: 12, fontSize: 14, outline: "none" }}
            />
          </div>

          <button onClick={handleSubmit} disabled={loading} style={{ background: loading ? "#999" : "#1B4332", color: "#fff", border: "none", padding: "14px 0", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}>
            {loading ? "⏳ " + (loginTab === "login" ? "Logging in..." : "Creating account...") : loginTab === "login" ? "Log in" : "Create account"}
          </button>
        </div>

        <div style={{
          marginTop: 24,
          padding: 16,
          background: "#F8F6F0",
          borderRadius: 16,
          border: "1px solid #EDE9E0"
        }}>
          <h4 style={{ 
            fontSize: 12, 
            fontWeight: 700, 
            color: "#1B4332", 
            textTransform: "uppercase", 
            letterSpacing: 0.5, 
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 6
          }}>
            <ShieldCheck size={14} /> Why Trust Orpon?
          </h4>
          <ul style={{ 
            listStyleType: "none", 
            padding: 0, 
            margin: 0, 
            display: "flex", 
            flexDirection: "column", 
            gap: 8,
            fontSize: 11,
            color: "#555",
            lineHeight: 1.4
          }}>
            <li style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
              <span style={{ color: "#2D6A4F", fontWeight: "bold" }}>✓</span>
              <span><strong>Verified Campaigns:</strong> strict Smart NID & documentation audit.</span>
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
              <span style={{ color: "#2D6A4F", fontWeight: "bold" }}>✓</span>
              <span><strong>Transparent Tracking:</strong> every donation is stored on an immutable ledger.</span>
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
              <span style={{ color: "#2D6A4F", fontWeight: "bold" }}>✓</span>
              <span><strong>Secure Payments:</strong> server-side verified sandbox checkout flows.</span>
            </li>
          </ul>
        </div>

        <p style={{ textAlign: "center", color: "#aaa", fontSize: 12, marginTop: 20 }}>
          By continuing, you agree to Orpon's Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}