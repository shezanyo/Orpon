import { useState } from "react";
import QRCodeSVG from "../components/ui/QRCodeSVG";
import { CATEGORIES } from "../data/mockData";
import { createCampaign } from "../utils/api";
import { fmt } from "../utils/format";

export default function CreateCampaign({ nav, isLoggedIn, setShowLogin, setCampaigns }) {
  const [formStep, setFormStep] = useState(1);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Medical");
  const [goal, setGoal] = useState("");
  const [story, setStory] = useState("");
  const [duration, setDuration] = useState("30");
  const [submitted, setSubmitted] = useState(false);
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isLoggedIn) {
    return (
      <div style={{ textAlign: "center", padding: "120px 5%", animation: "fadeUp 0.5s ease" }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🔒</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, marginBottom: 12, color: "#1A1A2E" }}>Login to start a campaign</h2>
        <p style={{ color: "#888", marginBottom: 32, fontSize: 16 }}>You need an account to create and manage campaigns.</p>
        <button onClick={() => setShowLogin(true)} style={{ background: "#1B4332", color: "#fff", border: "none", padding: "14px 36px", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
          Log in / Sign up
        </button>
      </div>
    );
  }

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await createCampaign({
        title,
        story,
        description: story,
        category,
        target_amount: Number(goal),
        days_left: Number(duration),
        organizer_name: "You",
        is_verified: false,
      });

      const newCampaign = response?.campaign || {
        id: String(Date.now()),
        slug: `campaign-${Date.now().toString(36)}`,
        title,
        organizer: "You",
        orgVerified: false,
        category,
        description: story,
        story,
        raised: 0,
        goal: Number(goal),
        donors: 0,
        daysLeft: Number(duration),
        color: "#1B4332",
        emoji: "🤲",
      };

      setCampaigns(prev => [newCampaign, ...prev]);
      setSlug(newCampaign.slug);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Unable to create campaign right now.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    const shareUrl = `https://orpon.com.bd/campaign/${slug}`;
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "80px 5%", textAlign: "center", animation: "fadeUp 0.5s ease" }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🚀</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 38, fontWeight: 700, marginBottom: 12, color: "#1B4332" }}>Campaign is live!</h2>
        <p style={{ color: "#555", fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
          Your campaign <strong>"{title}"</strong> is now live. Share your link to start receiving donations.
        </p>
        <div style={{ background: "#fff", border: "1px solid #EDE9E0", borderRadius: 20, padding: 28, marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: "#888", marginBottom: 10 }}>Your campaign link</p>
          <div style={{ background: "#F8F6F0", padding: "10px 14px", borderRadius: 10, fontSize: 13, color: "#555", wordBreak: "break-all", marginBottom: 14 }}>{shareUrl}</div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <QRCodeSVG value={shareUrl} size={150} />
          </div>
          <p style={{ fontSize: 12, color: "#aaa" }}>Share this QR code on posters, banners, or social media</p>
        </div>
        <button onClick={() => nav("campaigns")} style={{ background: "#1B4332", color: "#fff", border: "none", padding: "14px 32px", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
          View all campaigns →
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 5% 80px", animation: "fadeUp 0.5s ease" }}>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 44, fontWeight: 700, color: "#1A1A2E", marginBottom: 6 }}>Start a campaign</h1>
      <p style={{ color: "#888", marginBottom: 36, fontSize: 15 }}>Create your campaign in minutes. It's free.</p>

      <div style={{ display: "flex", gap: 6, marginBottom: 36 }}>
        {["Basics", "Story", "Goal"].map((label, i) => (
          <div key={i} style={{ flex: 1 }}>
            <div style={{ height: 4, borderRadius: 99, background: formStep > i + 1 ? "#1B4332" : formStep === i + 1 ? "#D4A017" : "#EDE9E0", marginBottom: 6 }} />
            <span style={{ fontSize: 12, color: formStep === i + 1 ? "#1B4332" : "#aaa", fontWeight: formStep === i + 1 ? 600 : 400 }}>{label}</span>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1px solid #EDE9E0", borderRadius: 24, padding: "36px 32px" }}>
        {formStep === 1 && (
          <>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 8 }}>Campaign title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Medical help for Rahim's family" style={{ width: "100%", padding: "13px 14px", border: "1px solid #EDE9E0", borderRadius: 12, fontSize: 15, outline: "none" }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 8 }}>Category *</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {CATEGORIES.filter(c => c !== "All").map(cat => (
                  <button key={cat} onClick={() => setCategory(cat)} style={{ padding: "12px 0", border: "1px solid " + (category === cat ? "#1B4332" : "#EDE9E0"), borderRadius: 10, background: category === cat ? "#1B433211" : "#fff", color: category === cat ? "#1B4332" : "#555", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {formStep === 2 && (
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 8 }}>Your story *</label>
            <p style={{ fontSize: 12, color: "#aaa", marginBottom: 12 }}>Explain why you're raising money. Be specific — it builds trust.</p>
            <textarea value={story} onChange={e => setStory(e.target.value)} placeholder="Describe the situation, who will benefit, and how the funds will be used..." rows={10} style={{ width: "100%", padding: "14px", border: "1px solid #EDE9E0", borderRadius: 12, fontSize: 14, outline: "none", resize: "vertical", lineHeight: 1.7, color: "#444" }} />
            <p style={{ fontSize: 12, color: "#aaa", marginTop: 8 }}>{story.length} characters</p>
          </div>
        )}

        {formStep === 3 && (
          <>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 8 }}>Fundraising goal (BDT) *</label>
              <input value={goal} onChange={e => setGoal(e.target.value.replace(/\D/g, ""))} placeholder="e.g. 500000" style={{ width: "100%", padding: "13px 14px", border: "1px solid #EDE9E0", borderRadius: 12, fontSize: 15, outline: "none" }} />
              {goal && <p style={{ fontSize: 13, color: "#1B4332", marginTop: 6 }}>Goal: {fmt(parseInt(goal))}</p>}
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 8 }}>Campaign duration</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["15", "30", "60", "90"].map(d => (
                  <button key={d} onClick={() => setDuration(d)} style={{ flex: 1, padding: "12px 0", border: "1px solid " + (duration === d ? "#1B4332" : "#EDE9E0"), borderRadius: 10, background: duration === d ? "#1B433211" : "#fff", color: duration === d ? "#1B4332" : "#555", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    {d} days
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {error && (
        <div style={{ marginTop: 16, padding: "12px 14px", background: "#fee", border: "1px solid #fcc", color: "#c33", borderRadius: 12, fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        {formStep > 1 && (
          <button onClick={() => setFormStep(s => s - 1)} style={{ flex: 1, background: "#fff", border: "1px solid #EDE9E0", padding: "14px 0", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", color: "#555" }}>
            ← Back
          </button>
        )}
        <button onClick={() => formStep < 3 ? setFormStep(s => s + 1) : handleSubmit()} disabled={loading || (formStep === 1 && !title)} style={{ flex: 2, background: loading || (formStep === 1 && !title) ? "#EDE9E0" : "#1B4332", color: loading || (formStep === 1 && !title) ? "#aaa" : "#fff", border: "none", padding: "14px 0", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: loading || (formStep === 1 && !title) ? "not-allowed" : "pointer" }}>
          {loading ? "⏳ Creating..." : formStep < 3 ? "Continue →" : "🚀 Launch Campaign"}
        </button>
      </div>
    </div>
  );
}