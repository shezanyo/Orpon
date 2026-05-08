import { useState } from "react";
import ProgressBar from "./ui/ProgressBar";
import { fmt, pct } from "../utils/format";

export default function CampaignCard({ c, openCampaign }) {
  const [hov, setHov] = useState(false);
  const p = pct(c.raised, c.goal);

  return (
    <div
      onClick={() => openCampaign(c)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#fff",
        borderRadius: 20,
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: hov ? "0 20px 60px rgba(27,67,50,0.15)" : "0 2px 20px rgba(0,0,0,0.06)",
        transform: hov ? "translateY(-4px)" : "none",
        transition: "all 0.25s ease",
        border: "1px solid #EDE9E0",
        animation: "fadeUp 0.5s ease both",
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${c.color}22 0%, ${c.color}44 100%)`,
          height: 140,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 48,
          position: "relative",
        }}
      >
        {c.emoji}
        <span style={{ position: "absolute", top: 12, left: 12, background: c.color, color: "#fff", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          {c.category}
        </span>
        {c.daysLeft <= 7 && (
          <span style={{ position: "absolute", top: 12, right: 12, background: "#C0392B", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99 }}>
            ⚡ {c.daysLeft}d left
          </span>
        )}
      </div>

      <div style={{ padding: "20px 20px 24px" }}>
        <p style={{ fontSize: 12, color: "#888", marginBottom: 6, fontWeight: 500 }}>
          by {c.organizer} {c.orgVerified && "✓"}
        </p>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, lineHeight: 1.3, marginBottom: 14, color: "#1A1A2E" }}>
          {c.title}
        </h3>
        <ProgressBar value={p} color={c.color} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 13 }}>
          <span>
            <strong style={{ color: c.color, fontSize: 16 }}>{fmt(c.raised)}</strong>
            <span style={{ color: "#888" }}> raised</span>
          </span>
          <span style={{ color: "#888" }}>
            <strong style={{ color: "#1A1A2E" }}>{p}%</strong> of {fmt(c.goal)}
          </span>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
          👥 {c.donors} donors · {c.daysLeft} days left
        </div>
      </div>
    </div>
  );
}