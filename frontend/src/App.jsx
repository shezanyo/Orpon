import { useState, useEffect } from "react";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import CampaignDetail from "./pages/CampaignDetail";
import CreateCampaign from "./pages/CreateCampaign";
import LoginModal from "./pages/Login";
import { CAMPAIGNS, CAMPAIGN_COLORS, CAMPAIGN_EMOJIS } from "./data/mockData";
import { getCampaigns } from "./utils/api";
import { slugify } from "./utils/format";

const normalizeCampaign = (campaign) => {
  const title = campaign.title || "Untitled campaign";
  const story = campaign.story || campaign.description || "";
  const category =
    campaign.category ||
    (story.toLowerCase().includes("school") || story.toLowerCase().includes("education")
      ? "Education"
      : story.toLowerCase().includes("heart") || story.toLowerCase().includes("medical") || story.toLowerCase().includes("hospital")
        ? "Medical"
        : story.toLowerCase().includes("flood") || story.toLowerCase().includes("relief") || story.toLowerCase().includes("disaster")
          ? "Disaster Relief"
          : story.toLowerCase().includes("water")
            ? "Community"
            : "Community");

  return {
    id: String(campaign.id ?? Date.now()),
    slug: campaign.slug || `${slugify(title)}-${String(campaign.id || Date.now()).slice(0, 8)}`,
    title,
    organizer: campaign.organizer || "Community Organizer",
    orgVerified: Boolean(campaign.orgVerified ?? false),
    category,
    description: campaign.description || story,
    story,
    raised: Number(campaign.raised ?? campaign.current_amount ?? campaign.collected_amount ?? 0),
    goal: Number(campaign.goal ?? campaign.target_amount ?? 0),
    donors: Number(campaign.donors ?? campaign.donation_count ?? 0),
    daysLeft: Number(campaign.daysLeft ?? campaign.days_left ?? 30),
    color: campaign.color || CAMPAIGN_COLORS[category] || "#1B4332",
    emoji: campaign.emoji || CAMPAIGN_EMOJIS[category] || "🤲",
  };
};

export default function App() {
  const [page, setPage] = useState("home");
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginTab, setLoginTab] = useState("login");
  const [campaigns, setCampaigns] = useState(CAMPAIGNS);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(link);

    const loadCampaigns = async () => {
      try {
        const response = await getCampaigns();
        if (response?.success && Array.isArray(response.campaigns)) {
          setCampaigns(response.campaigns.map(normalizeCampaign));
        }
      } catch (error) {
        console.error("Unable to load campaigns from backend", error);
      }
    };

    loadCampaigns();

    return () => document.head.removeChild(link);
  }, []);

  const nav = (p) => {
    setPage(p);
    if (p !== "detail") setActiveCampaign(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openCampaign = (c) => {
    setActiveCampaign(c);
    setPage("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#F8F6F0", minHeight: "100vh", color: "#1A1A2E" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button { cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; }
        input, textarea { font-family: 'Plus Jakarta Sans', sans-serif; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #F8F6F0; }
        ::-webkit-scrollbar-thumb { background: #2D6A4F; border-radius: 99px; }
      `}</style>

      <Navbar
        page={page}
        nav={nav}
        isLoggedIn={isLoggedIn}
        setShowLogin={setShowLogin}
        setIsLoggedIn={setIsLoggedIn}
      />

      {page === "home" && <Home nav={nav} campaigns={campaigns} openCampaign={openCampaign} setShowLogin={setShowLogin} isLoggedIn={isLoggedIn} />}
      {page === "campaigns" && <Explore campaigns={campaigns} openCampaign={openCampaign} />}
      {page === "detail" && activeCampaign && <CampaignDetail c={activeCampaign} nav={nav} />}
      {page === "create" && <CreateCampaign nav={nav} isLoggedIn={isLoggedIn} setShowLogin={setShowLogin} setCampaigns={setCampaigns} />}

      {showLogin && <LoginModal loginTab={loginTab} setLoginTab={setLoginTab} setShowLogin={setShowLogin} setIsLoggedIn={setIsLoggedIn} />}

      <Footer />
    </div>
  );
}