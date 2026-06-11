import { useState } from "react";
import CampaignCard from "../components/CampaignCard";
import { CATEGORIES } from "../data/mockData";

export default function Explore({ campaigns, openCampaign }) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = campaigns.filter(c => {
    const matchCat = filter === "All" || c.category === filter;
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.organizer.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 5% 80px" }}>
      <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 48, fontWeight: 700, color: "#1A1A2E", marginBottom: 8, animation: "fadeUp 0.5s ease both" }}>
        All Campaigns
      </h1>
      <p style={{ color: "#888", marginBottom: 36, animation: "fadeUp 0.5s 0.1s ease both" }}>
        {campaigns.length} active campaigns · Anyone can donate, no login required
      </p>

      <div style={{ display: "flex", gap: 12, marginBottom: 40, flexWrap: "wrap", animation: "fadeUp 0.5s 0.15s ease both" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search campaigns..."
          style={{ padding: "12px 18px", borderRadius: 12, border: "1px solid #EDE9E0", fontSize: 14, background: "#fff", outline: "none", width: 260 }}
        />
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} style={{ background: filter === cat ? "#1B4332" : "#fff", color: filter === cat ? "#fff" : "#555", border: "1px solid " + (filter === cat ? "#1B4332" : "#EDE9E0"), padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}>
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#888" }}>No campaigns found. Try a different search.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24, alignItems: "stretch" }}>
          {filtered.map((c, i) => (
            <div key={c.id} style={{ animation: `fadeUp 0.5s ${i * 0.07}s ease both`, display: "flex" }}>
              <CampaignCard c={c} openCampaign={openCampaign} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}