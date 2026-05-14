import { useState, useEffect } from "react";
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
    <div>
      {/* HERO */}
      <section style={{ padding: "80px 5% 100px", maxWidth: 1200, margin: "0 auto", textAlign: "center", animation: "fadeUp 0.7s ease both" }}>
        <div style={{ display: "inline-block", background: "#1B433211", color: "#1B4332", padding: "6px 18px", borderRadius: 99, fontSize: 13, fontWeight: 600, marginBottom: 24, letterSpacing: "0.05em" }}>
          🇧🇩 Bangladesh's Transparent Donation Platform
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(40px, 6vw, 80px)", fontWeight: 700, lineHeight: 1.1, color: "#1A1A2E", marginBottom: 24, letterSpacing: "-0.02em" }}>
          Give with <em style={{ color: "#1B4332", fontStyle: "italic" }}>trust.</em>
          <br />
          Change lives with <em style={{ color: "#D4A017", fontStyle: "italic" }}>proof.</em>
        </h1>
        <p style={{ fontSize: 18, color: "#555", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7, fontWeight: 300 }}>
          Every taka tracked. Every story verified. Orpon makes charitable giving transparent, simple, and impactful — for every Bangladeshi.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => nav("campaigns")} style={{ background: "#1B4332", color: "#fff", border: "none", padding: "16px 36px", borderRadius: 14, fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
            Browse Campaigns →
          </button>
          <button onClick={() => isLoggedIn ? nav("create") : setShowLogin(true)} style={{ background: "transparent", color: "#1B4332", border: "2px solid #1B433233", padding: "16px 36px", borderRadius: 14, fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
            Start a Campaign
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, maxWidth: 640, margin: "64px auto 0", background: "#1B4332", borderRadius: 20, overflow: "hidden" }}>
          {[
            { val: "৳" + (count1 / 1000000).toFixed(1) + "Cr+", label: "Raised" },
            { val: count2.toLocaleString() + "+", label: "Donors" },
            { val: count3 + "+", label: "Campaigns" },
          ].map((s, i) => (
            <div key={i} style={{ padding: "28px 20px", textAlign: "center", background: i === 1 ? "#D4A017" : "#1B4332" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{s.val}</div>
              <div style={{ color: i === 1 ? "#fff9" : "#95D5B2", fontSize: 13, marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED CAMPAIGNS */}
      <section style={{ padding: "0 5% 80px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 38, fontWeight: 700, color: "#1A1A2E", letterSpacing: "-0.02em" }}>
              Urgent campaigns
            </h2>
            <p style={{ color: "#888", fontSize: 14, marginTop: 4 }}>Verified, transparent, and time-sensitive</p>
          </div>
          <button onClick={() => nav("campaigns")} style={{ background: "none", border: "1px solid #EDE9E0", padding: "10px 20px", borderRadius: 10, fontSize: 14, color: "#555", cursor: "pointer" }}>
            See all →
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
          {campaigns.slice(0, 3).map(c => <CampaignCard key={c.id} c={c} openCampaign={openCampaign} />)}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: "#1B4332", padding: "80px 5%", textAlign: "center" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, fontWeight: 700, color: "#fff", marginBottom: 12 }}>How Orpon works</h2>
          <p style={{ color: "#95D5B2", marginBottom: 56, fontSize: 15 }}>Simple for donors. Powerful for organizers.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 32 }}>
            {[
              { step: "01", icon: "✍️", title: "Create a campaign", desc: "Sign up and post your campaign in minutes. Add your story, goal, and bank details." },
              { step: "02", icon: "🔗", title: "Share your link", desc: "Each campaign gets a unique link and QR code. Share on WhatsApp, Facebook, anywhere." },
              { step: "03", icon: "💳", title: "Receive donations", desc: "Anyone can donate — no account needed. bKash, Nagad, card, all supported." },
              { step: "04", icon: "📊", title: "Full transparency", desc: "Every transaction is logged and publicly visible. Donors can verify their contribution." },
            ].map(s => (
              <div key={s.step} style={{ background: "#ffffff0d", border: "1px solid #ffffff1a", borderRadius: 20, padding: "32px 24px", textAlign: "left" }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{s.icon}</div>
                <div style={{ color: "#D4A017", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 10 }}>STEP {s.step}</div>
                <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 600, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ color: "#95D5B2", fontSize: 14, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 5%", textAlign: "center", background: "#F8F6F0" }}>
        <div style={{ background: "linear-gradient(135deg, #D4A01711 0%, #1B433211 100%)", border: "1px solid #EDE9E0", borderRadius: 28, padding: "64px 40px", maxWidth: 700, margin: "0 auto" }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🤲</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 38, fontWeight: 700, color: "#1A1A2E", marginBottom: 16 }}>
            Start giving today
          </h2>
          <p style={{ color: "#666", fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
            No account needed to donate. Just find a cause you care about and give — it's that simple.
          </p>
          <button onClick={() => nav("campaigns")} style={{ background: "#1B4332", color: "#fff", border: "none", padding: "16px 40px", borderRadius: 14, fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
            Find a cause →
          </button>
        </div>
      </section>
    </div>
  );
}