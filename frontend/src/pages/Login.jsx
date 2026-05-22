import { useState } from "react";
import { loginUser, registerUser } from "../utils/api";

export default function LoginModal({ loginTab, setLoginTab, setShowLogin, setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    
    if (!email || !pass) {
      setError("Email and password are required");
      return;
    }

    if (loginTab === "signup" && !name) {
      setError("Full name is required for signup");
      return;
    }

    setLoading(true);

    try {
      let response;

      if (loginTab === "login") {
        response = await loginUser(email, pass);
      } else {
        response = await registerUser(name, email, pass);
      }

      // Store token in localStorage
      if (response.token) {
        localStorage.setItem("authToken", response.token);
      }

      setIsLoggedIn(true);
      setShowLogin(false);
      
      // Reset form
      setEmail("");
      setPass("");
      setName("");
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
      <div style={{ background: "#fff", borderRadius: 28, padding: "40px 36px", width: "100%", maxWidth: 420, animation: "fadeUp 0.3s ease", boxShadow: "0 40px 100px rgba(0,0,0,0.2)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: "#1B4332", marginBottom: 4 }}>অ Orpon</div>
          <div style={{ display: "flex", background: "#F8F6F0", borderRadius: 12, padding: 4, marginTop: 20 }}>
            {["login", "signup"].map(tab => (
              <button key={tab} onClick={() => setLoginTab(tab)} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", background: loginTab === tab ? "#fff" : "transparent", color: loginTab === tab ? "#1A1A2E" : "#888", fontSize: 14, fontWeight: loginTab === tab ? 600 : 400, cursor: "pointer", boxShadow: loginTab === tab ? "0 2px 8px rgba(0,0,0,0.08)" : "none", transition: "all 0.2s" }}>
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
          {loginTab === "signup" && (
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" style={{ padding: "13px 14px", border: "1px solid #EDE9E0", borderRadius: 12, fontSize: 14, outline: "none" }} />
          )}
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email" style={{ padding: "13px 14px", border: "1px solid #EDE9E0", borderRadius: 12, fontSize: 14, outline: "none" }} />
          <input value={pass} onChange={e => setPass(e.target.value)} placeholder="Password" type="password" style={{ padding: "13px 14px", border: "1px solid #EDE9E0", borderRadius: 12, fontSize: 14, outline: "none" }} />
          <button onClick={handleSubmit} disabled={loading} style={{ background: loading ? "#999" : "#1B4332", color: "#fff", border: "none", padding: "14px 0", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}>
            {loading ? "⏳ " + (loginTab === "login" ? "Logging in..." : "Creating account...") : loginTab === "login" ? "Log in" : "Create account"}
          </button>
        </div>

        <div style={{ position: "relative", margin: "20px 0", textAlign: "center" }}>
          <div style={{ height: 1, background: "#EDE9E0" }} />
          <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "#fff", padding: "0 12px", fontSize: 12, color: "#aaa" }}>or</span>
        </div>

        <button style={{ width: "100%", border: "1px solid #EDE9E0", background: "#fff", padding: "12px 0", borderRadius: 12, fontSize: 14, color: "#555", cursor: "pointer", fontWeight: 500 }}>
          📱 Continue with Google
        </button>

        <p style={{ textAlign: "center", color: "#aaa", fontSize: 12, marginTop: 20 }}>
          By continuing, you agree to Orpon's Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}