import { useMemo, useState } from "react";
import CampaignCard from "../components/CampaignCard";
import { Input } from "../components/ui/input";
import { campaigns } from "../data/mockData";

const categories = [
  "All",
  "Medical",
  "Education",
  "Disaster Relief",
  "Animal Welfare",
  "Community",
  "Other",
];

export default function Explore() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");

  const filteredCampaigns = useMemo(() => {
    let result = [...campaigns];

    if (activeCategory !== "All") {
      result = result.filter((campaign) => campaign.category === activeCategory);
    }

    const query = search.trim().toLowerCase();
    if (query) {
      result = result.filter((campaign) =>
        [campaign.title, campaign.organizer, campaign.location, campaign.category]
          .join(" ")
          .toLowerCase()
          .includes(query),
      );
    }

    if (sortBy === "Newest") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "Most Funded") {
      result.sort((a, b) => b.raisedAmount / b.targetAmount - a.raisedAmount / a.targetAmount);
    } else if (sortBy === "Ending Soon") {
      result.sort((a, b) => a.daysLeft - b.daysLeft);
    }

    return result;
  }, [activeCategory, search, sortBy]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Explore Campaigns</h1>
      <p className="mt-1 text-sm text-slate-600">Browse and donate without login.</p>

      <div className="mt-5">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search campaigns by title, category, organizer or location"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              activeCategory === category
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {category}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <label htmlFor="sortBy" className="text-sm font-medium text-slate-600">
            Sort by
          </label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option>Newest</option>
            <option>Most Funded</option>
            <option>Ending Soon</option>
          </select>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredCampaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <p className="mt-8 text-center text-sm text-slate-500">
          No campaigns found. Try changing your search or filters.
        </p>
      )}
    </div>
  );
}
