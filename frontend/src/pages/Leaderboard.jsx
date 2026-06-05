import { useState, useEffect } from "react";
import { Trophy, TrendingUp, Heart, Users, Award, Crown, Medal, Star, ArrowUp, Sparkles } from "lucide-react";
import { getLeaderboard } from "../utils/api";

const MEDAL_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];
const MEDAL_LABELS = ["🥇", "🥈", "🥉"];

const formatBDT = (n) => {
  if (n == null) return "৳0";
  const num = Number(n);
  if (num >= 1_000_000) return `৳${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `৳${(num / 1_000).toFixed(1)}K`;
  return `৳${num.toLocaleString()}`;
};

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <div
    style={{
      background: "rgba(255,255,255,0.7)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.3)",
      borderRadius: 20,
      padding: "28px 24px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 10,
      animation: `fadeUp 0.6s ${delay}s both`,
      flex: 1,
      minWidth: 160,
    }}
  >
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: 16,
        background: `linear-gradient(135deg, ${color}22, ${color}44)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon size={24} color={color} />
    </div>
    <span style={{ fontSize: 28, fontWeight: 800, color: "#1A1A2E", letterSpacing: "-0.02em" }}>{value}</span>
    <span style={{ fontSize: 13, fontWeight: 500, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
  </div>
);

const RankBadge = ({ rank }) => {
  if (rank <= 3) {
    return (
      <span style={{ fontSize: 28, lineHeight: 1 }}>{MEDAL_LABELS[rank - 1]}</span>
    );
  }
  return (
    <span
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "#F0F0F0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        fontWeight: 700,
        color: "#888",
      }}
    >
      {rank}
    </span>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "12px 24px",
      borderRadius: 14,
      border: "none",
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
      background: active
        ? "linear-gradient(135deg, #1B4332, #2D6A4F)"
        : "rgba(255,255,255,0.5)",
      color: active ? "#fff" : "#666",
      boxShadow: active ? "0 4px 20px rgba(27,67,50,0.25)" : "none",
      backdropFilter: "blur(10px)",
    }}
  >
    <Icon size={16} />
    {label}
  </button>
);

const ProgressBar = ({ pct }) => (
  <div style={{ width: "100%", height: 6, borderRadius: 3, background: "#E8E8E8", overflow: "hidden" }}>
    <div
      style={{
        height: "100%",
        width: `${Math.min(pct, 100)}%`,
        borderRadius: 3,
        background: pct >= 100 ? "linear-gradient(90deg, #10B981, #059669)" : "linear-gradient(90deg, #2D6A4F, #52B788)",
        transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)",
      }}
    />
  </div>
);

