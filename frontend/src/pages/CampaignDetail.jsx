import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProgressBar from "../components/ui/ProgressBar";
import QRCodeSVG from "../components/ui/QRCodeSVG";
import { fmt, pct } from "../utils/format";
import { getTransactions, getComments, createComment, updateComment, deleteComment } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { 
  Loader2, 
  Heart, 
  Share2, 
  ShieldCheck, 
  Users, 
  ArrowLeft,
  X,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  AlertCircle
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

export default function CampaignDetail({ c, nav, setShowLogin }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showAllDonors, setShowAllDonors] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [errorTx, setErrorTx] = useState("");
  const [activeImageIdx, setActiveImageIdx] = useState(0);

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
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 32, fontWeight: 700, color: "#1A1A2E", margin: 0 }}>
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

  const renderDonatePanel = (isMobile = false) => {
    return (
      <div style={{
        background: "#fff", border: "1px solid #EDE9E0", borderRadius: 22, padding: 28,
        boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
        ...(isMobile ? { marginBottom: 12, marginTop: 12 } : {})
      }}>
        {/* Raised Amount */}
        <div style={{ marginBottom: 6 }}>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 32, fontWeight: 800, color: c.color }}>{fmt(c.raised)}</span>
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

        {/* Recent Donors (Only show on Desktop side card) */}
        {!isMobile && (
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
        )}
      </div>
    );
  };

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
      <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 40, fontWeight: 700, lineHeight: 1.15, color: "#1A1A2E", margin: "0 0 28px 0" }}>{c.title}</h1>

      {/* Responsive Grid / Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">

        {/* ===== LEFT COLUMN ===== */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Hero Image / Carousel */}
          {c.images && c.images.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ 
                position: "relative", 
                borderRadius: 20, 
                height: 380, 
                overflow: "hidden", 
                border: "1px solid #EDE9E0", 
                boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
                background: "#fdfdfd"
              }}>
                <img 
                  src={c.images[activeImageIdx]} 
                  alt={c.title} 
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "all 0.3s ease" }} 
                />
                
                <div style={{
                  position: "absolute", bottom: 14, left: 14,
                  background: "rgba(255,255,255,0.85)", backdropFilter: "blur(6px)",
                  padding: "5px 12px", borderRadius: 10, fontSize: 11, fontWeight: 600, color: "#1A1A2E",
                  zIndex: 2
                }}>
                  🔒 Blockchain-Verified Ledger
                </div>

                {c.images.length > 1 && (
                  <>
                    <button 
                      type="button"
                      onClick={() => setActiveImageIdx(prev => (prev === 0 ? c.images.length - 1 : prev - 1))}
                      style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.85)", border: "1px solid #EDE9E0", width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#1B4332", fontSize: 22, fontWeight: "bold", zIndex: 2, boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}
                    >
                      ‹
                    </button>
                    <button 
                      type="button"
                      onClick={() => setActiveImageIdx(prev => (prev === c.images.length - 1 ? 0 : prev + 1))}
                      style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.85)", border: "1px solid #EDE9E0", width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#1B4332", fontSize: 22, fontWeight: "bold", zIndex: 2, boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}
                    >
                      ›
                    </button>
                    <div style={{ position: "absolute", bottom: 14, right: 14, display: "flex", gap: 6, background: "rgba(0,0,0,0.45)", padding: "6px 12px", borderRadius: 99, zIndex: 2 }}>
                      {c.images.map((_, dotIdx) => (
                        <div 
                          key={dotIdx} 
                          onClick={() => setActiveImageIdx(dotIdx)}
                          style={{ width: 8, height: 8, borderRadius: "50%", background: activeImageIdx === dotIdx ? "#fff" : "rgba(255,255,255,0.5)", cursor: "pointer", transition: "background-color 0.2s" }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {c.images.length > 1 && (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {c.images.map((imgUrl, thumbIdx) => (
                    <div 
                      key={thumbIdx}
                      onClick={() => setActiveImageIdx(thumbIdx)}
                      style={{ 
                        width: 72, 
                        height: 54, 
                        borderRadius: 10, 
                        overflow: "hidden", 
                        cursor: "pointer", 
                        border: activeImageIdx === thumbIdx ? "2.5px solid #1B4332" : "1.5px solid #EDE9E0",
                        transition: "all 0.15s ease",
                        opacity: activeImageIdx === thumbIdx ? 1 : 0.75
                      }}
                    >
                      <img src={imgUrl} alt={`Thumbnail ${thumbIdx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{
              background: `linear-gradient(135deg, ${c.color}22, ${c.color}55)`,
              borderRadius: 20, height: 340, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 88, border: `1px solid ${c.color}33`,
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
          )}

          {/* Mobile-only Donate Panel (Visible under cover image on mobile) */}
          <div className="block lg:hidden">
            {renderDonatePanel(true)}
          </div>

          {/* Organizer */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 0", borderTop: "1px solid #EDE9E0", borderBottom: "1px solid #EDE9E0", margin: "12px 0" }}>
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
          <div style={{ marginBottom: 20 }}>
            {c.story.split("\n\n").map((para, i) => (
              <p key={i} style={{ color: "#444", fontSize: 15, lineHeight: 1.8, marginBottom: 14 }}>{para}</p>
            ))}
          </div>

          {/* Comments Section */}
          <CommentsSection campaignId={c.id} campaignOwnerId={c.user_id} campaignColor={c.color} setShowLogin={setShowLogin} />


          {/* Mobile-only Recent Donors (Visible under story on mobile) */}
          <div className="block lg:hidden" style={{
            background: "#fff", border: "1px solid #EDE9E0", borderRadius: 22, padding: 24,
            boxShadow: "0 4px 15px rgba(0,0,0,0.02)", marginBottom: 20
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 16 }}>
              Recent donors
            </p>

            {loadingTx ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#888" }}>
                <Loader2 className="animate-spin" style={{ width: 14, height: 14, color: c.color }} />
                <span style={{ fontSize: 13 }}>Loading...</span>
              </div>
            ) : completedTx.length === 0 ? (
              <p style={{ fontSize: 13, color: "#888", margin: 0 }}>No donations yet. Be the first!</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {completedTx.slice(0, 3).map(t => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
                >
                  <Users size={14} /> See all {completedTx.length} donors
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ===== RIGHT COLUMN: Desktop Sticky Donate Panel (Hidden on mobile) ===== */}
        <div className="hidden lg:block sticky" style={{ top: 80 }}>
          {renderDonatePanel(false)}
        </div>

      </div>
    </div>
  );
}

function CommentsSection({ campaignId, campaignOwnerId, campaignColor, setShowLogin }) {
  const { isLoggedIn, user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  
  // Edit state
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [editError, setEditError] = useState("");
  const [updatingCommentId, setUpdatingCommentId] = useState(null);

  // Delete confirm state
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchComments = async () => {
      try {
        setLoading(true);
        const data = await getComments(campaignId);
        if (active) {
          if (data?.success && Array.isArray(data.comments)) {
            setComments(data.comments);
          } else {
            setError("Failed to load comments.");
          }
        }
      } catch (err) {
        console.error("Error fetching comments:", err);
        if (active) {
          setError("Failed to load comments.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchComments();
    return () => {
      active = false;
    };
  }, [campaignId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!newCommentText.trim()) {
      setSubmitError("Comment cannot be empty.");
      return;
    }

    if (newCommentText.trim().length > 1000) {
      setSubmitError("Comment cannot exceed 1000 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createComment(campaignId, newCommentText);
      if (res.success && res.comment) {
        setComments(prev => [res.comment, ...prev]);
        setNewCommentText("");
      } else {
        setSubmitError("Failed to post comment.");
      }
    } catch (err) {
      setSubmitError(err.message || "Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (commentId) => {
    setEditError("");
    if (!editingText.trim()) {
      setEditError("Comment cannot be empty.");
      return;
    }

    if (editingText.trim().length > 1000) {
      setEditError("Comment cannot exceed 1000 characters.");
      return;
    }

    setUpdatingCommentId(commentId);
    try {
      const res = await updateComment(commentId, editingText);
      if (res.success && res.comment) {
        setComments(prev => prev.map(c => c.id === commentId ? res.comment : c));
        setEditingCommentId(null);
        setEditingText("");
      } else {
        setEditError("Failed to update comment.");
      }
    } catch (err) {
      setEditError(err.message || "Failed to update comment.");
    } finally {
      setUpdatingCommentId(null);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      const res = await deleteComment(commentId);
      if (res.success) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        setConfirmDeleteId(null);
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert(err.message || "Failed to delete comment.");
    }
  };

  return (
    <div style={{ marginTop: 32, borderTop: "1px solid #EDE9E0", paddingTop: 32, marginBottom: 32 }}>
      <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 28, fontWeight: 700, color: "#1A1A2E", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
        <MessageSquare size={22} style={{ color: campaignColor }} /> Comments ({comments.length})
      </h3>

      {/* Add Comment Input or Login CTA */}
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: 28 }}>
          <div style={{ position: "relative" }}>
            <textarea
              value={newCommentText}
              onChange={e => { setNewCommentText(e.target.value); setSubmitError(""); }}
              placeholder="Leave a message of support..."
              rows={3}
              style={{
                width: "100%",
                padding: "14px 16px",
                border: "1.5px solid #EDE9E0",
                borderRadius: 14,
                fontSize: 14,
                outline: "none",
                resize: "vertical",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                background: `${campaignColor}04`,
                transition: "all 0.25s ease",
                boxShadow: "0 2px 6px rgba(0,0,0,0.01)"
              }}
              onFocus={e => {
                e.target.style.borderColor = campaignColor;
                e.target.style.background = "#fff";
                e.target.style.boxShadow = `0 0 0 3px ${campaignColor}18`;
              }}
              onBlur={e => {
                e.target.style.borderColor = "#EDE9E0";
                e.target.style.background = `${campaignColor}04`;
                e.target.style.boxShadow = "none";
              }}
            />
            {submitError && (
              <div style={{ color: "#d93838", fontSize: 13, marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <AlertCircle size={14} /> {submitError}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
              <span style={{ fontSize: 12, color: newCommentText.length > 900 ? "#d93838" : "#888" }}>
                {newCommentText.length} / 1000 characters
              </span>
              <button
                type="submit"
                disabled={submitting || !newCommentText.trim()}
                style={{
                  background: !newCommentText.trim() || submitting ? `${campaignColor}18` : campaignColor,
                  color: !newCommentText.trim() || submitting ? `${campaignColor}50` : "#fff",
                  border: "none",
                  padding: "10px 22px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: !newCommentText.trim() || submitting ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: !newCommentText.trim() || submitting ? "none" : `0 4px 12px ${campaignColor}22`
                }}
                onMouseEnter={e => {
                  if (newCommentText.trim() && !submitting) {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = `0 6px 16px ${campaignColor}35`;
                  }
                }}
                onMouseLeave={e => {
                  if (newCommentText.trim() && !submitting) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = `0 4px 12px ${campaignColor}22`;
                  }
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={14} /> Posting...
                  </>
                ) : (
                  "Add Comment"
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div style={{
          background: "#F8F6F0",
          border: "1.5px dashed #D3CCBE",
          borderRadius: 18,
          padding: "24px 20px",
          textAlign: "center",
          marginBottom: 28,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12
        }}>
          <p style={{ fontSize: 14, color: "#555", margin: 0, fontWeight: 500 }}>
            Join the conversation. Only authenticated supporters can post comments.
          </p>
          <button
            type="button"
            onClick={() => setShowLogin(true)}
            style={{
              background: campaignColor,
              color: "#fff",
              border: "none",
              padding: "10px 22px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              transition: "transform 0.15s ease",
              boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            Log in to post comments
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "40px 0", gap: 10, color: "#888" }}>
          <Loader2 className="animate-spin" style={{ color: campaignColor }} />
          <span>Loading comments...</span>
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "20px 0", color: "#d93838", fontSize: 14 }}>
          {error}
        </div>
      ) : comments.length === 0 ? (
        /* Empty state */
        <div style={{
          textAlign: "center",
          padding: "40px 20px",
          background: "#fff",
          borderRadius: 18,
          border: "1px solid #EDE9E0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.01)"
        }}>
          <p style={{ color: "#888", fontSize: 14, margin: 0 }}>No comments yet on this fundraiser. Be the first to share support!</p>
        </div>
      ) : (
        /* Comments list */
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {comments.map(comment => {
            const isCommentOwner = user && String(user.id) === String(comment.user_id);
            const isCampaignOwner = user && String(campaignOwnerId) === String(user.id);
            const isAdmin = user && (user.role === "admin" || user.role === "super_admin");
            const canDelete = isCommentOwner || isCampaignOwner || isAdmin;
            const canEdit = isCommentOwner;

            return (
              <div key={comment.id} style={{
                display: "flex",
                gap: 14,
                padding: "18px 20px",
                background: "#fff",
                border: "1px solid #EDE9E0",
                borderRadius: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.01)"
              }}>
                {/* Avatar */}
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: getHashColor(comment.user_name),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 13,
                  color: "#fff",
                  flexShrink: 0,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
                }}>
                  {getInitials(comment.user_name)}
                </div>

                {/* Content Area */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#1A1A2E" }}>
                        {comment.user_name}
                      </span>
                      {String(comment.user_id) === String(campaignOwnerId) && (
                        <span style={{
                          background: `${campaignColor}15`,
                          color: campaignColor,
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 6,
                          letterSpacing: 0.3,
                          textTransform: "uppercase"
                        }}>
                          Organizer
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 12, color: "#888" }}>
                      {formatDate(comment.created_at)}
                    </span>
                  </div>

                  {editingCommentId === comment.id ? (
                    /* Edit Mode */
                    <div style={{ marginTop: 8 }}>
                      <textarea
                        value={editingText}
                        onChange={e => { setEditingText(e.target.value); setEditError(""); }}
                        rows={2}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: `1px solid ${campaignColor}`,
                          borderRadius: 10,
                          fontSize: 14,
                          outline: "none",
                          fontFamily: "'Plus Jakarta Sans', sans-serif"
                        }}
                      />
                      {editError && (
                        <div style={{ color: "#d93838", fontSize: 12, marginTop: 4 }}>{editError}</div>
                      )}
                      <div style={{ display: "flex", gap: 8, marginTop: 8, justifyContent: "flex-end" }}>
                        <button
                          onClick={() => { setEditingCommentId(null); setEditingText(""); setEditError(""); }}
                          style={{
                            background: "#F8F6F0",
                            border: "1px solid #EDE9E0",
                            color: "#555",
                            padding: "6px 12px",
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdate(comment.id)}
                          disabled={updatingCommentId === comment.id || !editingText.trim()}
                          style={{
                            background: campaignColor,
                            color: "#fff",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: updatingCommentId === comment.id || !editingText.trim() ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 4
                          }}
                        >
                          {updatingCommentId === comment.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display Mode */
                    <>
                      <p style={{ fontSize: 14, color: "#444", lineHeight: 1.6, margin: 0, wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
                        {comment.comment_text}
                      </p>

                      {/* Comment Actions */}
                      {(canEdit || canDelete) && (
                        <div style={{ display: "flex", gap: 12, marginTop: 10, justifyContent: "flex-end" }}>
                          {canEdit && (
                            <button
                              onClick={() => { setEditingCommentId(comment.id); setEditingText(comment.comment_text); setConfirmDeleteId(null); }}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#888",
                                fontSize: 12,
                                fontWeight: 500,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                padding: 0
                              }}
                              onMouseEnter={e => e.currentTarget.style.color = campaignColor}
                              onMouseLeave={e => e.currentTarget.style.color = "#888"}
                            >
                              <Edit2 size={12} /> Edit
                            </button>
                          )}

                          {canDelete && (
                            confirmDeleteId === comment.id ? (
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 11, color: "#d93838", fontWeight: 600 }}>Sure?</span>
                                <button
                                  onClick={() => handleDelete(comment.id)}
                                  style={{
                                    background: "#d93838",
                                    color: "#fff",
                                    border: "none",
                                    padding: "2px 8px",
                                    borderRadius: 4,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    cursor: "pointer"
                                  }}
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  style={{
                                    background: "#F8F6F0",
                                    color: "#555",
                                    border: "1px solid #EDE9E0",
                                    padding: "2px 8px",
                                    borderRadius: 4,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    cursor: "pointer"
                                  }}
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => { setConfirmDeleteId(comment.id); setEditingCommentId(null); }}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#888",
                                  fontSize: 12,
                                  fontWeight: 500,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                  padding: 0
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = "#d93838"}
                                onMouseLeave={e => e.currentTarget.style.color = "#888"}
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}