export default function PaymentCancel() {
  return (
    <div style={{ maxWidth: 600, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
      <div style={{ background: "#fff", border: "1px solid #EDE9E0", borderRadius: 24, padding: "48px 32px", boxShadow: "0 10px 40px rgba(0,0,0,0.04)", animation: "fadeUp 0.6s ease both" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🕊️</div>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 36, fontWeight: 700, color: "#4B5563", marginBottom: 8 }}>
          Payment Cancelled
        </h1>
        <p style={{ color: "#555", fontSize: 16, lineHeight: 1.6, marginBottom: 28 }}>
          Your payment session has been cancelled. No funds were charged, and your checkout has been safely closed.
        </p>

        <div style={{ background: "#F3F4F6", borderRadius: 16, padding: "20px", marginBottom: 32, border: "1px solid #E5E7EB", color: "#4B5563", fontSize: 14 }}>
          If you decided to change your payment method, amount, or have other questions, you can always initiate a new donation at any time.
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <a 
            href="/" 
            style={{ display: "block", width: "100%", textDecoration: "none", background: "#1B4332", color: "#fff", border: "none", padding: "14px 0", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "transform 0.2s, background 0.2s" }}
            onMouseOver={(e) => e.target.style.background = "#2D6A4F"}
            onMouseOut={(e) => e.target.style.background = "#1B4332"}
          >
            Return to Campaigns
          </a>
        </div>
      </div>
    </div>
  );
}