export default function Leaderboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("donors");
  const [hoveredRow, setHoveredRow] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getLeaderboard();
        if (res.success) setData(res);
      } catch (e) {
        console.error("[Leaderboard] Failed to load:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", color: "#888", gap: 10 }}>
        <Trophy style={{ animation: "spin 2s linear infinite", color: "#D4A017" }} size={28} />
        <span style={{ fontSize: 16, fontWeight: 500 }}>Loading leaderboard...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", color: "#888" }}>
        <span style={{ fontSize: 16 }}>Unable to load leaderboard data.</span>
      </div>
    );
  }

  const { stats, topDonors, topCampaigns, topFundraisers } = data;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px 80px" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes glow { 0%,100% { box-shadow: 0 0 20px rgba(212,160,23,0.2); } 50% { box-shadow: 0 0 40px rgba(212,160,23,0.4); } }
      `}</style>

      {/* Hero Section */}
      <div style={{ textAlign: "center", marginBottom: 48, animation: "fadeUp 0.5s both" }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 20px",
          background: "linear-gradient(135deg, #FEF3C7, #FDE68A)",
          borderRadius: 99,
          marginBottom: 16,
        }}>
          <Sparkles size={16} color="#D4A017" />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#92400E", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Live Rankings
          </span>
        </div>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(32px, 5vw, 52px)",
          fontWeight: 700,
          color: "#1A1A2E",
          lineHeight: 1.15,
          marginBottom: 12,
        }}>
          Community Leaderboard
        </h1>
        <p style={{ fontSize: 16, color: "#777", maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
          Celebrating the generous souls and impactful campaigns powering change across Bangladesh.
        </p>
      </div>

      {/* Platform Stats */}
      <div style={{
        display: "flex",
        gap: 16,
        marginBottom: 48,
        flexWrap: "wrap",
      }}>
        <StatCard icon={Heart} label="Total Raised" value={formatBDT(stats.total_raised)} color="#E11D48" delay={0.1} />
        <StatCard icon={TrendingUp} label="Donations" value={Number(stats.total_donations || 0).toLocaleString()} color="#2D6A4F" delay={0.2} />
        <StatCard icon={Award} label="Campaigns" value={Number(stats.total_campaigns || 0).toLocaleString()} color="#D4A017" delay={0.3} />
        <StatCard icon={Users} label="Unique Donors" value={Number(stats.unique_donors || 0).toLocaleString()} color="#7C3AED" delay={0.4} />
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: "flex",
        gap: 8,
        marginBottom: 32,
        flexWrap: "wrap",
        animation: "fadeUp 0.5s 0.3s both",
      }}>
        <TabButton active={activeTab === "donors"} onClick={() => setActiveTab("donors")} icon={Crown} label="Top Donors" />
        <TabButton active={activeTab === "campaigns"} onClick={() => setActiveTab("campaigns")} icon={Trophy} label="Top Campaigns" />
        <TabButton active={activeTab === "fundraisers"} onClick={() => setActiveTab("fundraisers")} icon={Star} label="Top Fundraisers" />
      </div>

      {/* Leaderboard Content */}
      <div style={{
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.3)",
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
        animation: "fadeUp 0.5s 0.4s both",
      }}>
        {/* Tab: Top Donors */}
        {activeTab === "donors" && (
          <div>
            <div style={{
              padding: "24px 28px 16px",
              borderBottom: "1px solid #F0F0F0",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}>
              <Crown size={22} color="#D4A017" />
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1A1A2E" }}>Top Donors</h2>
              <span style={{ fontSize: 13, color: "#999", marginLeft: "auto" }}>By total amount donated</span>
            </div>
            {topDonors.length === 0 ? (
              <div style={{ padding: 48, textAlign: "center", color: "#999" }}>No donations yet. Be the first!</div>
            ) : (
              topDonors.map((d, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredRow(`d-${i}`)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "18px 28px",
                    borderBottom: i < topDonors.length - 1 ? "1px solid #F5F5F5" : "none",
                    background: hoveredRow === `d-${i}`
                      ? "rgba(45,106,79,0.04)"
                      : i < 3
                        ? `rgba(${MEDAL_COLORS[i] === "#FFD700" ? "255,215,0" : MEDAL_COLORS[i] === "#C0C0C0" ? "192,192,192" : "205,127,50"},0.04)`
                        : "transparent",
                    transition: "background 0.2s",
                  }}
                >
                  <RankBadge rank={i + 1} />
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: `linear-gradient(135deg, ${["#2D6A4F", "#D4A017", "#7C3AED", "#E11D48", "#0891B2"][i % 5]}33, ${["#2D6A4F", "#D4A017", "#7C3AED", "#E11D48", "#0891B2"][i % 5]}66)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    fontWeight: 700,
                    color: ["#2D6A4F", "#D4A017", "#7C3AED", "#E11D48", "#0891B2"][i % 5],
                    flexShrink: 0,
                  }}>
                    {(d.display_name || "?")[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#1A1A2E", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {d.display_name}
                      {d.privacy_type === "anonymous" && (
                        <span style={{ marginLeft: 8, fontSize: 11, color: "#999", fontWeight: 400 }}>Anonymous</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
                      {d.donation_count} donation{d.donation_count !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: i === 0 ? "#D4A017" : "#1B4332",
                      ...(i === 0 ? { animation: "pulse 3s infinite" } : {}),
                    }}>
                      {formatBDT(d.total_donated)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab: Top Campaigns */}
        {activeTab === "campaigns" && (
          <div>
            <div style={{
              padding: "24px 28px 16px",
              borderBottom: "1px solid #F0F0F0",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}>
              <Trophy size={22} color="#2D6A4F" />
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1A1A2E" }}>Top Campaigns</h2>
              <span style={{ fontSize: 13, color: "#999", marginLeft: "auto" }}>By total amount raised</span>
            </div>
            {topCampaigns.length === 0 ? (
              <div style={{ padding: 48, textAlign: "center", color: "#999" }}>No campaigns yet.</div>
            ) : (
              topCampaigns.map((c, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredRow(`c-${i}`)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "18px 28px",
                    borderBottom: i < topCampaigns.length - 1 ? "1px solid #F5F5F5" : "none",
                    background: hoveredRow === `c-${i}` ? "rgba(45,106,79,0.04)" : "transparent",
                    transition: "background 0.2s",
                  }}
                >
                  <RankBadge rank={i + 1} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#1A1A2E", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {c.title}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                      <ProgressBar pct={c.progress_pct || 0} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: (c.progress_pct || 0) >= 100 ? "#059669" : "#2D6A4F", whiteSpace: "nowrap" }}>
                        {(c.progress_pct || 0).toFixed(0)}%
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                      {c.donor_count || 0} donor{(c.donor_count || 0) !== 1 ? "s" : ""} • Goal: {formatBDT(c.target_amount)}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: "#1B4332" }}>
                      {formatBDT(c.raised_amount)}
                    </div>
                    <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>raised</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab: Top Fundraisers */}
        {activeTab === "fundraisers" && (
          <div>
            <div style={{
              padding: "24px 28px 16px",
              borderBottom: "1px solid #F0F0F0",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}>
              <Star size={22} color="#7C3AED" />
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1A1A2E" }}>Top Fundraisers</h2>
              <span style={{ fontSize: 13, color: "#999", marginLeft: "auto" }}>Campaign creators by total raised</span>
            </div>
            {topFundraisers.length === 0 ? (
              <div style={{ padding: 48, textAlign: "center", color: "#999" }}>No fundraisers yet.</div>
            ) : (
              topFundraisers.map((f, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredRow(`f-${i}`)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "18px 28px",
                    borderBottom: i < topFundraisers.length - 1 ? "1px solid #F5F5F5" : "none",
                    background: hoveredRow === `f-${i}` ? "rgba(45,106,79,0.04)" : "transparent",
                    transition: "background 0.2s",
                  }}
                >
                  <RankBadge rank={i + 1} />
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: `linear-gradient(135deg, ${["#7C3AED", "#2D6A4F", "#D4A017", "#E11D48", "#0891B2"][i % 5]}33, ${["#7C3AED", "#2D6A4F", "#D4A017", "#E11D48", "#0891B2"][i % 5]}66)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    fontWeight: 700,
                    color: ["#7C3AED", "#2D6A4F", "#D4A017", "#E11D48", "#0891B2"][i % 5],
                    flexShrink: 0,
                  }}>
                    {(f.full_name || "?")[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#1A1A2E" }}>
                      {f.full_name}
                    </div>
                    <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
                      {f.campaign_count} campaign{f.campaign_count !== 1 ? "s" : ""} • {f.total_donors || 0} total donors
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: "#7C3AED" }}>
                      {formatBDT(f.total_raised)}
                    </div>
                    <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>raised</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div style={{
        textAlign: "center",
        marginTop: 48,
        animation: "fadeUp 0.5s 0.6s both",
      }}>
        <p style={{ fontSize: 15, color: "#888", marginBottom: 8 }}>
          Every donation counts. Make your mark on the leaderboard.
        </p>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          color: "#2D6A4F",
          fontWeight: 600,
        }}>
          <ArrowUp size={14} />
          Rankings update in real-time
        </div>
      </div>
    </div>
  );
}
