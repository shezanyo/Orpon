import { useAuth } from "../context/AuthContext";
import { fmt, pct } from "../utils/format";
import ProgressBar from "../components/ui/ProgressBar";
import { Loader2, Trash2 } from "lucide-react";
import { deleteCampaign } from "../utils/api";

export default function MyCampaigns({ campaigns, campaignsLoaded, openCampaign, nav, setCampaigns }) {
  const { user } = useAuth();

  const handleDelete = async (e, c) => {
    e.stopPropagation(); // Prevent card click
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${c.title}"?\n\nThis will permanently delete the campaign and dissociate any completed donations (they will remain in the secure ledger but no longer show on this campaign). This action cannot be undone.`
    );
    
    if (!confirmDelete) return;
    
    try {
      const result = await deleteCampaign(c.id);
      if (result.success) {
        setCampaigns(prev => prev.filter(x => x.id !== c.id));
        alert("Campaign deleted successfully.");
      } else {
        alert(result.message || "Failed to delete campaign.");
      }
    } catch (err) {
      console.error("Delete campaign error:", err);
      alert(err.message || "An error occurred while deleting the campaign.");
    }
  };

  if (!user) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh", color: "#888" }}>
        Please log in to view your campaigns.
      </div>
    );
  }

  if (!campaignsLoaded) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh", color: "#888", gap: 10 }}>
        <Loader2 style={{ animation: "spin 1s linear infinite", color: "#2D6A4F" }} />
        <span>Loading your campaigns...</span>
      </div>
    );
  }

  const myCampaigns = campaigns.filter(c => String(c.user_id) === String(user.id));

  const getCampaignStatus = (c) => {
    if (c.raised >= c.goal) {
      return { label: "Goal Reached", color: "#065F46", bg: "#ECFDF5", border: "1px solid #6EE7B7" };
    }
    if (c.daysLeft <= 0) {
      return { label: "Ended", color: "#922B21", bg: "#FDF2F2", border: "1px solid #F87171" };
    }
    return { label: "Active", color: "#1B4332", bg: "#E8F5E9", border: "1px solid #A5D6A7" };
  };

  return (
    <div style={{ maxWidth: 1100, margin: "40px auto 80px", padding: "0 5%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 36, fontWeight: 700, color: "#1A1A2E" }}>
            My Campaigns
          </h2>
          <p style={{ color: "#888", marginTop: 4 }}>Manage and track your fundraising campaigns</p>
        </div>
        <button
          onClick={() => nav("create")}
          style={{
            background: "#1B4332", color: "#fff", border: "none",
            padding: "12px 24px", borderRadius: 12, fontWeight: 600,
            cursor: "pointer", transition: "all 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#2D6A4F"}
          onMouseLeave={e => e.currentTarget.style.background = "#1B4332"}
        >
          + Create New
        </button>
      </div>

      {myCampaigns.length === 0 ? (
        <div style={{
          background: "#fff", borderRadius: 24, border: "1px solid #EDE9E0",
          padding: "60px 40px", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.02)"
        }}>
          <span style={{ fontSize: 48, display: "block", marginBottom: 16 }}>📣</span>
          <h3 style={{ fontSize: 20, color: "#1A1A2E", fontWeight: 600, marginBottom: 8 }}>No Campaigns Yet</h3>
          <p style={{ color: "#888", maxWidth: 450, margin: "0 auto 24px" }}>
            You haven't created any campaigns yet. Start a campaign to make a difference and raise support for your cause.
          </p>
          <button
            onClick={() => nav("create")}
            style={{
              background: "#1B4332", color: "#fff", border: "none",
              padding: "12px 24px", borderRadius: 12, fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Start a Campaign
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 20 }}>
          {myCampaigns.map(c => {
            const status = getCampaignStatus(c);
            const p = pct(c.raised, c.goal);
            return (
              <div
                key={c.id}
                style={{
                  background: "#fff", borderRadius: 20, border: "1px solid #EDE9E0",
                  padding: 24,
                  alignItems: "center", gap: 24, boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
                  transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer"
                }}
                className="flex flex-col md:grid md:grid-cols-[auto_1fr_auto]"
                onClick={() => openCampaign(c)}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.05)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.02)";
                }}
              >
                {/* Emoji Thumbnail */}
                <div style={{
                  background: `linear-gradient(135deg, ${c.color}22, ${c.color}55)`,
                  width: 60, height: 60, borderRadius: 16,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 28, flexShrink: 0
                }}>
                  {c.emoji}
                </div>

                {/* Details */}
                <div style={{ minWidth: 0 }} className="w-full">
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, background: c.color, color: "#fff", padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>
                      {c.category}
                    </span>
                    <span style={{
                      fontSize: 11, color: status.color, background: status.bg,
                      border: status.border, padding: "2px 8px", borderRadius: 99, fontWeight: 600
                    }}>
                      {status.label}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, fontWeight: 700, color: "#1A1A2E", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.title}
                  </h3>
                  
                  {/* Progress Inline */}
                  <div style={{ display: "flex", alignItems: "center", gap: 16, maxWidth: 500 }} onClick={e => e.stopPropagation()}>
                    <div style={{ flex: 1 }}>
                      <ProgressBar value={p} color={c.color} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>
                      {p}%
                    </span>
                  </div>
                </div>

                {/* Right side stats & action */}
                <div style={{ display: "flex", alignItems: "center", gap: 20 }} className="w-full md:w-auto justify-between md:justify-end" onClick={e => e.stopPropagation()}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 150 }} className="text-left md:text-right">
                    <span style={{ fontSize: 18, fontWeight: 700, color: "#1A1A2E" }}>
                      {fmt(c.raised)}
                    </span>
                    <span style={{ fontSize: 12, color: "#888" }}>
                      of {fmt(c.goal)}
                    </span>
                    <span style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>
                      {c.donors} donors · {c.daysLeft} days left
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleDelete(e, c)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#922B21",
                      cursor: "pointer",
                      padding: "8px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#FDF2F2"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                    title="Delete Campaign"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
