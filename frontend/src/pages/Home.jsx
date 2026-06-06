import { useState, useEffect } from "react";
import { 
  Coins, 
  Users, 
  Award, 
  FileText, 
  Share2, 
  Heart, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  TrendingUp
} from "lucide-react";
import CampaignCard from "../components/CampaignCard";
import { fmt } from "../utils/format";

export default function Home({ nav, campaigns, openCampaign, setShowLogin, isLoggedIn }) {
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const [count3, setCount3] = useState(0);

  useEffect(() => {
    const animate = (setter, target, duration) => {
      const step = target / (duration / 16);
      let current = 0;
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        setter(Math.round(current));
        if (current >= target) clearInterval(timer);
      }, 16);
    };
    setTimeout(() => {
      animate(setCount1, 12400000, 2000);
      animate(setCount2, 4280, 2200);
      animate(setCount3, 186, 1800);
    }, 400);
  }, []);

  return (
    <div style={{ overflowX: "hidden" }}>
      <style>{`
        @media (max-width: 640px) {
          .stat-card {
            border-left: none !important;
            border-bottom: 1px solid #EDE9E0;
            padding: 24px 0 !important;
          }
          .stat-card:last-child {
            border-bottom: none !important;
            padding-bottom: 0 !important;
          }
        }
      `}</style>

      {/* HERO */}
      <section style={{ padding: "80px 5% 60px", maxWidth: 1200, margin: "0 auto", textAlign: "center", animation: "fadeUp 0.7s ease both" }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "clamp(42px, 6.5vw, 76px)", fontWeight: 800, lineHeight: 1.15, color: "#1A1A2E", marginBottom: 24, letterSpacing: "-0.03em" }}>
          Give with <em style={{ color: "#1B4332", fontStyle: "normal", backgroundImage: "linear-gradient(120deg, #1B4332 0%, #2D6A4F 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>trust.</em>
          <br />
          Change lives with <em style={{ color: "#D4A017", fontStyle: "normal", backgroundImage: "linear-gradient(120deg, #D4A017 0%, #F5B041 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>proof.</em>
        </h1>
        <p style={{ fontSize: 18, color: "#555", maxWidth: 600, margin: "0 auto 40px", lineHeight: 1.8, fontWeight: 400 }}>
          Every taka tracked. Every story verified. Orpon makes charitable giving transparent, simple, and deeply impactful — for every Bangladeshi.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 60 }}>
          <button 
            onClick={() => nav("campaigns")} 
            style={{ 
              background: "#1B4332", 
              color: "#fff", 
              border: "none", 
              padding: "16px 36px", 
              borderRadius: 14, 
              fontSize: 16, 
              fontWeight: 600, 
              cursor: "pointer",
              boxShadow: "0 10px 20px rgba(27,67,50,0.15)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "transform 0.2s, box-shadow 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 14px 24px rgba(27,67,50,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 10px 20px rgba(27,67,50,0.15)";
            }}
          >
            Browse Campaigns <ArrowRight size={18} />
          </button>
          <button 
            onClick={() => isLoggedIn ? nav("create") : setShowLogin(true)} 
            style={{ 
              background: "#fff", 
              color: "#1B4332", 
              border: "1px solid rgba(27,67,50,0.2)", 
              padding: "16px 36px", 
              borderRadius: 14, 
              fontSize: 16, 
              fontWeight: 600, 
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
              transition: "transform 0.2s, border-color 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.borderColor = "rgba(27,67,50,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.borderColor = "rgba(27,67,50,0.2)";
            }}
          >
            Start a Campaign
          </button>
        </div>

        {/* Stats Revamp */}
        <div 
          style={{ 
            maxWidth: 800, 
            margin: "0 auto", 
            background: "#fff", 
            borderRadius: 24, 
            border: "1px solid #EDE9E0",
            boxShadow: "0 10px 30px rgba(27,67,50,0.03)",
            padding: "32px 24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 24
          }}
        >
          {[
            { val: "৳" + (count1 / 1000000).toFixed(1) + "Cr+", label: "Total Raised", desc: "For urgent causes nationwide", icon: Coins, color: "#1B4332" },
            { val: count2.toLocaleString() + "+", label: "Verified Donors", desc: "Direct impact contributors", icon: Users, color: "#D4A017" },
            { val: count3 + "+", label: "Completed Campaigns", desc: "With 100% distribution proof", icon: Award, color: "#1B4332" },
          ].map((s, i) => {
            const StatIcon = s.icon;
            return (
              <div 
                key={i} 
                style={{ 
                  padding: "12px 20px", 
                  textAlign: "center",
                  borderLeft: i > 0 ? "1px solid #EDE9E0" : "none",
                }}
                className="stat-card"
              >
                <div style={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: "50%", 
                  backgroundColor: `${s.color}12`, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  color: s.color,
                  margin: "0 auto 16px"
                }}>
                  <StatIcon size={24} />
                </div>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 32, fontWeight: 800, color: "#1A1A2E", lineHeight: 1.1 }}>{s.val}</div>
                <div style={{ color: "#1B4332", fontSize: 14, fontWeight: 600, marginTop: 8 }}>{s.label}</div>
                <div style={{ color: "#888", fontSize: 12, marginTop: 4, lineHeight: 1.4 }}>{s.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURED CAMPAIGNS */}
      <section style={{ padding: "40px 5% 80px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
          <div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 38, fontWeight: 700, color: "#1A1A2E", letterSpacing: "-0.02em" }}>
              Urgent campaigns
            </h2>
            <p style={{ color: "#666", fontSize: 14, marginTop: 4 }}>Verified, transparent, and time-sensitive</p>
          </div>
          <button 
            onClick={() => nav("campaigns")} 
            style={{ 
              background: "#fff", 
              border: "1px solid #EDE9E0", 
              padding: "10px 22px", 
              borderRadius: 10, 
              fontSize: 14, 
              fontWeight: 600,
              color: "#1B4332", 
              cursor: "pointer",
              transition: "border-color 0.2s, transform 0.2s",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#1B4332";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#EDE9E0";
              e.currentTarget.style.transform = "none";
            }}
          >
            See all campaigns →
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
          {campaigns.slice(0, 3).map(c => <CampaignCard key={c.id} c={c} openCampaign={openCampaign} />)}
        </div>
      </section>

      {/* WHY TRUST ORPON SECTION */}
      <section style={{ padding: "100px 5%", background: "#F8F6F0", borderTop: "1px solid #EDE9E0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: 8, 
              background: "rgba(27,67,50,0.06)", 
              color: "#1B4332", 
              fontSize: 12, 
              fontWeight: 700, 
              textTransform: "uppercase", 
              letterSpacing: "0.05em", 
              padding: "6px 14px", 
              borderRadius: 99, 
              marginBottom: 16,
              border: "1px solid rgba(27,67,50,0.1)",
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}>
              <ShieldCheck size={14} />
              <span>Trust & Security</span>
            </div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "clamp(32px, 4.5vw, 42px)", fontWeight: 800, color: "#1A1A2E", lineHeight: 1.2, letterSpacing: "-0.02em", marginBottom: 16 }}>
              Why donors trust Orpon
            </h2>
            <p style={{ color: "#555", fontSize: 16, lineHeight: 1.7, maxWidth: 640, margin: "0 auto" }}>
              We've built Bangladesh's first transparent platform designed to secure and verify every single donation. Give with absolute confidence.
            </p>
          </div>

          {/* Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 28 }}>
            {[
              {
                icon: ShieldCheck,
                title: "Vetted & Verified",
                desc: "Every campaign undergoes strict validation of identity, medical documents, and organization status before going live.",
                color: "#1B4332"
              },
              {
                icon: TrendingUp,
                title: "Real-Time Tracking",
                desc: "Follow the money. See direct logs of all donations and distributions, with complete bank and mobile wallet ledger transparency.",
                color: "#D4A017"
              },
              {
                icon: Users,
                title: "Community Accountability",
                desc: "Donors and community members can comment, report anomalies, and request updates directly on the campaign page.",
                color: "#1B4332"
              },
              {
                icon: Heart,
                title: "Zero Middleware Delays",
                desc: "Donations are processed directly to the organizers' validated accounts, ensuring urgent help reaches them without delay.",
                color: "#922B21"
              }
            ].map((item, idx) => {
              const ItemIcon = item.icon;
              return (
                <div 
                  key={idx} 
                  style={{ 
                    background: "#fff", 
                    border: "1px solid #EDE9E0", 
                    borderRadius: 24, 
                    padding: "36px 28px",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.015)",
                    transition: "transform 0.25s, box-shadow 0.25s",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    textAlign: "left"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 16px 40px rgba(27,67,50,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.015)";
                  }}
                >
                  <div style={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: 12, 
                    backgroundColor: `${item.color}12`, 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    color: item.color,
                    marginBottom: 20
                  }}>
                    <ItemIcon size={24} />
                  </div>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, color: "#1A1A2E", marginBottom: 10 }}>{item.title}</h3>
                  <p style={{ color: "#555", fontSize: 14, lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: "#1B4332", padding: "80px 5%", textAlign: "center" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 42, fontWeight: 700, color: "#fff", marginBottom: 12 }}>How Orpon works</h2>
          <p style={{ color: "#95D5B2", marginBottom: 56, fontSize: 15 }}>Simple for donors. Powerful for organizers.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 32 }}>
            {[
              { step: "01", icon: FileText, title: "Create a campaign", desc: "Sign up and post your campaign in minutes. Add your story, goal, and bank details." },
              { step: "02", icon: Share2, title: "Share your link", desc: "Each campaign gets a unique link and QR code. Share on WhatsApp, Facebook, anywhere." },
              { step: "03", icon: Coins, title: "Receive donations", desc: "Anyone can donate — no account needed. bKash, Nagad, card, all supported." },
              { step: "04", icon: ShieldCheck, title: "Full transparency", desc: "Every transaction is logged and publicly visible. Donors can verify their contribution." },
            ].map((s, idx) => {
              const StepIcon = s.icon;
              return (
                <div 
                  key={s.step} 
                  style={{ 
                    background: "rgba(255, 255, 255, 0.04)", 
                    border: "1px solid rgba(255, 255, 255, 0.08)", 
                    borderRadius: 24, 
                    padding: "32px 24px", 
                    textAlign: "left",
                    transition: "transform 0.25s, background-color 0.25s, border-color 0.25s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.07)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                  }}
                >
                  <div style={{ 
                    background: "rgba(212, 160, 23, 0.12)", 
                    color: "#D4A017", 
                    width: 52, 
                    height: 52, 
                    borderRadius: 14, 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    marginBottom: 20 
                  }}>
                    <StepIcon size={24} />
                  </div>
                  <div style={{ color: "#D4A017", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 10 }}>STEP {s.step}</div>
                  <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{s.title}</h3>
                  <p style={{ color: "#95D5B2", fontSize: 14, lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 5%", textAlign: "center", background: "#F8F6F0" }}>
        <div 
          style={{ 
            background: "linear-gradient(135deg, rgba(212, 160, 23, 0.05) 0%, rgba(27, 67, 50, 0.05) 100%)", 
            border: "1px solid #EDE9E0", 
            borderRadius: 32, 
            padding: "64px 40px", 
            maxWidth: 760, 
            margin: "0 auto",
            boxShadow: "0 4px 24px rgba(0,0,0,0.01)"
          }}
        >
          <div style={{ 
            width: 64, 
            height: 64, 
            borderRadius: 20, 
            backgroundColor: "rgba(27,67,50,0.08)", 
            color: "#1B4332",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            margin: "0 auto 24px"
          }}>
            <Sparkles size={32} />
          </div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 38, fontWeight: 800, color: "#1A1A2E", marginBottom: 16, letterSpacing: "-0.02em" }}>
            Start giving today
          </h2>
          <p style={{ color: "#666", fontSize: 16, lineHeight: 1.8, marginBottom: 32, maxWidth: 500, margin: "0 auto 32px" }}>
            No account is needed to make a donation. Simply discover a campaign you care about and help make a difference instantly.
          </p>
          <button 
            onClick={() => nav("campaigns")} 
            style={{ 
              background: "#1B4332", 
              color: "#fff", 
              border: "none", 
              padding: "16px 40px", 
              borderRadius: 14, 
              fontSize: 16, 
              fontWeight: 600, 
              cursor: "pointer",
              boxShadow: "0 10px 20px rgba(27,67,50,0.15)",
              transition: "transform 0.2s, box-shadow 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 14px 24px rgba(27,67,50,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 10px 20px rgba(27,67,50,0.15)";
            }}
          >
            Find a cause to support →
          </button>
        </div>
      </section>
    </div>
  );
}