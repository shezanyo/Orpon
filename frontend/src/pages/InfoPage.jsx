import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  Mail, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  FileText, 
  HelpCircle, 
  Lock, 
  CheckCircle, 
  ChevronRight, 
  Loader2, 
  Send,
  Scale,
  Cookie
} from "lucide-react";

export default function InfoPage({ nav }) {
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab = tab || "help-center";

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  // Abuse Form State
  const [abuseForm, setAbuseForm] = useState({ campaignUrl: "", reason: "misleading", details: "", email: "" });
  const [abuseSubmitting, setAbuseSubmitting] = useState(false);
  const [abuseSuccess, setAbuseSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitting(true);
    setTimeout(() => {
      setContactSubmitting(false);
      setContactSuccess(true);
      setContactForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setContactSuccess(false), 5000);
    }, 1200);
  };

  const handleAbuseSubmit = (e) => {
    e.preventDefault();
    setAbuseSubmitting(true);
    setTimeout(() => {
      setAbuseSubmitting(false);
      setAbuseSuccess(true);
      setAbuseForm({ campaignUrl: "", reason: "misleading", details: "", email: "" });
      setTimeout(() => setAbuseSuccess(false), 5000);
    }, 1200);
  };

  const menuGroups = [
    {
      title: "Platform",
      items: [
        { label: "Verification Guide", slug: "verification", icon: ShieldCheck }
      ]
    },
    {
      title: "Support",
      items: [
        { label: "Help Center", slug: "help-center", icon: HelpCircle },
        { label: "Contact Us", slug: "contact-us", icon: Mail },
        { label: "Report Abuse", slug: "report-abuse", icon: AlertTriangle },
        { label: "FAQs", slug: "faqs", icon: HelpCircle }
      ]
    },
    {
      title: "Legal",
      items: [
        { label: "Privacy Policy", slug: "privacy-policy", icon: Lock },
        { label: "Terms of Service", slug: "terms-of-service", icon: Scale },
        { label: "Cookie Policy", slug: "cookie-policy", icon: Cookie }
      ]
    }
  ];

  const handleTabChange = (slug) => {
    navigate(`/info/${slug}`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "verification":
        return (
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, color: "#1B4332", marginBottom: 16 }}>
              Campaign & Identity Verification Framework
            </h2>
            <p style={{ fontSize: 15, color: "#555", lineHeight: 1.7, marginBottom: 24 }}>
              Trust is the foundation of Orpon. We enforce a robust, multi-tier vetting and verification system to ensure every single taka donated is traced, accounted for, and utilized for its designated cause.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ padding: 20, background: "#F8F6F0", borderRadius: 16, border: "1px solid #EDE9E0" }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: "#1B4332", display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ background: "#1B4332", color: "#fff", width: 24, height: 24, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>1</span>
                  Identity Vetting (Know Your Organizer)
                </h4>
                <p style={{ fontSize: 14, color: "#555", lineHeight: 1.6, margin: 0 }}>
                  Every campaign organizer must register with their official government-issued Smart NID card, verified active Bangladeshi mobile number, and address. This information is cryptographically pre-vetted against verified records to prevent identity theft and fraudulent campaigns.
                </p>
              </div>

              <div style={{ padding: 20, background: "#F8F6F0", borderRadius: 16, border: "1px solid #EDE9E0" }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: "#1B4332", display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ background: "#1B4332", color: "#fff", width: 24, height: 24, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>2</span>
                  Cause and Document Audit
                </h4>
                <p style={{ fontSize: 14, color: "#555", lineHeight: 1.6, margin: 0 }}>
                  For medical cases, educational sponsorships, or disaster relief drives, organizers must upload official documents (hospital receipts, tuition fees, local NGO authorization). Our dedicated audit team verifies these documents directly with issuing authorities before granting the <strong style={{ color: "#2D6A4F" }}>✓ Verified</strong> badge.
                </p>
              </div>

              <div style={{ padding: 20, background: "#F8F6F0", borderRadius: 16, border: "1px solid #EDE9E0" }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: "#1B4332", display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ background: "#1B4332", color: "#fff", width: 24, height: 24, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>3</span>
                  Cryptographic Hash Chain Ledger
                </h4>
                <p style={{ fontSize: 14, color: "#555", lineHeight: 1.6, margin: 0 }}>
                  Each completed payment is recorded as an immutable block linked back to the genesis donation block via SHA-256 cryptographic hashing. This transparent transaction ledger prevents post-facto modification or deletion of records, allowing the community to batch-verify platform integrity dynamically.
                </p>
              </div>
            </div>
          </div>
        );

      case "help-center":
        return (
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, color: "#1B4332", marginBottom: 16 }}>
              Help Center & User Guides
            </h2>
            <p style={{ fontSize: 15, color: "#555", lineHeight: 1.7, marginBottom: 24 }}>
              Find instructions and detailed user guides on how to interact with the Orpon crowdfunding ecosystem.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", md: "1fr 1fr", gap: 20 }}>
              <div style={{ background: "#fff", border: "1px solid #EDE9E0", padding: 24, borderRadius: 18 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A2E", marginBottom: 12 }}>For Donors</h3>
                <ul style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14, color: "#555", paddingLeft: 20 }}>
                  <li><strong>Finding Campaigns:</strong> Use the "Explore" page to filter by categories like Medical, Disaster Relief, or Education.</li>
                  <li><strong>Privacy Options:</strong> Choose to make donations with your Public name, complete Anonymity, or a system-generated Pseudonym (e.g., Donor-4819).</li>
                  <li><strong>Security:</strong> All payments are validated server-side. Track your transaction status on the public ledger.</li>
                </ul>
              </div>

              <div style={{ background: "#fff", border: "1px solid #EDE9E0", padding: 24, borderRadius: 18 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A2E", marginBottom: 12 }}>For Campaign Organizers</h3>
                <ul style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14, color: "#555", paddingLeft: 20 }}>
                  <li><strong>Starting a Campaign:</strong> Submit details, specify target amounts, verify identity, and detail a verified story of the target beneficiaries.</li>
                  <li><strong>Submitting Documents:</strong> Ensure high-resolution scans of NIDs, medical bills, or institutional verification.</li>
                  <li><strong>Transparency Updates:</strong> Post status updates and cryptographic verification blocks to update donors on resource allocation.</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case "contact-us":
        return (
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, color: "#1B4332", marginBottom: 16 }}>
              Contact Us
            </h2>
            <p style={{ fontSize: 15, color: "#555", lineHeight: 1.7, marginBottom: 24 }}>
              Have questions regarding verification, campaigns, or technical support? Reach out directly. Our response SLA is less than 24 hours.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8">
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <Mail size={18} style={{ color: "#1B4332", marginTop: 2 }} />
                  <div>
                    <strong style={{ fontSize: 13, color: "#1A1A2E" }}>Email Channels</strong>
                    <p style={{ fontSize: 13, color: "#555", margin: 0 }}>support@orpon.org</p>
                    <p style={{ fontSize: 13, color: "#555", margin: 0 }}>verification@orpon.org</p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <MapPin size={18} style={{ color: "#1B4332", marginTop: 2 }} />
                  <div>
                    <strong style={{ fontSize: 13, color: "#1A1A2E" }}>Headquarters</strong>
                    <p style={{ fontSize: 13, color: "#555", margin: 0 }}>House 42, Road 11, Gulshan-2,</p>
                    <p style={{ fontSize: 13, color: "#555", margin: 0 }}>Dhaka, Bangladesh</p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <Clock size={18} style={{ color: "#1B4332", marginTop: 2 }} />
                  <div>
                    <strong style={{ fontSize: 13, color: "#1A1A2E" }}>Operating Hours</strong>
                    <p style={{ fontSize: 13, color: "#555", margin: 0 }}>Sunday - Thursday</p>
                    <p style={{ fontSize: 13, color: "#555", margin: 0 }}>09:00 AM - 06:00 PM (GMT+6)</p>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div style={{ background: "#F8F6F0", padding: 24, borderRadius: 20, border: "1px solid #EDE9E0" }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1B4332", marginBottom: 16 }}>Send a Support Ticket</h3>
                {contactSuccess ? (
                  <div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", color: "#065F46", padding: 16, borderRadius: 12, fontSize: 14, textAlign: "center" }}>
                    ✓ Thank you! Your ticket has been logged. Our vetting desk will contact you within 24 hours.
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <input 
                        type="text" 
                        required 
                        value={contactForm.name}
                        onChange={e => setContactForm({...contactForm, name: e.target.value})}
                        placeholder="Full Name" 
                        style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #EDE9E0", fontSize: 13, outline: "none", background: "#fff" }} 
                      />
                      <input 
                        type="email" 
                        required 
                        value={contactForm.email}
                        onChange={e => setContactForm({...contactForm, email: e.target.value})}
                        placeholder="Email Address" 
                        style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #EDE9E0", fontSize: 13, outline: "none", background: "#fff" }} 
                      />
                    </div>
                    <input 
                      type="text" 
                      required 
                      value={contactForm.subject}
                      onChange={e => setContactForm({...contactForm, subject: e.target.value})}
                      placeholder="Subject" 
                      style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #EDE9E0", fontSize: 13, outline: "none", background: "#fff" }} 
                    />
                    <textarea 
                      required 
                      rows={4}
                      value={contactForm.message}
                      onChange={e => setContactForm({...contactForm, message: e.target.value})}
                      placeholder="Your Message..." 
                      style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #EDE9E0", fontSize: 13, outline: "none", background: "#fff", resize: "vertical" }} 
                    />
                    <button 
                      type="submit" 
                      disabled={contactSubmitting}
                      style={{ background: "#1B4332", color: "#fff", border: "none", padding: "12px 0", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                    >
                      {contactSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        );

      case "report-abuse":
        return (
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, color: "#d93838", marginBottom: 16 }}>
              Report Campaign Abuse or Fraud
            </h2>
            <p style={{ fontSize: 15, color: "#555", lineHeight: 1.7, marginBottom: 24 }}>
              Orpon is committed to a scam-free ecosystem. If you suspect that a fundraiser contains misleading stories, fraudulent documentation, or misallocations of donations, report it immediately. Reports are prioritized for immediate review.
            </p>

            <div style={{ background: "#fff5f5", border: "1px solid #fcc", padding: 24, borderRadius: 20 }}>
              {abuseSuccess ? (
                <div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", color: "#065F46", padding: 16, borderRadius: 12, fontSize: 14, textAlign: "center" }}>
                  ✓ Abuse report logged. Our fraud vetting specialists will investigate the campaign logs. Thank you for protecting the community.
                </div>
              ) : (
                <form onSubmit={handleAbuseSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "#555", display: "block", marginBottom: 4 }}>Suspect Campaign URL or Slug</label>
                      <input 
                        type="text" 
                        required 
                        value={abuseForm.campaignUrl}
                        onChange={e => setAbuseForm({...abuseForm, campaignUrl: e.target.value})}
                        placeholder="e.g. disaster-relief-dhaka" 
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #EDE9E0", fontSize: 13, outline: "none", background: "#fff" }} 
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "#555", display: "block", marginBottom: 4 }}>Reason for Report</label>
                      <select 
                        value={abuseForm.reason}
                        onChange={e => setAbuseForm({...abuseForm, reason: e.target.value})}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #EDE9E0", fontSize: 13, outline: "none", background: "#fff" }}
                      >
                        <option value="misleading">Misleading or false description</option>
                        <option value="fake-docs">Fake/Altered Vetting Documents</option>
                        <option value="impersonation">Impersonation or copyright abuse</option>
                        <option value="fee-diversion">Fund misallocation or diversion</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#555", display: "block", marginBottom: 4 }}>Detailed Explanation of Suspected Misuse</label>
                    <textarea 
                      required 
                      rows={5}
                      value={abuseForm.details}
                      onChange={e => setAbuseForm({...abuseForm, details: e.target.value})}
                      placeholder="Please list all details, links, or facts backing this report..." 
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #EDE9E0", fontSize: 13, outline: "none", background: "#fff", resize: "vertical" }} 
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#555", display: "block", marginBottom: 4 }}>Your Email Address (For follow-up)</label>
                    <input 
                      type="email" 
                      required 
                      value={abuseForm.email}
                      onChange={e => setAbuseForm({...abuseForm, email: e.target.value})}
                      placeholder="email@example.com" 
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #EDE9E0", fontSize: 13, outline: "none", background: "#fff" }} 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={abuseSubmitting}
                    style={{ background: "#d93838", color: "#fff", border: "none", padding: "12px 0", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  >
                    {abuseSubmitting ? <Loader2 size={16} className="animate-spin" /> : <AlertTriangle size={16} />} Submit Fraud Report
                  </button>
                </form>
              )}
            </div>
          </div>
        );

      case "faqs":
        return (
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, color: "#1B4332", marginBottom: 16 }}>
              Frequently Asked Questions (FAQs)
            </h2>
            <p style={{ fontSize: 15, color: "#555", lineHeight: 1.7, marginBottom: 24 }}>
              Clear answers to the most common queries about Orpon's transparency standards, payouts, and donations.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                {
                  q: "What makes Orpon different from other crowdfunding platforms?",
                  a: "Orpon implements cryptographic verification (donation hashing) and a public ledger. Every transaction generates a unique SHA-256 hash linked directly to the previous transaction. Anyone can audit the database integrity dynamically to confirm no records were modified or hidden."
                },
                {
                  q: "Can I donate anonymously?",
                  a: "Yes. Donors can select between three privacy tiers: Public Name (shows full name), Anonymous (hides real identity completely), or Pseudonym (displays a system-generated title like 'Donor-9421')."
                },
                {
                  q: "Are there platform fees on Orpon?",
                  a: "No. Orpon charges a 0% platform fee. However, third-party payment processors (such as bKash, Nagad, or SSLCommerz card networks) may assess transactional fees standard to processing networks in Bangladesh."
                },
                {
                  q: "How are campaigns verified before listing?",
                  a: "Our vetting team requires NID verification for organizers, as well as institutional verification (hospital certificates, tuition logs, municipal NGO paperwork). Only vetted campaigns receive the check badge."
                },
                {
                  q: "What payment gateways are supported?",
                  a: "We integrate official sandbox systems for mobile financial services in Bangladesh (bKash checkout, Nagad Simulators) and standard cards (VISA, Mastercard, SSLCommerz gateway)."
                }
              ].map((faq, i) => (
                <div key={i} style={{ borderBottom: "1px solid #EDE9E0", paddingBottom: 16 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A2E", marginBottom: 6 }}>
                    Q: {faq.q}
                  </h4>
                  <p style={{ fontSize: 14, color: "#555", lineHeight: 1.6, margin: 0 }}>
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case "privacy-policy":
        return (
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, color: "#1B4332", marginBottom: 16 }}>
              Privacy Policy
            </h2>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>Last updated: June 7, 2026</p>
            
            <div style={{ fontSize: 14, color: "#555", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: 16 }}>
              <p>
                At Orpon, accessible from orpon.org, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Orpon and how we use it.
              </p>
              
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A2E", marginTop: 12 }}>1. Information We Collect</h3>
              <p>
                To maintain transparency and accountability, users register with their Full Name, Email Address, Verified Bangladeshi Mobile Number, and National Identity Card (NID) details. We store this information securely inside encrypted Azure SQL databases.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A2E", marginTop: 12 }}>2. Donor Privacy Controls</h3>
              <p>
                Our platform lets donors control their public footprint. Depending on your chosen privacy tier, your donation will display as your full name, anonymous, or a random pseudonym. Vetting coordinates (NID, real email) are never publicly exposed.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A2E", marginTop: 12 }}>3. Payment Information</h3>
              <p>
                All payment transactions are handled securely through API integrations with bKash, Nagad, and card processors. Orpon does not store credit card CVV codes or payment PINs.
              </p>
            </div>
          </div>
        );

      case "terms-of-service":
        return (
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, color: "#1B4332", marginBottom: 16 }}>
              Terms of Service
            </h2>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>Last updated: June 7, 2026</p>

            <div style={{ fontSize: 14, color: "#555", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: 16 }}>
              <p>
                Welcome to Orpon. These terms and conditions outline the rules and regulations for the use of Orpon's Donation Verification Platform.
              </p>
              
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A2E", marginTop: 12 }}>1. Acceptable Use</h3>
              <p>
                Organizers agree that all campaigns must present accurate, verified information. Presenting false documentation, impersonating other causes, or misrepresenting the status of beneficiaries will result in immediate campaign ban, resource freeze, and reporting to relevant legal authorities in Bangladesh.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A2E", marginTop: 12 }}>2. Donation Transparency Vow</h3>
              <p>
                By donating, you acknowledge that Orpon logs all transaction records on a public cryptographic ledger. This tracking code ensures platform integrity and cannot be deleted or manipulated.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A2E", marginTop: 12 }}>3. Anti-Money Laundering</h3>
              <p>
                Orpon cooperates with payment gateways to prevent money laundering and fraudulent financial activity. All cash distributions are routed through audited banking channels in Bangladesh.
              </p>
            </div>
          </div>
        );

      case "cookie-policy":
        return (
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, color: "#1B4332", marginBottom: 16 }}>
              Cookie Policy
            </h2>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>Last updated: June 7, 2026</p>

            <div style={{ fontSize: 14, color: "#555", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: 16 }}>
              <p>
                Like any other professional web platform, Orpon uses 'cookies'. These cookies are used to store information including visitors' preferences, and user sessions.
              </p>
              
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A2E", marginTop: 12 }}>1. Essential Session Cookies</h3>
              <p>
                We use cookies to maintain your logged-in session securely (`authToken`). These cookies are strictly necessary to authorize your access to make campaigns, write comments, or check your dashboard.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A2E", marginTop: 12 }}>2. Preference Cookies</h3>
              <p>
                These cookies help us store your settings (like payment sandbox preferences) to optimize performance. Disabling these cookies may cause parts of the donation flow to lose session state.
              </p>
            </div>
          </div>
        );

      default:
        return <div>Section not found.</div>;
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 5% 80px", animation: "fadeUp 0.4s ease both" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13, color: "#888", marginBottom: 24 }}>
        <span style={{ cursor: "pointer" }} onClick={() => nav("home")}>Home</span>
        <ChevronRight size={12} />
        <span style={{ color: "#1B4332", fontWeight: 600 }}>
          {menuGroups.flatMap(g => g.items).find(i => i.slug === activeTab)?.label || "Information"}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", lg: "260px 1fr", gap: 40, alignItems: "start" }} className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10">
        
        {/* Sidebar Nav */}
        <div style={{ background: "#fff", border: "1px solid #EDE9E0", borderRadius: 20, padding: "20px 16px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
          {menuGroups.map((group) => (
            <div key={group.title} style={{ marginBottom: 18 }}>
              <h5 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#aaa", letterSpacing: 0.5, marginBottom: 8, paddingLeft: 12 }}>
                {group.title}
              </h5>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isSelected = activeTab === item.slug;
                  return (
                    <button
                      key={item.slug}
                      onClick={() => handleTabChange(item.slug)}
                      style={{
                        background: isSelected ? "#1B433212" : "none",
                        border: "none",
                        borderRadius: 10,
                        padding: "10px 12px",
                        textAlign: "left",
                        fontSize: 13,
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? "#1B4332" : "#555",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        width: "100%",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={e => {
                        if (!isSelected) e.currentTarget.style.background = "#F8F6F0";
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) e.currentTarget.style.background = "none";
                      }}
                    >
                      <Icon size={16} style={{ color: isSelected ? "#1B4332" : "#888" }} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Content Display Card */}
        <div style={{ background: "#fff", border: "1px solid #EDE9E0", borderRadius: 22, padding: "40px 36px", boxShadow: "0 8px 30px rgba(0,0,0,0.02)", minHeight: 400 }}>
          {renderContent()}
        </div>

      </div>
    </div>
  );
}
