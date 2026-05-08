import { HandHeart, LogOut, Menu, User, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/explore", label: "Explore Campaigns" },
];

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const initials = (user?.email?.[0] || "U").toUpperCase();

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    setIsMobileOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur">
      <div className="border-b border-slate-200">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="rounded-full bg-primary/10 p-2 text-primary">
              <HandHeart size={18} />
            </span>
            <span className="text-lg font-bold text-primary sm:text-xl">অর্পণ</span>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <a
              href="#how-it-works"
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              How It Works
            </a>
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {!isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
                >
                  Start a Campaign
                </button>
              </>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white"
                >
                  {initials}
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-soft">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/dashboard");
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <User size={16} />
                      My Dashboard
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/explore");
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <HandHeart size={16} />
                      My Campaigns
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {isMobileOpen && (
        <div className="border-b border-slate-200 bg-white md:hidden">
          <div className="mx-auto w-full max-w-6xl space-y-2 px-4 py-3 sm:px-6 lg:px-8">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {item.label}
              </NavLink>
            ))}
            <a
              href="#how-it-works"
              onClick={() => setIsMobileOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              How It Works
            </a>
            {!isAuthenticated ? (
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileOpen(false);
                    navigate("/login");
                  }}
                  className="w-full rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-primary"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileOpen(false);
                    navigate("/dashboard");
                  }}
                  className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
                >
                  Start a Campaign
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileOpen(false);
                    navigate("/dashboard");
                  }}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-left text-sm font-medium text-slate-700"
                >
                  My Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileOpen(false);
                    navigate("/explore");
                  }}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-left text-sm font-medium text-slate-700"
                >
                  My Campaigns
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-xl bg-red-50 px-4 py-2 text-left text-sm font-medium text-red-600"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-primary py-1.5 text-center text-xs text-white sm:text-sm">
        🇧🇩 Bangladesh&apos;s trusted donation platform — 100% transparent
      </div>
    </header>
  );
}
