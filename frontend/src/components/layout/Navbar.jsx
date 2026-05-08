import { useState, useEffect } from "react";

export default function Navbar({ page, nav, isLoggedIn, setShowLogin, setIsLoggedIn }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: scrolled ? "rgba(248,246,240,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? "1px solid #EDE9E0" : "1px solid transparent",
      padding: "0 5%", height: 64,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      transition: "all 0.3s ease",
    }}>
      <div onClick={() => nav("home")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, background: "#1B4332", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#D4A017", fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 20 }}>
          অ
        </div>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: "#1B4332", letterSpacing: "-0.02em" }}>
          Orpon
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {[{ label: "Campaigns", key: "campaigns" }, { label: "How it works", key: "how" }].map((item) => (
          <button key={item.key} onClick={() => nav(item.key)} style={{ background: "none", border: "none", padding: "8px 14px", fontSize: 14, fontWeight: 500, color: page === item.key ? "#1B4332" : "#555", borderRadius: 8, cursor: "pointer" }}>
            {item.label}
          </button>
        ))}

        {isLoggedIn ? (
          <>
            <button onClick={() => nav("create")} style={{ background: "#D4A017", border: "none", padding: "9px 18px", fontSize: 14, fontWeight: 600, color: "#fff", borderRadius: 10, marginLeft: 8, cursor: "pointer" }}>
              + Start a Campaign
            </button>
            <button onClick={() => setIsLoggedIn(false)} style={{ background: "none", border: "1px solid #EDE9E0", padding: "8px 14px", fontSize: 13, color: "#888", borderRadius: 10, cursor: "pointer" }}>
              Log out
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setShowLogin(true)} style={{ background: "none", border: "1px solid #1B4332", padding: "8px 16px", fontSize: 14, fontWeight: 500, color: "#1B4332", borderRadius: 10, marginLeft: 8, cursor: "pointer" }}>
              Log in
            </button>
            <button onClick={() => nav("create")} style={{ background: "#1B4332", border: "none", padding: "9px 18px", fontSize: 14, fontWeight: 600, color: "#fff", borderRadius: 10, cursor: "pointer" }}>
              Start Campaign
            </button>
          </>
        )}
      </div>
    </nav>
  );
}