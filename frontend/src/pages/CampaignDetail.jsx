import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProgressBar from "../components/ui/ProgressBar";
import QRCodeSVG from "../components/ui/QRCodeSVG";
import { fmt, pct } from "../utils/format";
import { getTransactions } from "../utils/api";
import { Loader2 } from "lucide-react";

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

  const shareUrl = `https://orpon.com.bd/campaign/${c.slug}`;
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
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 5% 80px" }}>
      <button onClick={() => nav("campaigns")} style={{ background: "none", border: "none", color: "#888", fontSize: 14, cursor: "pointer", marginBottom: 24, padding: 0 }}>
        ← Back to campaigns
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 40, alignItems: "start" }}>
        {/* LEFT */}
        <div style={{ animation: "fadeUp 0.5s ease both" }}>
          <div style={{ background: `linear-gradient(135deg, ${c.color}22, ${c.color}55)`, borderRadius: 24, height: 220, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, marginBottom: 28, border: `1px solid ${c.color}33` }}>
            {c.emoji}
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <span style={{ background: c.color, color: "#fff", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 99 }}>{c.category}</span>
            {c.orgVerified && <span style={{ background: "#ECFDF5", color: "#065F46", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 99, border: "1px solid #6EE7B7" }}>✓ Verified Organizer</span>}
          </div>

          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 38, fontWeight: 700, lineHeight: 1.2, color: "#1A1A2E", marginBottom: 12 }}>{c.title}</h1>
          <p style={{ color: "#888", fontSize: 14, marginBottom: 28 }}>Organized by <strong style={{ color: "#1A1A2E" }}>{c.organizer}</strong></p>

          {/* Progress */}
          <div style={{ background: "#fff", borderRadius: 18, padding: "24px", border: "1px solid #EDE9E0", marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: c.color }}>{fmt(c.raised)}</span>
              <span style={{ color: "#888", fontSize: 14, alignSelf: "flex-end" }}>of {fmt(c.goal)} goal</span>
            </div>
            <ProgressBar value={p} color={c.color} />
            <div style={{ display: "flex", gap: 24, marginTop: 14, fontSize: 14, color: "#555" }}>
              <span><strong style={{ color: "#1A1A2E", fontSize: 18 }}>{p}%</strong> funded</span>
              <span><strong style={{ color: "#1A1A2E", fontSize: 18 }}>{c.donors}</strong> donors</span>
              <span><strong style={{ color: "#1A1A2E", fontSize: 18 }}>{c.daysLeft}</strong> days left</span>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "#EDE9E0", margin: "20px 0" }} />

            {/* Recent Transactions Section */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: "#1A1A2E", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                📊 Recent Transactions
              </h4>
              {loadingTx ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "16px 0", color: "#888", gap: 8 }}>
                  <Loader2 className="animate-spin" style={{ width: 16, height: 16, color: c.color }} />
                  <span style={{ fontSize: 13 }}>Loading recent transactions...</span>
                </div>
              ) : errorTx ? (
                <div style={{ textAlign: "center", padding: "16px 0", color: "#EF4444", fontSize: 13 }}>
                  {errorTx}
                </div>
              ) : transactions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "16px 0", color: "#888", fontSize: 13 }}>
                  No recent donations. Be the first to support!
                </div>
              ) : (
                <div style={{ overflowX: "auto", maxHeight: 220, overflowY: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #EDE9E0", color: "#888" }}>
                        <th style={{ padding: "8px 4px", fontWeight: 600 }}>Donor</th>
                        <th style={{ padding: "8px 4px", fontWeight: 600 }}>Amount</th>
                        <th style={{ padding: "8px 4px", fontWeight: 600 }}>Method</th>
                        <th style={{ padding: "8px 4px", fontWeight: 600 }}>Status</th>
                        <th style={{ padding: "8px 4px", fontWeight: 600 }}>Date/Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(t => (
                        <tr key={t.id} style={{ borderBottom: "1px solid #F5F3ED", color: "#444" }}>
                          <td style={{ padding: "8px 4px", fontWeight: 500, color: "#1A1A2E" }}>
                            {t.display_name || "Anonymous"}
                          </td>
                          <td style={{ padding: "8px 4px", fontWeight: 600, color: c.color }}>
                            {fmt(parseFloat(t.amount || 0))}
                          </td>
                          <td style={{ padding: "8px 4px" }}>
                            <span style={{
                              background: t.payment_method === "bKash" ? "#E2136E15" : t.payment_method === "Nagad" ? "#F5822015" : t.payment_method === "Card" ? "#1E3A8A15" : "#F8F6F0",
                              color: t.payment_method === "bKash" ? "#E2136E" : t.payment_method === "Nagad" ? "#F58220" : t.payment_method === "Card" ? "#1E3A8A" : "#555",
                              padding: "2px 6px",
                              borderRadius: 6,
                              fontSize: 10,
                              fontWeight: 700,
                              whiteSpace: "nowrap"
                            }}>
                              {t.payment_method || "Direct"}
                            </span>
                          </td>
                          <td style={{ padding: "8px 4px" }}>
                            <span style={{
                              background: t.status === "Completed" ? "#ECFDF5" : t.status === "Pending" ? "#FFFBEB" : "#FEF2F2",
                              color: t.status === "Completed" ? "#065F46" : t.status === "Pending" ? "#B45309" : "#991B1B",
                              padding: "2px 6px",
                              borderRadius: 6,
                              fontSize: 10,
                              fontWeight: 700
                            }}>
                              {t.status || "Completed"}
                            </span>
                          </td>
                          <td style={{ padding: "8px 4px", color: "#666", whiteSpace: "nowrap" }}>
                            {formatDate(t.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Story */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, marginBottom: 14, color: "#1A1A2E" }}>The story</h2>
            {c.story.split("\n\n").map((para, i) => (
              <p key={i} style={{ color: "#444", fontSize: 15, lineHeight: 1.8, marginBottom: 14 }}>{para}</p>
            ))}
          </div>

          {/* Share */}
          <div style={{ background: "#F8F6F0", border: "1px solid #EDE9E0", borderRadius: 18, padding: "24px" }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "#1A1A2E" }}>📤 Share this campaign</h3>
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <input readOnly value={shareUrl} style={{ flex: 1, padding: "10px 14px", border: "1px solid #EDE9E0", borderRadius: 10, fontSize: 13, background: "#fff", color: "#555" }} />
              <button onClick={copyLink} style={{ background: copied ? "#2D6A4F" : "#1B4332", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", minWidth: 90 }}>
                {copied ? "✓ Copied!" : "Copy link"}
              </button>
            </div>
            <button onClick={() => setShowQR(!showQR)} style={{ background: "none", border: "1px solid #EDE9E0", padding: "8px 16px", borderRadius: 10, fontSize: 13, color: "#555", cursor: "pointer" }}>
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

        {/* RIGHT: Donate panel */}
        <div style={{ background: "#fff", border: "1px solid #EDE9E0", borderRadius: 24, padding: 28, position: "sticky", top: 80, animation: "fadeUp 0.5s 0.15s ease both", boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, marginBottom: 4, color: "#1A1A2E" }}>Make a donation</h3>
          <p style={{ color: "#888", fontSize: 13, marginBottom: 22 }}>No account needed · Secure & verified</p>

          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "#555" }}>Select amount (BDT)</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            {[100, 250, 500, 1000, 2500, 5000].map(a => (
              <button key={a} onClick={() => setAmount(String(a))} style={{ background: amount === String(a) ? "#1B4332" : "#F8F6F0", color: amount === String(a) ? "#fff" : "#1A1A2E", border: "1px solid " + (amount === String(a) ? "#1B4332" : "#EDE9E0"), padding: "12px 0", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                ৳{a.toLocaleString()}
              </button>
            ))}
          </div>
          <input value={amount} onChange={e => setAmount(e.target.value.replace(/\D/g, ""))} placeholder="Or enter custom amount" style={{ width: "100%", padding: "12px 14px", border: "1px solid #EDE9E0", borderRadius: 10, fontSize: 14, outline: "none", marginBottom: 20 }} />

          <button onClick={handleDonate} disabled={!amount} style={{ width: "100%", background: !amount ? "#EDE9E0" : "#1B4332", color: !amount ? "#aaa" : "#fff", border: "none", padding: "15px 0", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: !amount ? "not-allowed" : "pointer" }}>
            {amount ? `Proceed to Donate ${fmt(parseInt(amount))} →` : "Select an amount"}
          </button>
          <p style={{ textAlign: "center", color: "#aaa", fontSize: 11, marginTop: 16 }}>🔒 Secured by Orpon · Every taka is tracked</p>
        </div>
      </div>
    </div>
  );
}