import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const donationId = searchParams.get("donationId");
  const amount = searchParams.get("amount");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (donationId) {
      navigator.clipboard.writeText(donationId).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
      <div style={{ background: "#fff", border: "1px solid #EDE9E0", borderRadius: 24, padding: "48px 32px", boxShadow: "0 10px 40px rgba(0,0,0,0.04)", animation: "fadeUp 0.6s ease both" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, color: "#1B4332", marginBottom: 8 }}>
          Donation Successful!
        </h1>
        <p style={{ color: "#555", fontSize: 16, lineHeight: 1.6, marginBottom: 28 }}>
          Thank you so much for your generosity. Your contribution is already making a direct impact.
        </p>

        <div style={{ background: "#F8F6F0", borderRadius: 16, padding: "24px 20px", marginBottom: 32, border: "1px solid #EDE9E0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 15 }}>
            <span style={{ color: "#888" }}>Amount Contributed</span>
            <span style={{ fontWeight: 700, color: "#1B4332", fontSize: 18 }}>৳{parseFloat(amount || 0).toLocaleString()} BDT</span>
          </div>
          <div style={{ height: 1, background: "#EDE9E0", margin: "12px 0" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "left" }}>
            <span style={{ color: "#888", fontSize: 13 }}>Secure Transaction ID</span>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <code style={{ background: "#fff", padding: "8px 12px", borderRadius: 8, border: "1px solid #EDE9E0", fontSize: 13, wordBreak: "break-all", flex: 1 }}>
                {donationId || "ORN-N/A"}
              </code>
              <button 
                onClick={handleCopy} 
                style={{ background: copied ? "#2D6A4F" : "#1B4332", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", minWidth: 70, transition: "background 0.2s" }}
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <a 
            href="/" 
            style={{ display: "block", width: "100%", textDecoration: "none", background: "#1B4332", color: "#fff", border: "none", padding: "14px 0", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "transform 0.2s, background 0.2s" }}
            onMouseOver={(e) => e.target.style.background = "#2D6A4F"}
            onMouseOut={(e) => e.target.style.background = "#1B4332"}
          >
            Explore More Campaigns
          </a>
        </div>
      </div>
    </div>
  );
}
