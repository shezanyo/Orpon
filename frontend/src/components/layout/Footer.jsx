export default function Footer() {
  return (
    <footer style={{ background: "#1A1A2E", padding: "60px 5% 32px", color: "#ffffff88" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div>
                <img
                  src="/orpon-icon.svg"
                  alt="logo"
                  style={{ width: 42, height: 42 }}
                />
              </div>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: "#fff" }}>Orpon</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 260 }}>
              Bangladesh's transparent donation platform. Every taka tracked. Every story verified.
            </p>
          </div>
          {[
            { title: "Platform", links: ["Browse Campaigns", "Start a Campaign", "How it Works", "Verification"] },
            { title: "Support", links: ["Help Center", "Contact Us", "Report Abuse", "FAQs"] },
            { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy"] },
          ].map(col => (
            <div key={col.title}>
              <h4 style={{ color: "#fff", fontSize: 13, fontWeight: 700, marginBottom: 14, letterSpacing: "0.05em", textTransform: "uppercase" }}>{col.title}</h4>
              {col.links.map(link => (
                <div key={link} style={{ fontSize: 14, marginBottom: 8, cursor: "pointer", color: "#ffffff66" }}>{link}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid #ffffff11", paddingTop: 24, display: "flex", justifyContent: "space-between", fontSize: 12 }}>
          <span>© 2026 Orpon · Made with love for Bangladesh</span>
          <span>Registered in Dhaka, Bangladesh</span>
        </div>
      </div>
    </footer>
  );
}