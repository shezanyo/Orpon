import { useNavigate } from "react-router-dom";

export default function Footer({ nav }) {
  const navigate = useNavigate();

  const handleLinkClick = (link) => {
    if (link === "Browse Campaigns") {
      if (nav) nav("campaigns");
    } else if (link === "Start a Campaign") {
      if (nav) nav("create");
    } else if (link === "Leaderboard") {
      if (nav) nav("leaderboard");
    } else {
      const slug = link.toLowerCase().replace(/\s+/g, "-");
      navigate(`/info/${slug}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer style={{ background: "#1A1A2E", padding: "60px 5% 32px", color: "#ffffff88" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div>
                <img
                  src="/orpon-icon.svg"
                  alt="logo"
                  style={{ width: 42, height: 42 }}
                />
              </div>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 700, color: "#fff" }}>Orpon</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 260 }}>
              Bangladesh's transparent donation platform. Every taka tracked. Every story verified.
            </p>
          </div>
          {[
            { title: "Platform", links: ["Browse Campaigns", "Start a Campaign", "Leaderboard", "Verification"] },
            { title: "Support", links: ["Help Center", "Contact Us", "Report Abuse", "FAQs"] },
            { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy"] },
          ].map(col => (
            <div key={col.title}>
              <h4 style={{ color: "#fff", fontSize: 13, fontWeight: 700, marginBottom: 14, letterSpacing: "0.05em", textTransform: "uppercase" }}>{col.title}</h4>
              {col.links.map(link => (
                <div 
                  key={link} 
                  onClick={() => handleLinkClick(link)}
                  style={{ 
                    fontSize: 14, 
                    marginBottom: 8, 
                    cursor: "pointer", 
                    color: "#ffffff66",
                    transition: "color 0.2s ease" 
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = "#ffffffaa"}
                  onMouseLeave={e => e.currentTarget.style.color = "#ffffff66"}
                >
                  {link}
                </div>
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