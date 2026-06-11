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
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      {/* Image / Banner — fixed height */}
      <div
        style={{
          background: c.images && c.images.length > 0
            ? `url(${c.images[0]}) center/cover no-repeat`
            : `linear-gradient(135deg, ${c.color}22 0%, ${c.color}44 100%)`,
          height: 180,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: (c.images && c.images.length > 0) ? 0 : 48,
          position: "relative",
        }}
      >
        {(!c.images || c.images.length === 0) && c.emoji}
        <span style={{
          position: "absolute", top: 12, left: 12,
          background: c.color, color: "#fff",
          fontSize: 11, fontWeight: 600,
          padding: "3px 10px", borderRadius: 99,
          letterSpacing: "0.04em", textTransform: "uppercase", zIndex: 1
        }}>
          {c.category}
        </span>
        {c.daysLeft <= 7 && (
          <span style={{
            position: "absolute", top: 12, right: 12,
            background: "#C0392B", color: "#fff",
            fontSize: 11, fontWeight: 700,
            padding: "3px 10px", borderRadius: 99, zIndex: 1
          }}>
            ⚡ {c.daysLeft}d left
          </span>
        )}
      </div>

      {/* Card Body */}
      <div style={{
        padding: "18px 20px 22px",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
      }}>
        {/* Organizer */}
        <p style={{ fontSize: 12, color: "#888", marginBottom: 6, fontWeight: 500, flexShrink: 0 }}>
          by {c.organizer} {c.orgVerified && "✓"}
        </p>

        {/* Title — fixed height for 2 lines, clamp overflow */}
        <h3 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 16,
          fontWeight: 700,
          lineHeight: 1.4,
          color: "#1A1A2E",
          margin: 0,
          height: "2.8em",       /* exactly 2 lines at line-height 1.4 */
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}>
          {c.title}
        </h3>

        {/* Spacer pushes stats to bottom */}
        <div style={{ flex: 1 }} />

        {/* Progress + Stats — always at the bottom */}
        <div style={{ marginTop: 16, flexShrink: 0 }}>
          <ProgressBar value={p} color={c.color} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 13 }}>
            <span>
              <strong style={{ color: c.color, fontSize: 15 }}>{fmt(c.raised)}</strong>
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
    </div>
  );
}