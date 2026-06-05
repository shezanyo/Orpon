import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function Navbar({ page, nav, setShowLogin }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();

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
        <div>
          <img
            src="/orpon-icon.svg"
            alt="logo"
            style={{ width: 42, height: 42 }}
          />
        </div>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: "#1B4332", letterSpacing: "-0.02em" }}>
          Orpon
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {[{ label: "Campaigns", key: "campaigns" }, { label: "Leaderboard", key: "leaderboard" }].map((item) => (
          <button key={item.key} onClick={() => nav(item.key)} style={{ background: "none", border: "none", padding: "8px 14px", fontSize: 14, fontWeight: 500, color: page === item.key ? "#1B4332" : "#555", borderRadius: 8, cursor: "pointer" }}>
            {item.label}
          </button>
        ))}

        {isLoggedIn ? (
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => nav("create")} style={{ background: "#D4A017", border: "none", padding: "9px 18px", fontSize: 14, fontWeight: 600, color: "#fff", borderRadius: 10, cursor: "pointer" }}>
                + Start a Campaign
              </button>

              <div
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#fff",
                  border: "1px solid #EDE9E0",
                  padding: "6px 14px",
                  borderRadius: 12,
                  cursor: "pointer",
                  userSelect: "none",
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#1B4332"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#EDE9E0"}
              >
                <div style={{
                  background: "linear-gradient(135deg, #2D6A4F, #1B4332)",
                  color: "#fff",
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 600
                }}>
                  {user?.full_name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.full_name?.split(" ")[0]}
                </span>
                <span style={{ fontSize: 10, color: "#888", transform: menuOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
              </div>
            </div>

            {menuOpen && (
              <>
                <div
                  onClick={() => setMenuOpen(false)}
                  style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }}
                />

                <div style={{
                  position: "absolute",
                  right: 0,
                  top: 46,
                  width: 200,
                  background: "#fff",
                  border: "1px solid #EDE9E0",
                  borderRadius: 16,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                  padding: "8px 0",
                  zIndex: 100,
                  display: "flex",
                  flexDirection: "column",
                  animation: "fadeUp 0.2s ease both"
                }}>
                   {(() => {
                    const menuItems = [
                      { label: "Profile", key: "profile", icon: "👤" },
                      { label: "My Campaigns", key: "my-campaigns", icon: "📣" },
                      { label: "Campaign Analytics", key: "analytics", icon: "📊" }
                    ];
                    if (user?.role === "admin" || user?.role === "super_admin") {
                      menuItems.push({ label: "Admin Panel", key: "admin", icon: "🛡️" });
                    }
                    return menuItems;
                  })().map((item) => (
                    <button
                      key={item.key}
                      onClick={() => {
                        setMenuOpen(false);
                        nav(item.key);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        textAlign: "left",
                        padding: "10px 16px",
                        fontSize: 13,
                        fontWeight: 500,
                        color: page === item.key ? "#1B4332" : "#555",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        transition: "background 0.2s"
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "#F8F6F0"}
                      onMouseLeave={e => e.currentTarget.style.background = "none"}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}

                  <div style={{ borderTop: "1px solid #EDE9E0", margin: "6px 0" }} />

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                      nav("home");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      textAlign: "left",
                      padding: "10px 16px",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#922B21",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#FDF2F2"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                  >
                    <span>🚪</span>
                    <span>Log out</span>
                  </button>
                </div>
              </>
            )}
          </div>
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