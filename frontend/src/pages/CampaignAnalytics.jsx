import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getTransactions } from "../utils/api";
import { fmt, pct } from "../utils/format";
import { Loader2 } from "lucide-react";

export default function CampaignAnalytics({ campaigns, campaignsLoaded, nav }) {
  const { user } = useAuth();
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [errorTx, setErrorTx] = useState("");

  const myCampaigns = campaigns.filter(c => String(c.user_id) === String(user?.id));

  // Set default selected campaign when campaigns are loaded
  useEffect(() => {
    if (myCampaigns.length > 0 && !selectedCampaignId) {
      setSelectedCampaignId(myCampaigns[0].id);
    }
  }, [myCampaigns, selectedCampaignId]);

  // Fetch transactions and filter client-side
  useEffect(() => {
    if (!selectedCampaignId) return;
    let active = true;

    const fetchTxs = async () => {
      try {
        setLoadingTx(true);
        const data = await getTransactions();
        if (active) {
          if (data?.success && Array.isArray(data.transactions)) {
            // Filter by selected campaign and ensure they are completed
            const filtered = data.transactions.filter(
              t => String(t.campaign_id) === String(selectedCampaignId) && t.status === "Completed"
            );
            setTransactions(filtered);
          } else {
            setErrorTx("Failed to load donations.");
          }
        }
      } catch (err) {
        console.error("Error fetching transactions:", err);
        if (active) {
          setErrorTx("Failed to fetch donations.");
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
  }, [selectedCampaignId]);

  if (!user) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh", color: "#888" }}>
        Please log in to view analytics.
      </div>
    );
  }

  if (!campaignsLoaded) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh", color: "#888", gap: 10 }}>
        <Loader2 style={{ animation: "spin 1s linear infinite", color: "#2D6A4F" }} />
        <span>Loading analytics...</span>
      </div>
    );
  }

  if (myCampaigns.length === 0) {
    return (
      <div style={{ maxWidth: 1100, margin: "40px auto 80px", padding: "0 5%" }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 36, fontWeight: 700, color: "#1A1A2E", marginBottom: 32 }}>
          Campaign Analytics
        </h2>
        <div style={{
          background: "#fff", borderRadius: 24, border: "1px solid #EDE9E0",
          padding: "60px 40px", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.02)"
        }}>
          <span style={{ fontSize: 48, display: "block", marginBottom: 16 }}>📊</span>
          <h3 style={{ fontSize: 20, color: "#1A1A2E", fontWeight: 600, marginBottom: 8 }}>No Campaigns Found</h3>
          <p style={{ color: "#888", maxWidth: 450, margin: "0 auto 24px" }}>
            You need to have at least one campaign to view donation analytics. Start a campaign to get started.
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
      </div>
    );
  }

  const selectedCampaign = myCampaigns.find(c => String(c.id) === String(selectedCampaignId)) || myCampaigns[0];

  const totalCollected = transactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  const totalDonations = transactions.length;
  const averageDonation = totalDonations > 0 ? totalCollected / totalDonations : 0;
  const goal = selectedCampaign ? Number(selectedCampaign.goal || 0) : 0;
  const progressPct = goal > 0 ? Math.min(100, Math.round((totalCollected / goal) * 100)) : 0;

  const getMethodBadge = (method) => {
    let bg = "#F3F4F6";
    let color = "#374151";
    if (method === "bKash") { bg = "#FCE7F3"; color = "#9D174D"; }
    else if (method === "Nagad") { bg = "#FFEDD5"; color = "#C2410C"; }
    else if (method === "Card") { bg = "#DBEAFE"; color = "#1E40AF"; }
    else if (method === "Direct") { bg = "#D1FAE5"; color = "#065F46"; }

    return (
      <span style={{ background: bg, color: color, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 99 }}>
        {method}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  return (
    <div style={{ maxWidth: 1100, margin: "40px auto 80px", padding: "0 5%" }}>
      {/* Header & Selector */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 36, fontWeight: 700, color: "#1A1A2E" }}>
            Campaign Analytics
          </h2>
          <p style={{ color: "#888", marginTop: 4 }}>Detailed donation reports and insights</p>
        </div>

        {/* Dropdown Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#555" }}>Select Campaign:</span>
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            style={{
              padding: "10px 16px", borderRadius: 12, border: "1px solid #EDE9E0",
              background: "#fff", fontSize: 14, fontWeight: 500, color: "#1A1A2E",
              outline: "none", cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
            }}
          >
            {myCampaigns.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 32 }}>
        {[
          { label: "Total Collected", value: fmt(totalCollected), sub: `${progressPct}% of target goal`, color: "#1B4332" },
          { label: "Target Goal", value: fmt(goal), sub: "Campaign fundraising goal", color: "#555" },
          { label: "Total Donations", value: totalDonations, sub: "Completed donations ledger", color: "#555" },
          { label: "Average Donation", value: fmt(averageDonation), sub: "Per donation average amount", color: "#555" }
        ].map((card, idx) => (
          <div key={idx} style={{
            background: "#fff", borderRadius: 20, border: "1px solid #EDE9E0",
            padding: 24, boxShadow: "0 4px 15px rgba(0,0,0,0.01)"
          }}>
            <span style={{ fontSize: 13, color: "#888", fontWeight: 600, textTransform: "uppercase", display: "block", marginBottom: 8 }}>
              {card.label}
            </span>
            <span style={{ fontSize: 28, fontWeight: 700, color: card.color, display: "block", marginBottom: 6 }}>
              {card.value}
            </span>
            <span style={{ fontSize: 12, color: "#aaa" }}>
              {card.sub}
            </span>
          </div>
        ))}
      </div>

      {/* Donation Transactions Ledger */}
      <div style={{
        background: "#fff", borderRadius: 24, border: "1px solid #EDE9E0",
        padding: 32, boxShadow: "0 10px 30px rgba(0,0,0,0.02)"
      }}>
        <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 700, color: "#1A1A2E", marginBottom: 24 }}>
          Donation Ledger
        </h3>

        {loadingTx ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "60px 0", color: "#888", gap: 10 }}>
            <Loader2 style={{ animation: "spin 1s linear infinite", color: "#2D6A4F" }} />
            <span>Loading donation logs...</span>
          </div>
        ) : errorTx ? (
          <div style={{ color: "#E53E3E", textAlign: "center", padding: "40px 0" }}>{errorTx}</div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#888" }}>
            <span style={{ fontSize: 32, display: "block", marginBottom: 12 }}>💸</span>
            <p style={{ fontWeight: 500, color: "#1A1A2E", marginBottom: 4 }}>No Donations Received Yet</p>
            <p style={{ fontSize: 13 }}>Share your campaign to start receiving contributions!</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #EDE9E0" }}>
                  <th style={{ padding: "12px 16px", color: "#888", fontSize: 13, fontWeight: 600 }}>DONOR</th>
                  <th style={{ padding: "12px 16px", color: "#888", fontSize: 13, fontWeight: 600 }}>AMOUNT</th>
                  <th style={{ padding: "12px 16px", color: "#888", fontSize: 13, fontWeight: 600 }}>PAYMENT METHOD</th>
                  <th style={{ padding: "12px 16px", color: "#888", fontSize: 13, fontWeight: 600 }}>DATE & TIME</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: "1px solid #F5F3ED" }}>
                    <td style={{ padding: "16px", color: "#1A1A2E", fontWeight: 600, fontSize: 14 }}>
                      {tx.display_name}
                      {tx.privacy_type !== "public" && (
                        <span style={{ fontSize: 10, color: "#aaa", display: "block", fontWeight: 400, marginTop: 2 }}>
                          {tx.privacy_type}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "16px", color: "#1B4332", fontWeight: 700, fontSize: 14 }}>
                      {fmt(tx.amount)}
                    </td>
                    <td style={{ padding: "16px" }}>
                      {getMethodBadge(tx.payment_method)}
                    </td>
                    <td style={{ padding: "16px", color: "#555", fontSize: 13 }}>
                      {formatDate(tx.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
