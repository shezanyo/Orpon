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
  Calendar, 
  ShieldCheck, 
  Users, 
  Copy, 
  Check, 
  ArrowLeft, 
  Award,
  DollarSign
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
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
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
    if (!amount || parseFloat(amount) <= 0) return;
    navigate(`/donate/${c.id}?amount=${amount}`);
  };

  return (
    <div className="gfm-container">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .gfm-container {
          max-width: 1080px;
          margin: 0 auto;
          padding: 30px 20px 80px;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: #2D3748;
          animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .back-btn {
          background: none;
          border: none;
          color: #718096;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 24px;
          padding: 0;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        .back-btn:hover {
          color: #1A1A2E;
          transform: translateX(-4px);
        }
        .campaign-header-section {
          margin-bottom: 28px;
        }
        .badges-row {
          display: flex;
          gap: 8px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }
        .category-pill {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          padding: 6px 14px;
          border-radius: 99px;
          color: #fff;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        }
        .verified-pill {
          font-size: 11px;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 99px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #ECFDF5;
          color: #065F46;
          border: 1px solid #A7F3D0;
        }
        .campaign-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 42px;
          font-weight: 700;
          line-height: 1.15;
          color: #1A1A2E;
          margin: 0;
        }
        .gfm-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 44px;
          align-items: start;
        }
        @media (min-width: 900px) {
          .gfm-grid {
            grid-template-columns: 7fr 4.5fr;
          }
        }
        .hero-media-box {
          width: 100%;
          border-radius: 20px;
          height: 380px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 96px;
          margin-bottom: 24px;
          box-shadow: 0 12px 30px rgba(0,0,0,0.05);
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(0,0,0,0.03);
          transition: transform 0.3s ease;
        }
        .hero-media-box:hover {
          transform: translateY(-2px);
        }
        .hero-glass-label {
          position: absolute;
          bottom: 16px;
          left: 16px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(8px);
          padding: 6px 12px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          color: #1A1A2E;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .organizer-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 0;
          border-top: 1px solid #EDE9E0;
          border-bottom: 1px solid #EDE9E0;
          margin-bottom: 28px;
        }
        .organizer-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 700;
          box-shadow: 0 4px 10px rgba(0,0,0,0.08);
          flex-shrink: 0;
        }
        .organizer-text {
          font-size: 15px;
          color: #4A5568;
          margin: 0;
          line-height: 1.45;
        }
        .organizer-text strong {
          color: #1A1A2E;
        }
        .story-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 16px 0;
          color: #1A1A2E;
        }
        .story-text {
          font-size: 16px;
          line-height: 1.8;
          color: #4A5568;
          margin-bottom: 16px;
        }
        .story-text:last-of-type {
          margin-bottom: 0;
        }
        .sidebar-box {
          background: #fff;
          border: 1px solid #EDE9E0;
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.05);
          box-sizing: border-box;
        }
        @media (min-width: 900px) {
          .sidebar-sticky {
            position: sticky;
            top: 96px;
          }
        }
        .raised-text {
          font-size: 32px;
          font-weight: 800;
          color: #1A1A2E;
          margin: 0 0 6px 0;
        }
        .goal-text {
          font-size: 14px;
          color: #718096;
          margin-bottom: 16px;
        }
        .stats-row {
          display: flex;
          gap: 20px;
          font-size: 14px;
          color: #4A5568;
          margin: 18px 0;
        }
        .stats-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .pills-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 12px;
        }
        .pill-btn {
          background: #F8F6F0;
          color: #1A1A2E;
          border: 1px solid #EDE9E0;
          padding: 12px 0;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .pill-btn:hover {
          background: #EDE9E0;
          border-color: #D3CCBE;
        }
        .pill-btn.active {
          background: #1B4332;
          color: #fff;
          border-color: #1B4332;
        }
        .custom-input-box {
          position: relative;
          margin-bottom: 18px;
        }
        .custom-input-prefix {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #718096;
          font-size: 15px;
          font-weight: 700;
        }
        .custom-input {
          width: 100%;
          padding: 12px 14px 12px 30px;
          border: 1px solid #EDE9E0;
          border-radius: 10px;
          font-size: 14px;
          outline: none;
          font-weight: 600;
          color: #1A1A2E;
          box-sizing: border-box;
          background: #fff;
          transition: all 0.2s ease;
        }
        .custom-input:focus {
          border-color: #2D6A4F;
          box-shadow: 0 0 0 3px rgba(45, 106, 79, 0.1);
        }
        .cta-donate-btn {
          width: 100%;
          color: #fff;
          border: none;
          padding: 15px 0;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 12px rgba(27, 67, 50, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .cta-donate-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          filter: brightness(1.08);
          box-shadow: 0 6px 18px rgba(27, 67, 50, 0.25);
        }
        .cta-donate-btn:disabled {
          background: #E2E8F0;
          color: #A0AEC0;
          cursor: not-allowed;
          box-shadow: none;
        }
        .cta-share-btn {
          width: 100%;
          background: #fff;
          border: 1.5px solid #1B4332;
          color: #1B4332;
          padding: 12px 0;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 10px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .cta-share-btn:hover {
          background: rgba(27, 67, 50, 0.05);
        }
        .trust-shield {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          margin-top: 20px;
          font-size: 11px;
          color: #718096;
          line-height: 1.5;
          background: #F8F6F0;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid #EDE9E0;
        }
        .donor-section-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 26px;
          font-weight: 700;
          margin: 36px 0 16px 0;
          color: #1A1A2E;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .donor-feed {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 380px;
          overflow-y: auto;
          padding-right: 6px;
        }
        /* Custom scrollbar for donor list */
        .donor-feed::-webkit-scrollbar {
          width: 6px;
        }
        .donor-feed::-webkit-scrollbar-track {
          background: #F8F6F0;
          border-radius: 10px;
        }
        .donor-feed::-webkit-scrollbar-thumb {
          background: #D3CCBE;
          border-radius: 10px;
        }
        .donor-feed::-webkit-scrollbar-thumb:hover {
          background: #B5AC99;
        }
        .donor-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          background: #fff;
          border: 1px solid #EDE9E0;
          border-radius: 14px;
          transition: all 0.2s ease;
        }
        .donor-item:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          border-color: #D3CCBE;
        }
        .donor-circle {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
          color: #fff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
          flex-shrink: 0;
        }
        .donor-info-col {
          flex: 1;
          min-width: 0;
        }
        .donor-name-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2px;
        }
        .donor-name-text {
          font-size: 14px;
          font-weight: 700;
          color: #1A1A2E;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .donor-amount {
          font-size: 14px;
          font-weight: 700;
        }
        .donor-meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #718096;
        }
        .donor-gateway-badge {
          padding: 2px 6px;
          border-radius: 6px;
          font-size: 9px;
          font-weight: 700;
        }
        .donor-status-badge {
          padding: 2px 6px;
          border-radius: 6px;
          font-size: 9px;
          font-weight: 700;
        }
        .share-section-box {
          background: #F8F6F0;
          border: 1px solid #EDE9E0;
          border-radius: 20px;
          padding: 24px;
          margin-top: 36px;
        }
        .share-label {
          font-size: 15px;
          font-weight: 700;
          margin-bottom: 12px;
          color: #1A1A2E;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .share-input-row {
          display: flex;
          gap: 10px;
          margin-bottom: 14px;
        }
        .share-input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid #EDE9E0;
          border-radius: 10px;
          font-size: 13px;
          background: #fff;
          color: #4A5568;
          outline: none;
        }
        .share-copy-btn {
          color: #fff;
          border: none;
          padding: 10px 18px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          min-width: 90px;
          transition: all 0.2s ease;
        }
        .share-qr-toggle-btn {
          background: #fff;
          border: 1px solid #EDE9E0;
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 13px;
          color: #4A5568;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .share-qr-toggle-btn:hover {
          border-color: #D3CCBE;
          background: #F8F6F0;
        }
        .qr-box-wrapper {
          margin-top: 16px;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          background: #fff;
          padding: 16px;
          border-radius: 14px;
          border: 1px solid #EDE9E0;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
        }
      `}</style>

      {/* Back Button */}
      <button onClick={() => nav("campaigns")} className="back-btn">
        <ArrowLeft size={16} /> Back to campaigns
      </button>

      {/* Header section (Title/Verified) - Full Width */}
      <div className="campaign-header-section">
        <div className="badges-row">
          <span className="category-pill" style={{ background: c.color }}>
            {c.category}
          </span>
          {c.orgVerified && (
            <span className="verified-pill">
              ✓ Verified Fundraiser
            </span>
          )}
        </div>
        <h1 className="campaign-title">{c.title}</h1>
      </div>

      {/* 2-Column Grid */}
      <div className="gfm-grid">
        {/* LEFT COLUMN */}
        <div>
          {/* Hero cover image representation */}
          <div className="hero-media-box" style={{ background: `linear-gradient(135deg, ${c.color}22, ${c.color}4a)` }}>
            <span>{c.emoji}</span>
            <div className="hero-glass-label">🔒 Blockchain Secured Ledger</div>
          </div>

          {/* Organizer Card */}
          <div className="organizer-card">
            <div className="organizer-avatar" style={{ background: c.color }}>
              {c.organizer ? c.organizer[0].toUpperCase() : "O"}
            </div>
            <div className="organizer-text">
              Fundraiser organized by <strong>{c.organizer}</strong>
              <div style={{ fontSize: 13, color: "#718096", marginTop: 2 }}>
                Organized for individual relief & transparency verified
              </div>
            </div>
          </div>

          {/* Story / description */}
          <div>
            <h2 className="story-title">About this fundraiser</h2>
            {c.story.split("\n\n").map((para, i) => (
              <p key={i} className="story-text">{para}</p>
            ))}
          </div>

          {/* Recent Donations Ledger */}
          <div>
            <h2 className="donor-section-title">
              <Users size={20} style={{ color: c.color }} /> Recent Donations ({transactions.length})
            </h2>

            {loadingTx ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "30px 0", color: "#718096", gap: 8 }}>
                <Loader2 className="animate-spin" style={{ width: 20, height: 20, color: c.color }} />
                <span style={{ fontSize: 14 }}>Loading recent donations...</span>
              </div>
            ) : errorTx ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "#E53E3E", fontSize: 14 }}>
                {errorTx}
              </div>
            ) : transactions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 0", color: "#718096", fontSize: 14, background: "#F8F6F0", borderRadius: 16, border: "1px solid #EDE9E0" }}>
                No recent donations. Be the first to support this campaign!
              </div>
            ) : (
              <div className="donor-feed">
                {transactions.map(t => {
                  const initials = getInitials(t.display_name);
                  const circleBg = getHashColor(t.display_name);
                  return (
                    <div key={t.id} className="donor-item">
                      <div className="donor-circle" style={{ background: circleBg }}>
                        {initials}
                      </div>
                      <div className="donor-info-col">
                        <div className="donor-name-row">
                          <span className="donor-name-text">
                            {t.display_name || "Anonymous"}
                          </span>
                          <span className="donor-amount" style={{ color: c.color }}>
                            {fmt(parseFloat(t.amount || 0))}
                          </span>
                        </div>
                        <div className="donor-meta-row">
                          <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                            <span className="donor-gateway-badge" style={{
                              background: t.payment_method === "bKash" ? "#E2136E12" : t.payment_method === "Nagad" ? "#F5822012" : t.payment_method === "Card" ? "#1E3A8A12" : "#F8F6F0",
                              color: t.payment_method === "bKash" ? "#E2136E" : t.payment_method === "Nagad" ? "#F58220" : t.payment_method === "Card" ? "#1E3A8A" : "#718096"
                            }}>
                              {t.payment_method || "Direct"}
                            </span>
                            <span className="donor-status-badge" style={{
                              background: t.status === "Completed" ? "#ECFDF5" : t.status === "Pending" ? "#FFFBEB" : "#FFF5F5",
                              color: t.status === "Completed" ? "#047857" : t.status === "Pending" ? "#B45309" : "#C53030"
                            }}>
                              {t.status || "Completed"}
                            </span>
                          </span>
                          <span>{formatDate(t.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Share fundraiser box */}
          <div className="share-section-box">
            <h3 className="share-label">
              <Share2 size={18} style={{ color: c.color }} /> Share this fundraiser
            </h3>
            <div className="share-input-row">
              <input readOnly value={shareUrl} className="share-input" />
              <button 
                onClick={copyLink} 
                className="share-copy-btn"
                style={{ background: copied ? "#2D6A4F" : c.color }}
              >
                {copied ? "✓ Copied!" : "Copy link"}
              </button>
            </div>
            <button onClick={() => setShowQR(!showQR)} className="share-qr-toggle-btn">
              {showQR ? "Hide" : "Show"} QR Code
            </button>
            {showQR && (
              <div style={{ display: "block" }}>
                <div className="qr-box-wrapper">
                  <QRCodeSVG value={shareUrl} size={140} />
                  <p style={{ fontSize: 11, color: "#718096", margin: 0 }}>Scan to share & verify ledger</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (Sticky Donate Box) */}
        <div className="sidebar-sticky">
          <div className="sidebar-box">
            {/* Metrics */}
            <div className="raised-text">
              {fmt(c.raised)}
            </div>
            <div className="goal-text">
              raised of {fmt(c.goal)} goal
            </div>

            {/* Progress Bar */}
            <ProgressBar value={p} color={c.color} />

            {/* Extra Stats */}
            <div className="stats-row">
              <div className="stats-item">
                <Users size={16} style={{ color: "#718096" }} />
                <strong>{c.donors}</strong> donors
              </div>
              <div className="stats-item">
                <Calendar size={16} style={{ color: "#718096" }} />
                <strong>{c.daysLeft}</strong> days left
              </div>
            </div>

            {/* Quick donation selector */}
            <div style={{ height: 1, background: "#EDE9E0", margin: "16px 0" }} />
            
            <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 10px 0", color: "#4A5568" }}>
              Select donation amount:
            </p>
            
            <div className="pills-grid">
              {[250, 500, 1000, 2500, 5000].map(a => (
                <button 
                  key={a} 
                  onClick={() => setAmount(String(a))} 
                  className={`pill-btn ${amount === String(a) ? "active" : ""}`}
                  style={amount === String(a) ? { background: c.color, borderColor: c.color } : {}}
                >
                  ৳{a.toLocaleString()}
                </button>
              ))}
              <button 
                onClick={() => setAmount("")} 
                className={`pill-btn ${amount === "" ? "active" : ""}`}
                style={amount === "" ? { background: c.color, borderColor: c.color } : {}}
              >
                Clear
              </button>
            </div>

            {/* Custom Amount input */}
            <div className="custom-input-box">
              <span className="custom-input-prefix">৳</span>
              <input 
                value={amount} 
                onChange={e => setAmount(e.target.value.replace(/\D/g, ""))} 
                placeholder="Enter custom amount" 
                className="custom-input"
              />
            </div>

            {/* Donate Now Main CTA */}
            <button 
              onClick={handleDonate} 
              disabled={!amount} 
              className="cta-donate-btn"
              style={{ background: !amount ? "#E2E8F0" : c.color }}
            >
              <Heart size={18} fill={amount ? "#fff" : "none"} />
              {amount ? `Donate ${fmt(parseInt(amount))}` : "Select an amount"}
            </button>

            {/* Share Button Pill */}
            <button 
              onClick={copyLink} 
              className="cta-share-btn"
              style={{ color: c.color, borderColor: c.color }}
            >
              <Share2 size={16} />
              {copied ? "Link Copied!" : "Share fundraiser"}
            </button>

            {/* Trust Shield Guarantee */}
            <div className="trust-shield">
              <ShieldCheck size={20} style={{ color: "#48BB78", flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong>Orpon Guarantee.</strong> Every donation is secure and tracked cryptographically on the blockchain ledger. Zero platform fees.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}