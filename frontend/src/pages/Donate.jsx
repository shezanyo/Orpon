import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { 
  initiateBkashPayment, 
  initiateCardPayment, 
  initiateNagadPayment,
  initiateDirectDonation,
  getCampaigns
} from "../utils/api";
import { 
  CreditCard, 
  Heart, 
  ShieldCheck, 
  User, 
  EyeOff, 
  AlertCircle, 
  Loader2 
} from "lucide-react";

export default function Donate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Pre-fill states from query parameters if available
  const paramAmount = searchParams.get("amount") || "";
  const paramName = searchParams.get("name") || "";
  const paramPrivacy = searchParams.get("privacy") || (searchParams.get("anon") === "true" ? "anonymous" : "public");
  const paramMethod = searchParams.get("method") || "bKash";

  const [campaign, setCampaign] = useState(null);
  const [amount, setAmount] = useState(paramAmount);
  const [name, setName] = useState(paramName);
  const [privacyType, setPrivacyType] = useState(paramPrivacy); // public, anonymous, pseudonym
  const [paymentMethod, setPaymentMethod] = useState(paramMethod); // bKash, Nagad, Card
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch campaign details to show info on the checkout page
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const data = await getCampaigns();
        if (data?.success && Array.isArray(data.campaigns)) {
          const match = data.campaigns.find(c => String(c.id) === String(id));
          if (match) {
            setCampaign(match);
          }
        }
      } catch (err) {
        console.error("Error fetching campaigns:", err);
      }
    };
    fetchCampaign();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please specify a valid donation amount.");
      return;
    }

    setLoading(true);
    setError("");

    const payload = {
      amount: parseFloat(amount),
      campaign_id: id,
      donor_name: name || null,
      privacy_type: privacyType,
    };

    try {
      let response;
      if (paymentMethod === "bKash") {
        response = await initiateBkashPayment(payload);
      } else if (paymentMethod === "Nagad") {
        response = await initiateNagadPayment(payload);
      } else if (paymentMethod === "Card") {
        response = await initiateCardPayment(payload);
      } else if (paymentMethod === "Direct") {
        response = await initiateDirectDonation(payload);
      }

      if (paymentMethod === "Direct") {
        if (response?.success && response.donation_url) {
          const donationId = response.donation_url.split("/").pop();
          navigate(`/payment/success?donationId=${donationId}&amount=${amount}`);
        } else {
          setError(response?.message || "Failed to process direct donation. Please try again.");
          setLoading(false);
        }
      } else {
        if (response?.success && response.redirectUrl) {
          // Redirect to sandbox gateway page
          window.location.href = response.redirectUrl;
        } else {
          setError(response?.message || "Failed to initialize payment session. Please try again.");
          setLoading(false);
        }
      }
    } catch (err) {
      console.error("Payment initiation failure:", err);
      setError(err.message || "An unexpected error occurred. Please verify your connection.");
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "60px auto", padding: "0 24px", animation: "fadeUp 0.5s ease both" }}>
      <button 
        onClick={() => window.history.back()} 
        style={{ background: "none", border: "none", color: "#888", fontSize: 14, cursor: "pointer", marginBottom: 20, padding: 0 }}
      >
        ← Back to campaign
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* LEFT: Info & Summary */}
        <div style={{ background: "#1B4332", color: "#fff", borderRadius: 24, padding: 32, border: "1px solid #2D6A4F" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: 24 }}>🤲</span>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", background: "#2D6A4F", padding: "4px 10px", borderRadius: 99 }}>
              You are supporting
            </span>
          </div>

          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 28, fontWeight: 700, lineHeight: 1.2, marginBottom: 12 }}>
            {campaign ? campaign.title : "Supporting a Cause"}
          </h2>
          <p style={{ color: "#D8F3DC", fontSize: 14, lineHeight: 1.6, marginBottom: 28, opacity: 0.9 }}>
            {campaign ? (campaign.story ? campaign.story.slice(0, 140) + "..." : campaign.description) : "Every contribution plays a critical role in supporting and lifting up communities in need."}
          </p>

          <div style={{ height: 1, background: "#2D6A4F", margin: "24px 0" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ opacity: 0.7 }}>Platform Fee</span>
              <span>৳0 (Free)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700 }}>
              <span>Total Contribution</span>
              <span>৳{parseFloat(amount || 0).toLocaleString()} BDT</span>
            </div>
          </div>

          <div style={{ background: "#2D6A4F", borderRadius: 16, padding: 18, marginTop: 32, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <ShieldCheck size={20} style={{ color: "#52B788", flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 12, color: "#D8F3DC", lineHeight: 1.5 }}>
              <strong>100% Secure & Verified.</strong> Your transaction is protected via industry-standard sandbox environments. Details are permanently stored on Orpon's secure transparent ledger.
            </div>
          </div>
        </div>

        {/* RIGHT: Payment Form */}
        <Card style={{ padding: 28 }}>
          <h1 className="text-xl font-bold text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 26, fontWeight: 700 }}>
            Configure Donation
          </h1>
          <p className="text-slate-500 text-sm mt-1 mb-6">Select your payment method and donation preferences below.</p>

          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 12, padding: "12px 16px", color: "#991B1B", display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 20 }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 13, lineHeight: 1.4 }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Amount Selection */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#4B5563", marginBottom: 8 }}>
                Select Contribution Amount (BDT)
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
                {[250, 500, 1000, 2500, 5000, 10000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => { setAmount(String(val)); setError(""); }}
                    style={{
                      background: amount === String(val) ? "#1B4332" : "#F8F6F0",
                      color: amount === String(val) ? "#fff" : "#1B4332",
                      border: amount === String(val) ? "1px solid #1B4332" : "1px solid #EDE9E0",
                      borderRadius: 10,
                      padding: "10px 0",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    ৳{val.toLocaleString()}
                  </button>
                ))}
              </div>
              <Input
                type="number"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(""); }}
                placeholder="Or enter custom amount in BDT"
                min="10"
                required
                className="w-full"
              />
            </div>

            {/* Donor Privacy Selection */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#4B5563", marginBottom: 8 }}>
                Donor Information
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={privacyType === "anonymous" ? "Anonymous" : "Enter your full name"}
                disabled={privacyType === "anonymous"}
                className="w-full mb-3"
              />
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { key: "public", label: "Publicly", icon: User },
                  { key: "anonymous", label: "Anonymously", icon: EyeOff },
                  { key: "pseudonym", label: "Pseudonym", icon: Heart }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setPrivacyType(item.key)}
                    style={{
                      flex: 1,
                      background: privacyType === item.key ? "#1B433211" : "#fff",
                      color: privacyType === item.key ? "#1B4332" : "#4B5563",
                      border: privacyType === item.key ? "1.5px solid #1B4332" : "1px solid #EDE9E0",
                      borderRadius: 10,
                      padding: "8px 0",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 6
                    }}
                  >
                    <item.icon size={14} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#4B5563", marginBottom: 10 }}>
                Select Payment Gateway
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                {/* bKash */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("bKash")}
                  style={{
                    flex: 1,
                    position: "relative",
                    background: paymentMethod === "bKash" ? "#E2136E11" : "#fff",
                    border: paymentMethod === "bKash" ? "2px solid #E2136E" : "1px solid #EDE9E0",
                    color: paymentMethod === "bKash" ? "#E2136E" : "#4B5563",
                    borderRadius: 12,
                    padding: "14px 0",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  bKash
                </button>

                {/* Nagad */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("Nagad")}
                  style={{
                    flex: 1,
                    position: "relative",
                    background: paymentMethod === "Nagad" ? "#F5822011" : "#fff",
                    border: paymentMethod === "Nagad" ? "2px solid #F58220" : "1px solid #EDE9E0",
                    color: paymentMethod === "Nagad" ? "#F58220" : "#4B5563",
                    borderRadius: 12,
                    padding: "14px 0",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  Nagad
                </button>

                {/* Card Payments */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("Card")}
                  style={{
                    flex: 1,
                    position: "relative",
                    background: paymentMethod === "Card" ? "#1E3A8A11" : "#fff",
                    border: paymentMethod === "Card" ? "2px solid #1E3A8A" : "1px solid #EDE9E0",
                    color: paymentMethod === "Card" ? "#1E3A8A" : "#4B5563",
                    borderRadius: 12,
                    padding: "14px 0",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <span style={{ fontSize: 10, position: "absolute", top: 2, left: "50%", transform: "translateX(-50%)", opacity: 0.6 }}>Cards</span>
                  <CreditCard size={16} style={{ marginTop: 6, marginBottom: 2 }} />
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full text-white"
              style={{
                background: loading ? "#728A7A" : "#1B4332",
                cursor: loading ? "not-allowed" : "pointer",
                height: 48,
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700
              }}
              disabled={loading}
            >
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Initiating Transaction...</span>
                </div>
              ) : (
                `Contribute ৳${parseFloat(amount || 0).toLocaleString()} via ${paymentMethod}`
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
