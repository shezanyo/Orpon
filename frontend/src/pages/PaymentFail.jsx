import { useSearchParams } from "react-router-dom";

export default function PaymentFail() {
  const [searchParams] = useSearchParams();
  const errorMessage = searchParams.get("message") || "The payment transaction could not be authorized.";

  return (
    <div style={{ maxWidth: 600, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
      <div style={{ background: "#fff", border: "1px solid #EDE9E0", borderRadius: 24, padding: "48px 32px", boxShadow: "0 10px 40px rgba(0,0,0,0.04)", animation: "fadeUp 0.6s ease both" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>⚠️</div>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 36, fontWeight: 700, color: "#991B1B", marginBottom: 8 }}>
          Payment Failed
        </h1>
        <p style={{ color: "#555", fontSize: 16, lineHeight: 1.6, marginBottom: 28 }}>
          We encountered an issue while processing your donation. Don't worry, no funds were deducted from your account.
        </p>

        <div style={{ background: "#FEF2F2", borderRadius: 16, padding: "20px", marginBottom: 32, border: "1px solid #FCA5A5", textAlign: "left" }}>
          <span style={{ color: "#991B1B", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>Error Message</span>
          <p style={{ color: "#7F1D1D", fontFamily: "monospace", fontSize: 13, margin: 0, wordBreak: "break-all" }}>
            {errorMessage}
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <a 
            href="/" 
            style={{ display: "block", width: "100%", textDecoration: "none", background: "#1B4332", color: "#fff", border: "none", padding: "14px 0", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "transform 0.2s, background 0.2s" }}
            onMouseOver={(e) => e.target.style.background = "#2D6A4F"}
            onMouseOut={(e) => e.target.style.background = "#1B4332"}
          >
            Return Home
          </a>
        </div>
      </div>
    </div>
  );
}
