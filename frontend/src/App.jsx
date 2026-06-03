import { useState, useEffect } from "react";
import { Routes, Route, useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import CampaignDetail from "./pages/CampaignDetail";
import CreateCampaign from "./pages/CreateCampaign";
import LoginModal from "./pages/Login";
import Donate from "./pages/Donate";
import NagadSandbox from "./pages/NagadSandbox";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFail from "./pages/PaymentFail";
import PaymentCancel from "./pages/PaymentCancel";
import { CAMPAIGNS, CAMPAIGN_COLORS, CAMPAIGN_EMOJIS } from "./data/mockData";
import { getCampaigns } from "./utils/api";
import { slugify } from "./utils/format";
import { useAuth } from "./context/AuthContext";

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

function CampaignDetailWrapper({ campaigns, campaignsLoaded, nav }) {
  const { id } = useParams();

  if (!campaignsLoaded) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh", color: "#888", gap: 10 }}>
        <Loader2 style={{ animation: "spin 1s linear infinite", color: "#2D6A4F" }} />
        <span>Loading campaign details...</span>
      </div>
    );
  }

  const campaign = campaigns.find(
    (x) => String(x.id) === String(id) || x.slug === id
  );

  if (!campaign) {
    return (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "50vh", gap: 16 }}>
        <h3 style={{ fontSize: 20, color: "#1A1A2E" }}>Campaign not found</h3>
        <button onClick={() => nav("home")} style={{ background: "#1B4332", border: "none", padding: "10px 20px", color: "#fff", borderRadius: 8, fontWeight: 600 }}>
          Back to Home
        </button>
      </div>
    );
  }

  return <CampaignDetail c={campaign} nav={nav} />;
}

export default function App() {
  const [page, setPage] = useState("home");
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginTab, setLoginTab] = useState("login");
  const [campaigns, setCampaigns] = useState(CAMPAIGNS);
  const [campaignsLoaded, setCampaignsLoaded] = useState(false);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

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
      } finally {
        setCampaignsLoaded(true);
      }
    };

    loadCampaigns();

    return () => document.head.removeChild(link);
  }, []);

  const nav = (p) => {
    setPage(p);
    if (p !== "detail") setActiveCampaign(null);
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openCampaign = (c) => {
    navigate(`/campaign/${c.slug}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#F8F6F0", minHeight: "100vh", color: "#1A1A2E" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
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
        setShowLogin={setShowLogin}
      />

      <Routes>
        <Route path="/" element={
          <>
            {page === "home" && <Home nav={nav} campaigns={campaigns} openCampaign={openCampaign} setShowLogin={setShowLogin} isLoggedIn={isLoggedIn} />}
            {page === "campaigns" && <Explore campaigns={campaigns} openCampaign={openCampaign} />}
            {page === "create" && <CreateCampaign nav={nav} isLoggedIn={isLoggedIn} setShowLogin={setShowLogin} setCampaigns={setCampaigns} />}
          </>
        } />
        <Route path="/donate/:id" element={<Donate />} />
        <Route path="/donate/nagad-sandbox" element={<NagadSandbox />} />
        <Route path="/campaign/:id" element={<CampaignDetailWrapper campaigns={campaigns} campaignsLoaded={campaignsLoaded} nav={nav} />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/fail" element={<PaymentFail />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
      </Routes>

      {showLogin && <LoginModal loginTab={loginTab} setLoginTab={setLoginTab} setShowLogin={setShowLogin} />}

      <Footer />
    </div>
  );
}