import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Menu, X, ChevronDown, LogOut, User, Plus, Shield, Award, BarChart3, Trophy } from "lucide-react";

export default function Navbar({ page, nav, setShowLogin }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: scrolled || mobileMenuOpen ? "rgba(248,246,240,0.96)" : "rgba(248,246,240,0.7)",
      backdropFilter: scrolled || mobileMenuOpen ? "blur(16px)" : "blur(8px)",
      borderBottom: scrolled || mobileMenuOpen ? "1px solid #EDE9E0" : "1px solid transparent",
      padding: "0 5%", height: 64,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      transition: "all 0.3s ease",
    }}>
      {/* Brand Logo */}
      <div onClick={() => {
        setMobileMenuOpen(false);
        nav("home");
      }} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
        <img
          src="/orpon-icon.svg"
          alt="logo"
          style={{ width: 42, height: 42 }}
        />
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: "#1B4332", letterSpacing: "-0.02em" }}>
          Orpon
        </span>
      </div>

      {/* DESKTOP NAVIGATION */}
      <div className="hidden md:flex" style={{ alignItems: "center", gap: 8 }}>
        {[{ label: "Campaigns", key: "campaigns" }, { label: "Leaderboard", key: "leaderboard" }].map((item) => (
          <button
            key={item.key}
            onClick={() => nav(item.key)}
            style={{
              background: "none",
              border: "none",
              padding: "8px 14px",
              fontSize: 14,
              fontWeight: 600,
              color: page === item.key ? "#1B4332" : "#555",
              borderRadius: 8,
              cursor: "pointer",
              transition: "color 0.2s"
            }}
          >
            {item.label}
          </button>
        ))}

        {isLoggedIn ? (
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                onClick={() => nav("create")}
                style={{
                  background: "#D4A017",
                  border: "none",
                  padding: "9px 18px",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#fff",
                  borderRadius: 10,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(212,160,23,0.15)",
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
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
                <ChevronDown size={14} color="#888" style={{ transform: menuOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
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
                  width: 210,
                  background: "#fff",
                  border: "1px solid #EDE9E0",
                  borderRadius: 16,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                  padding: "8px 0",
                  zIndex: 100,
                  display: "flex",
                  flexDirection: "column",
                  animation: "fadeUp 0.2s ease both"
                }}>
                  {(() => {
                    const menuItems = [
                      { label: "Profile", key: "profile", icon: User },
                      { label: "My Campaigns", key: "my-campaigns", icon: Award },
                      { label: "Campaign Analytics", key: "analytics", icon: BarChart3 }
                    ];
                    if (user?.role === "admin" || user?.role === "super_admin") {
                      menuItems.push({ label: "Admin Panel", key: "admin", icon: Shield });
                    }
                    return menuItems;
                  })().map((item) => {
                    const Icon = item.icon;
                    return (
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
                        <Icon size={16} color={page === item.key ? "#1B4332" : "#666"} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}

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
                    <LogOut size={16} color="#922B21" />
                    <span>Log out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <button
              onClick={() => setShowLogin(true)}
              style={{
                background: "none",
                border: "1.5px solid #1B4332",
                padding: "8px 18px",
                fontSize: 14,
                fontWeight: 600,
                color: "#1B4332",
                borderRadius: 10,
                marginLeft: 8,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#1B43320d"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              Log in
            </button>
            <button
              onClick={() => nav("create")}
              style={{
                background: "#1B4332",
                border: "none",
                padding: "9px 18px",
                fontSize: 14,
                fontWeight: 600,
                color: "#fff",
                borderRadius: 10,
                cursor: "pointer",
                transition: "transform 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              Start Campaign
            </button>
          </>
        )}
      </div>

      {/* MOBILE HAMBURGER BUTTON */}
      <div className="flex md:hidden" style={{ alignItems: "center" }}>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ background: "none", border: "none", padding: 6, cursor: "pointer", color: "#1B4332" }}
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <div style={{
          position: "absolute",
          top: 64,
          left: 0,
          right: 0,
          background: "#F8F6F0",
          borderBottom: "1px solid #EDE9E0",
          boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
          padding: "20px 5% 30px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          zIndex: 99,
          animation: "fadeDown 0.2s ease both"
        }} className="flex md:hidden">
          <style>{`
            @keyframes fadeDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
          `}</style>
          
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              nav("campaigns");
            }}
            style={{
              background: page === "campaigns" ? "#1B433211" : "none",
              border: "none",
              padding: "12px 16px",
              fontSize: 15,
              fontWeight: 600,
              color: "#1B4332",
              borderRadius: 10,
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: 12
            }}
          >
            <Award size={18} />
            Campaigns
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              nav("leaderboard");
            }}
            style={{
              background: page === "leaderboard" ? "#1B433211" : "none",
              border: "none",
              padding: "12px 16px",
              fontSize: 15,
              fontWeight: 600,
              color: "#1B4332",
              borderRadius: 10,
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: 12
            }}
          >
            <Trophy size={18} />
            Leaderboard
          </button>

          {isLoggedIn && (
            <>
              <div style={{ height: 1, background: "#EDE9E0", margin: "4px 0" }} />
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  nav("profile");
                }}
                style={{
                  background: page === "profile" ? "#1B433211" : "none",
                  border: "none",
                  padding: "12px 16px",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#555",
                  borderRadius: 10,
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 12
                }}
              >
                <User size={18} />
                Profile
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  nav("my-campaigns");
                }}
                style={{
                  background: page === "my-campaigns" ? "#1B433211" : "none",
                  border: "none",
                  padding: "12px 16px",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#555",
                  borderRadius: 10,
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 12
                }}
              >
                <Award size={18} />
                My Campaigns
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  nav("analytics");
                }}
                style={{
                  background: page === "analytics" ? "#1B433211" : "none",
                  border: "none",
                  padding: "12px 16px",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#555",
                  borderRadius: 10,
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 12
                }}
              >
                <BarChart3 size={18} />
                Campaign Analytics
              </button>

              {(user?.role === "admin" || user?.role === "super_admin") && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    nav("admin");
                  }}
                  style={{
                    background: page === "admin" ? "#1B433211" : "none",
                    border: "none",
                    padding: "12px 16px",
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#555",
                    borderRadius: 10,
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: 12
                  }}
                >
                  <Shield size={18} />
                  Admin Panel
                </button>
              )}
            </>
          )}

          <div style={{ height: 1, background: "#EDE9E0", margin: "4px 0" }} />

          {isLoggedIn ? (
            <>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  nav("create");
                }}
                style={{
                  background: "#D4A017",
                  border: "none",
                  padding: "14px",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#fff",
                  borderRadius: 12,
                  cursor: "pointer",
                  textAlign: "center"
                }}
              >
                + Start a Campaign
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                  nav("home");
                }}
                style={{
                  background: "#922B2111",
                  border: "none",
                  padding: "14px",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#922B21",
                  borderRadius: 12,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8
                }}
              >
                <LogOut size={16} />
                Log out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowLogin(true);
                }}
                style={{
                  background: "none",
                  border: "1.5px solid #1B4332",
                  padding: "12px",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#1B4332",
                  borderRadius: 12,
                  cursor: "pointer",
                  textAlign: "center"
                }}
              >
                Log in
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  nav("create");
                }}
                style={{
                  background: "#1B4332",
                  border: "none",
                  padding: "14px",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#fff",
                  borderRadius: 12,
                  cursor: "pointer",
                  textAlign: "center"
                }}
              >
                Start Campaign
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}