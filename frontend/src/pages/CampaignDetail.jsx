import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProgressBar from "../components/ui/ProgressBar";
import QRCodeSVG from "../components/ui/QRCodeSVG";
import { fmt, pct } from "../utils/format";
import { getTransactions } from "../utils/api";
import { 
  Loader2, 
  Heart, 
  Share2, 
  ShieldCheck, 
  Users, 
  ArrowLeft,
  X
} from "lucide-react";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
};

const getInitials = (name) => {
  if (!name) return "AN";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getHashColor = (name) => {
  if (!name) return "#40916C";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ["#2D6A4F", "#1B4332", "#40916C", "#52B788", "#1A3A3A", "#2B4C5E", "#3A2B5E", "#5E2B42"];
  return colors[Math.abs(hash) % colors.length];
};

export default function CampaignDetail({ c, nav }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showAllDonors, setShowAllDonors] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [errorTx, setErrorTx] = useState("");

  useEffect(() => {
    let active = true;
    const fetchTxs = async () => {
      try {
        setLoadingTx(true);
        const data = await getTransactions();
        if (active) {
          if (data?.success && Array.isArray(data.transactions)) {
            const campaignTxs = data.transactions.filter(
              t => String(t.campaign_id) === String(c.id)
            );
            setTransactions(campaignTxs);
          } else {
            setErrorTx("Failed to load transactions.");
          }
        }
      } catch (err) {
        console.error("Error fetching transactions:", err);
        if (active) {
          setErrorTx("Failed to fetch transactions.");
        }
      } finally {
        if (active) {
          setLoadingTx(false);
        }
      }
    };
    fetchTxs();
    return () => {
      active = false;
    };
  }, [c.id]);

  const shareUrl = `${window.location.origin}/campaign/${c.slug}`;
  const p = pct(c.raised, c.goal);

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDonate = () => {
    navigate(`/donate/${c.id}`);
  };

  const completedTx = transactions.filter(t => t.status === "Completed");

  if (showAllDonors) {
    return (
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "30px 5% 80px", animation: "fadeUp 0.4s ease both" }}>
        {/* Back Button */}
        <button
          onClick={() => {
            setShowAllDonors(false);
            window.scrollTo({ top: 0, behavior: "instant" });
          }}
          style={{ background: "none", border: "none", color: "#888", fontSize: 14, cursor: "pointer", marginBottom: 24, padding: 0, display: "inline-flex", alignItems: "center", gap: 6, transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#1A1A2E"; e.currentTarget.style.transform = "translateX(-3px)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#888"; e.currentTarget.style.transform = "translateX(0)"; }}
        >
          <ArrowLeft size={16} /> Back to fundraiser
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24, borderBottom: "1px solid #EDE9E0", paddingBottom: 16 }}>
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 700, color: "#1A1A2E", margin: 0 }}>
              Donors ({completedTx.length})
            </h1>
            <p style={{ fontSize: 14, color: "#888", margin: "4px 0 0 0" }}>
              Total raised: <strong style={{ color: c.color }}>{fmt(completedTx.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0))}</strong>
            </p>
          </div>
        </div>

        {completedTx.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", background: "#fff", borderRadius: 18, border: "1px solid #EDE9E0" }}>
            <p style={{ color: "#888", fontSize: 15, margin: 0 }}>No donations yet for this fundraiser.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {completedTx.map((t) => (
              <div key={t.id} style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "16px 20px", background: "#fff", border: "1px solid #EDE9E0",
                borderRadius: 16, transition: "all 0.15s ease",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor = "#D3CCBE"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.02)"; e.currentTarget.style.borderColor = "#EDE9E0"; }}
              >
                <div style={{
                  width: 46, height: 46, borderRadius: "50%", background: getHashColor(t.display_name),
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 14, color: "#fff", flexShrink: 0,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
                }}>
                  {getInitials(t.display_name)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.display_name || "Anonymous"}
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: c.color, flexShrink: 0, marginLeft: 8 }}>
                      {fmt(parseFloat(t.amount || 0))}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "#888" }}>
                    <span style={{
                      padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700,
                      background: t.payment_method === "bKash" ? "#E2136E12" : t.payment_method === "Nagad" ? "#F5822012" : t.payment_method === "Card" ? "#1E3A8A12" : "#F8F6F0",
                      color: t.payment_method === "bKash" ? "#E2136E" : t.payment_method === "Nagad" ? "#F58220" : t.payment_method === "Card" ? "#1E3A8A" : "#888"
                    }}>
                      {t.payment_method || "Direct"}
                    </span>
                    <span>{formatDate(t.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "30px 5% 80px", animation: "fadeUp 0.5s ease both" }}>
      {/* Back Button */}
      <button
        onClick={() => nav("campaigns")}
        style={{ background: "none", border: "none", color: "#888", fontSize: 14, cursor: "pointer", marginBottom: 24, padding: 0, display: "inline-flex", alignItems: "center", gap: 6, transition: "all 0.2s" }}
        onMouseEnter={e => { e.currentTarget.style.color = "#1A1A2E"; e.currentTarget.style.transform = "translateX(-3px)"; }}
        onMouseLeave={e => { e.currentTarget.style.color = "#888"; e.currentTarget.style.transform = "translateX(0)"; }}
      >
        <ArrowLeft size={16} /> Back to campaigns
      </button>

      {/* Badges */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <span style={{ background: c.color, color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", padding: "5px 14px", borderRadius: 99 }}>{c.category}</span>
        {c.orgVerified && <span style={{ background: "#ECFDF5", color: "#065F46", fontSize: 11, fontWeight: 700, padding: "5px 14px", borderRadius: 99, border: "1px solid #A7F3D0" }}>✓ Verified</span>}
      </div>

      {/* Title */}
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 700, lineHeight: 1.15, color: "#1A1A2E", margin: "0 0 28px 0" }}>{c.title}</h1>

      {/* 2-Column Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 40, alignItems: "start" }}>

        {/* ===== LEFT COLUMN ===== */}
        <div>
          {/* Hero Image */}
          <div style={{
            background: `linear-gradient(135deg, ${c.color}22, ${c.color}55)`,
            borderRadius: 20, height: 340, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 88, marginBottom: 24, border: `1px solid ${c.color}33`,
            position: "relative", overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.04)"
          }}>
            {c.emoji}
            <div style={{
              position: "absolute", bottom: 14, left: 14,
              background: "rgba(255,255,255,0.85)", backdropFilter: "blur(6px)",
              padding: "5px 12px", borderRadius: 10, fontSize: 11, fontWeight: 600, color: "#1A1A2E"
            }}>
              🔒 Blockchain-Verified Ledger
            </div>
          </div>

          {/* Organizer */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 0", borderTop: "1px solid #EDE9E0", borderBottom: "1px solid #EDE9E0", marginBottom: 28 }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%", background: c.color,
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 700, flexShrink: 0, boxShadow: "0 3px 8px rgba(0,0,0,0.08)"
            }}>
              {c.organizer ? c.organizer[0].toUpperCase() : "O"}
            </div>
            <div>
              <p style={{ fontSize: 15, color: "#444", margin: 0, lineHeight: 1.4 }}>
                Fundraiser organized by <strong style={{ color: "#1A1A2E" }}>{c.organizer}</strong>
              </p>
              <p style={{ fontSize: 13, color: "#888", margin: "2px 0 0 0" }}>Transparency verified organizer</p>
            </div>
          </div>

          {/* Story */}
          <div style={{ marginBottom: 36 }}>
            {c.story.split("\n\n").map((para, i) => (
              <p key={i} style={{ color: "#444", fontSize: 15, lineHeight: 1.8, marginBottom: 14 }}>{para}</p>
            ))}
          </div>

          {/* Share */}
          <div style={{ background: "#F8F6F0", border: "1px solid #EDE9E0", borderRadius: 18, padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: "#1A1A2E", display: "flex", alignItems: "center", gap: 6 }}>
              <Share2 size={16} style={{ color: c.color }} /> Share this fundraiser
            </h3>
            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <input readOnly value={shareUrl} style={{ flex: 1, padding: "10px 14px", border: "1px solid #EDE9E0", borderRadius: 10, fontSize: 13, background: "#fff", color: "#555", outline: "none" }} />
              <button onClick={copyLink} style={{ background: copied ? "#2D6A4F" : "#1B4332", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", minWidth: 90, transition: "all 0.2s" }}>
                {copied ? "✓ Copied!" : "Copy link"}
              </button>
            </div>
            <button onClick={() => setShowQR(!showQR)} style={{ background: "#fff", border: "1px solid #EDE9E0", padding: "8px 16px", borderRadius: 10, fontSize: 13, color: "#555", fontWeight: 600, cursor: "pointer" }}>
              {showQR ? "Hide" : "Show"} QR Code
            </button>
            {showQR && (
              <div style={{ marginTop: 16, display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 8, background: "#fff", padding: 16, borderRadius: 14, border: "1px solid #EDE9E0" }}>
                <QRCodeSVG value={shareUrl} size={140} />
                <p style={{ fontSize: 11, color: "#888", margin: 0 }}>Scan to open campaign</p>
              </div>
            )}
          </div>
        </div>

        {/* ===== RIGHT COLUMN: Sticky Donate Panel ===== */}
        <div style={{ position: "sticky", top: 80 }}>
          <div style={{
            background: "#fff", border: "1px solid #EDE9E0", borderRadius: 22, padding: 28,
            boxShadow: "0 8px 40px rgba(0,0,0,0.08)", animation: "fadeUp 0.5s 0.15s ease both"
          }}>
            {/* Raised Amount */}
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 800, color: c.color }}>{fmt(c.raised)}</span>
            </div>
            <p style={{ color: "#888", fontSize: 14, marginBottom: 16 }}>raised of {fmt(c.goal)} goal</p>

            {/* Progress */}
            <ProgressBar value={p} color={c.color} />

            {/* Stats */}
            <div style={{ display: "flex", gap: 20, marginTop: 16, marginBottom: 20, fontSize: 14, color: "#555" }}>
              <span><strong style={{ color: "#1A1A2E", fontSize: 17 }}>{c.donors}</strong> donors</span>
              <span><strong style={{ color: "#1A1A2E", fontSize: 17 }}>{c.daysLeft}</strong> days left</span>
            </div>

            <div style={{ height: 1, background: "#EDE9E0", margin: "0 0 20px 0" }} />

            {/* Donate Now */}
            <button
              onClick={handleDonate}
              style={{
                width: "100%", background: "#1B4332", color: "#fff", border: "none",
                padding: "16px 0", borderRadius: 12, fontSize: 16, fontWeight: 700,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 4px 14px rgba(27,67,50,0.2)", transition: "all 0.2s ease"
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(27,67,50,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(27,67,50,0.2)"; }}
            >
              <Heart size={18} fill="#fff" /> Donate now
            </button>

            {/* Share Button */}
            <button
              onClick={copyLink}
              style={{
                width: "100%", background: "#fff", color: "#1B4332", border: "1.5px solid #1B4332",
                padding: "13px 0", borderRadius: 12, fontSize: 14, fontWeight: 700,
                cursor: "pointer", marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.2s ease"
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(27,67,50,0.04)"}
              onMouseLeave={e => e.currentTarget.style.background = "#fff"}
            >
              <Share2 size={16} /> {copied ? "Link Copied!" : "Share"}
            </button>

            {/* Trust Badge */}
            <div style={{
              display: "flex", gap: 10, alignItems: "flex-start", marginTop: 20,
              fontSize: 11, color: "#888", lineHeight: 1.5, background: "#F8F6F0",
              padding: "12px 14px", borderRadius: 12, border: "1px solid #EDE9E0"
            }}>
              <ShieldCheck size={18} style={{ color: "#52B788", flexShrink: 0, marginTop: 1 }} />
              <div>
                <strong style={{ color: "#555" }}>Orpon Guarantee.</strong> Every donation is tracked on our blockchain ledger. Zero platform fees.
              </div>
            </div>

            {/* Recent Donors */}
            <div style={{ marginTop: 20 }}>
              <div style={{ height: 1, background: "#EDE9E0", marginBottom: 16 }} />
              <p style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
                Recent donors
              </p>

              {loadingTx ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 0", color: "#888" }}>
                  <Loader2 className="animate-spin" style={{ width: 14, height: 14, color: c.color }} />
                  <span style={{ fontSize: 13 }}>Loading...</span>
                </div>
              ) : completedTx.length === 0 ? (
                <p style={{ fontSize: 13, color: "#888", margin: 0 }}>No donations yet. Be the first!</p>
              ) : (
                <>
                  {completedTx.slice(0, 3).map(t => (
                    <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: "50%", background: getHashColor(t.display_name),
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, fontSize: 11, color: "#fff", flexShrink: 0
                      }}>
                        {getInitials(t.display_name)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {t.display_name || "Anonymous"}
                        </div>
                        <div style={{ fontSize: 12, color: "#888" }}>{fmt(parseFloat(t.amount || 0))}</div>
                      </div>
                    </div>
                  ))}

                  {/* See all donors button */}
                  <button
                    onClick={() => {
                      setShowAllDonors(true);
                      window.scrollTo({ top: 0, behavior: "instant" });
                    }}
                    style={{
                      width: "100%", background: "#F8F6F0", color: "#1A1A2E", border: "1px solid #EDE9E0",
                      padding: "10px 0", borderRadius: 10, fontSize: 13, fontWeight: 700,
                      cursor: "pointer", marginTop: 4, transition: "all 0.2s ease",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#EDE9E0"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#F8F6F0"; }}
                  >
                    <Users size={14} /> See all {completedTx.length} donors
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}