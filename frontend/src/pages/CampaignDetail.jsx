import { useState } from "react";
import ProgressBar from "../components/ui/ProgressBar";
import QRCodeSVG from "../components/ui/QRCodeSVG";
import { fmt, pct } from "../utils/format";

export default function CampaignDetail({ c, nav }) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [method, setMethod] = useState("bKash");
  const [anon, setAnon] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const shareUrl = `https://orpon.com.bd/campaign/${c.slug}`;
  const p = pct(c.raised, c.goal);

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDonate = () => {
    if (step === 3) { setStep(4); return; }
    setStep(s => s + 1);
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
          {step === 4 ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, marginBottom: 10, color: "#1B4332" }}>Donation received!</h3>
              <p style={{ color: "#555", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                Thank you{!anon && name ? `, ${name}` : ""}! Your <strong style={{ color: "#1B4332" }}>৳{parseInt(amount || 0).toLocaleString()}</strong> has been received.
              </p>
              <div style={{ background: "#ECFDF5", border: "1px solid #6EE7B7", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#065F46", marginBottom: 20 }}>
                📋 Transaction ID: <strong>ORN-{Date.now().toString(36).toUpperCase()}</strong>
              </div>
              <button onClick={() => { setStep(1); setAmount(""); setName(""); }} style={{ background: "#1B4332", color: "#fff", border: "none", padding: "12px 24px", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%" }}>
                Donate again
              </button>
            </div>
          ) : (
            <>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, marginBottom: 4, color: "#1A1A2E" }}>Make a donation</h3>
              <p style={{ color: "#888", fontSize: 13, marginBottom: 22 }}>No account needed · Secure & verified</p>

              <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
                {["Amount", "Details", "Confirm"].map((label, i) => (
                  <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: step > i + 1 ? "#1B4332" : step === i + 1 ? "#D4A017" : "#EDE9E0", transition: "background 0.3s" }} />
                ))}
              </div>

              {(step === 1 || step === 2) && (
                <>
                  <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "#555" }}>Select amount (BDT)</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                    {[100, 250, 500, 1000, 2500, 5000].map(a => (
                      <button key={a} onClick={() => { setAmount(String(a)); setStep(2); }} style={{ background: amount === String(a) ? "#1B4332" : "#F8F6F0", color: amount === String(a) ? "#fff" : "#1A1A2E", border: "1px solid " + (amount === String(a) ? "#1B4332" : "#EDE9E0"), padding: "12px 0", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                        ৳{a.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <input value={amount} onChange={e => { setAmount(e.target.value.replace(/\D/g, "")); setStep(2); }} placeholder="Or enter custom amount" style={{ width: "100%", padding: "12px 14px", border: "1px solid #EDE9E0", borderRadius: 10, fontSize: 14, outline: "none", marginBottom: 16 }} />
                </>
              )}

              {step === 3 && (
                <>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>Your name (optional)</label>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder={anon ? "Anonymous" : "e.g. Rahim Uddin"} disabled={anon} style={{ width: "100%", padding: "12px 14px", border: "1px solid #EDE9E0", borderRadius: 10, fontSize: 14, outline: "none", background: anon ? "#F8F6F0" : "#fff" }} />
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, cursor: "pointer", fontSize: 14, color: "#555" }}>
                    <input type="checkbox" checked={anon} onChange={() => setAnon(!anon)} />
                    Donate anonymously
                  </label>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>Payment method</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {["bKash", "Nagad", "Card"].map(m => (
                        <button key={m} onClick={() => setMethod(m)} style={{ flex: 1, padding: "10px 0", border: "1px solid " + (method === m ? "#1B4332" : "#EDE9E0"), borderRadius: 10, background: method === m ? "#1B433211" : "#fff", color: method === m ? "#1B4332" : "#555", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: "#F8F6F0", borderRadius: 12, padding: "12px 14px", marginBottom: 16, fontSize: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#555" }}><span>Donation</span><span>{fmt(parseInt(amount || 0))}</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#555", margin: "6px 0" }}><span>Platform fee</span><span>৳0 (free)</span></div>
                    <div style={{ height: 1, background: "#EDE9E0", margin: "8px 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "#1A1A2E" }}><span>Total</span><span>{fmt(parseInt(amount || 0))}</span></div>
                  </div>
                </>
              )}

              <button onClick={handleDonate} disabled={step >= 2 && !amount} style={{ width: "100%", background: step >= 2 && !amount ? "#EDE9E0" : "#1B4332", color: step >= 2 && !amount ? "#aaa" : "#fff", border: "none", padding: "15px 0", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: step >= 2 && !amount ? "not-allowed" : "pointer" }}>
                {step === 1 ? (amount ? `Donate ${fmt(parseInt(amount))} →` : "Select an amount") :
                 step === 2 ? (amount ? `Continue with ${fmt(parseInt(amount))} →` : "Enter an amount") :
                 `Confirm ${fmt(parseInt(amount || 0))} via ${method} →`}
              </button>
              {step > 1 && <button onClick={() => setStep(s => s - 1)} style={{ width: "100%", background: "none", border: "none", color: "#888", fontSize: 13, cursor: "pointer", marginTop: 8 }}>← Back</button>}
              <p style={{ textAlign: "center", color: "#aaa", fontSize: 11, marginTop: 16 }}>🔒 Secured by Orpon · Every taka is tracked</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}