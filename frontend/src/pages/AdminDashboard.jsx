import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getAdminStats,
  getAdminCampaigns,
  getAdminDonations,
  getAdminLogs,
  verifyIntegrity,
  getAdminUsers,
  makeUserAdmin
} from "../utils/api";
import { fmt } from "../utils/format";
import { Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // State for stats cards
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // State for campaigns
  const [campaigns, setCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);

  // State for donations
  const [donations, setDonations] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(true);

  // State for logs
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // State for user management (super_admin only)
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [promoteEmail, setPromoteEmail] = useState("");
  const [promoteMsg, setPromoteMsg] = useState("");
  const [promoteError, setPromoteError] = useState("");
  const [promoting, setPromoting] = useState(false);

  // State for integrity check
  const [integrityStatus, setIntegrityStatus] = useState("NOT RUN"); // NOT RUN, RUNNING, VALID, INVALID
  const [verifying, setVerifying] = useState(false);
  const [copiedHashId, setCopiedHashId] = useState(null);

  // Fetch stats and overview logs initially
  useEffect(() => {
    if (user?.role !== "admin" && user?.role !== "super_admin") return;
    
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const res = await getAdminStats();
        if (res.success) setStats(res.stats);
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [user]);

  // Fetch lists based on active tab
  useEffect(() => {
    if (user?.role !== "admin" && user?.role !== "super_admin") return;

    const fetchTabContent = async () => {
      try {
        if (activeTab === "campaigns") {
          setLoadingCampaigns(true);
          const res = await getAdminCampaigns();
          if (res.success) setCampaigns(res.campaigns);
        } else if (activeTab === "donations") {
          setLoadingDonations(true);
          const res = await getAdminDonations();
          if (res.success) setDonations(res.donations);
        } else if (activeTab === "logs") {
          setLoadingLogs(true);
          const res = await getAdminLogs();
          if (res.success) setLogs(res.logs);
        } else if (activeTab === "users" && user?.role === "super_admin") {
          setLoadingUsers(true);
          const res = await getAdminUsers();
          if (res.success) setUsers(res.users);
        }
      } catch (err) {
        console.error(`Failed to load ${activeTab} data:`, err);
      } finally {
        setLoadingCampaigns(false);
        setLoadingDonations(false);
        setLoadingLogs(false);
        setLoadingUsers(false);
      }
    };

    fetchTabContent();
  }, [activeTab, user]);

  const handlePromoteAdmin = async (e) => {
    e.preventDefault();
    if (!promoteEmail.trim()) return;
    try {
      setPromoting(true);
      setPromoteMsg("");
      setPromoteError("");
      const res = await makeUserAdmin(promoteEmail.trim());
      if (res.success) {
        setPromoteMsg(res.message || "User promoted to admin successfully!");
        setPromoteEmail("");
        // Reload user list
        const usersRes = await getAdminUsers();
        if (usersRes.success) setUsers(usersRes.users);
      } else {
        setPromoteError(res.message || "Failed to promote user to admin.");
      }
    } catch (err) {
      console.error("Failed to promote user:", err);
      setPromoteError(err.message || "An error occurred while promoting user.");
    } finally {
      setPromoting(false);
    }
  };

  const handleVerifyIntegrity = async () => {
    try {
      setVerifying(true);
      setIntegrityStatus("RUNNING");
      const res = await verifyIntegrity();
      if (res.success) {
        setIntegrityStatus(res.status); // VALID or INVALID
        // Refresh logs if currently on logs tab
        if (activeTab === "logs") {
          const logsRes = await getAdminLogs();
          if (logsRes.success) setLogs(logsRes.logs);
        }
        // Refresh stats too
        const statsRes = await getAdminStats();
        if (statsRes.success) setStats(statsRes.stats);
      } else {
        setIntegrityStatus("INVALID");
      }
    } catch (err) {
      console.error("Integrity verification failed:", err);
      setIntegrityStatus("INVALID");
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedHashId(id);
    setTimeout(() => setCopiedHashId(null), 2000);
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

  // Access check
  if (user?.role !== "admin" && user?.role !== "super_admin") {
    return (
      <div style={{ textAlign: "center", padding: "120px 5%", animation: "fadeUp 0.5s ease" }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🛑</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, marginBottom: 12, color: "#1A1A2E" }}>Access Denied</h2>
        <p style={{ color: "#888", marginBottom: 32, fontSize: 16 }}>This page requires administrative permissions.</p>
        <a href="/" style={{ background: "#1B4332", color: "#fff", textDecoration: "none", padding: "14px 36px", borderRadius: 12, fontSize: 15, fontWeight: 600 }}>
          Go back home
        </a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "40px auto 80px", padding: "0 5%" }}>
      {/* Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 38, fontWeight: 700, color: "#1A1A2E" }}>
            Admin Management Portal
          </h2>
          <p style={{ color: "#888", marginTop: 4 }}>Donation ledger supervision, campaign management, and blockchain integrity audits</p>
        </div>
      </div>

      {/* Main Grid Layout: left dashboard + right integrity auditor */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 32, alignItems: "start" }}>
        
        {/* Left Dashboard Area */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          
          {/* Stats Cards Row */}
          {loadingStats ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ background: "#fff", height: 120, borderRadius: 20, border: "1px solid #EDE9E0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Loader2 className="animate-spin" style={{ color: "#ccc" }} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
              {[
                { label: "Total Registered Users", value: stats?.totalUsers || 0, icon: "👥" },
                { label: "Total Campaigns", value: stats?.totalCampaigns || 0, icon: "📣" },
                { label: "Total Completed Donations", value: stats?.totalDonations || 0, icon: "💸" },
                { label: "Total Funds Raised", value: fmt(stats?.totalRaised || 0), icon: "🍀", color: "#1B4332" }
              ].map((card, idx) => (
                <div key={idx} style={{
                  background: "#fff", borderRadius: 20, border: "1px solid #EDE9E0",
                  padding: 24, boxShadow: "0 4px 15px rgba(0,0,0,0.01)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 20 }}>
                    <span>{card.icon}</span>
                  </div>
                  <span style={{ fontSize: 12, color: "#888", fontWeight: 600, textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                    {card.label}
                  </span>
                  <span style={{ fontSize: 26, fontWeight: 700, color: card.color || "#1A1A2E" }}>
                    {card.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Navigation Tabs */}
          <div style={{ borderBottom: "1px solid #EDE9E0", display: "flex", gap: 8 }}>
            {[
              { id: "overview", label: "Overview" },
              { id: "campaigns", label: "Campaigns Management" },
              { id: "donations", label: "Donations Ledger" },
              { id: "logs", label: "System Logs" },
              ...(user?.role === "super_admin" ? [{ id: "users", label: "User Management" }] : [])
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: "none", border: "none", padding: "12px 18px",
                  fontSize: 14, fontWeight: 600, color: activeTab === tab.id ? "#1B4332" : "#888",
                  borderBottom: activeTab === tab.id ? "3px solid #1B4332" : "3px solid transparent",
                  cursor: "pointer", transition: "all 0.2s"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Contents Area */}
          <div style={{
            background: "#fff", borderRadius: 24, border: "1px solid #EDE9E0",
            padding: 32, boxShadow: "0 10px 30px rgba(0,0,0,0.02)", minHeight: 400
          }}>
            
            {/* 1. Tab Overview */}
            {activeTab === "overview" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, color: "#1A1A2E" }}>
                  Supervision Portal Overview
                </h3>
                <p style={{ color: "#666", fontSize: 14, lineHeight: 1.6 }}>
                  Welcome back, administrator. Use this portal to monitor user details, inspect donation ledgers, and audit blockchain chain links. Orpon uses SHA-256 cryptographic chain blocks on Azure SQL database fields to ensure no donation can be tampered with once recorded.
                </p>
                <div style={{ background: "#F8F6F0", borderRadius: 16, padding: 24, border: "1px solid #EDE9E0" }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: "#1B4332", marginBottom: 12 }}>🛡️ Database Blockchain Chain-Link Security</h4>
                  <ul style={{ paddingLeft: 18, color: "#555", fontSize: 13, display: "grid", gap: 8 }}>
                    <li>All completed donations form a cryptographic block chain structure.</li>
                    <li>Each block contains the hash of the preceding block (`previous_hash`).</li>
                    <li>Changing any block's amount, timestamp, or name instantly invalidates the entire subsequent chain.</li>
                    <li>Click the **Verify Integrity** button in the auditor panel to audit the entire database chain ledger.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 2. Tab Campaigns */}
            {activeTab === "campaigns" && (
              <div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, color: "#1A1A2E", marginBottom: 24 }}>
                  Campaigns Directory
                </h3>
                {loadingCampaigns ? (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
                    <Loader2 className="animate-spin" style={{ color: "#2D6A4F" }} />
                  </div>
                ) : campaigns.length === 0 ? (
                  <p style={{ color: "#888", textAlign: "center", padding: "40px 0" }}>No campaigns registered in the system.</p>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #EDE9E0" }}>
                          <th style={{ padding: "12px 16px", color: "#888", fontSize: 13, fontWeight: 600 }}>CAMPAIGN TITLE</th>
                          <th style={{ padding: "12px 16px", color: "#888", fontSize: 13, fontWeight: 600 }}>CREATOR</th>
                          <th style={{ padding: "12px 16px", color: "#888", fontSize: 13, fontWeight: 600 }}>GOAL TARGET</th>
                          <th style={{ padding: "12px 16px", color: "#888", fontSize: 13, fontWeight: 600 }}>COLLECTED</th>
                          <th style={{ padding: "12px 16px", color: "#888", fontSize: 13, fontWeight: 600 }}>CREATION DATE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaigns.map((c) => (
                          <tr key={c.id} style={{ borderBottom: "1px solid #F5F3ED" }}>
                            <td style={{ padding: "16px", color: "#1A1A2E", fontWeight: 600, fontSize: 14 }}>{c.title}</td>
                            <td style={{ padding: "16px", color: "#555", fontSize: 13 }}>{c.owner_name || "Unknown"}</td>
                            <td style={{ padding: "16px", color: "#555", fontSize: 13 }}>{fmt(c.target_amount)}</td>
                            <td style={{ padding: "16px", color: "#1B4332", fontWeight: 700, fontSize: 13 }}>{fmt(c.collected_amount)}</td>
                            <td style={{ padding: "16px", color: "#888", fontSize: 12 }}>{formatDate(c.created_date)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 3. Tab Donations */}
            {activeTab === "donations" && (
              <div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, color: "#1A1A2E", marginBottom: 24 }}>
                  Donations Ledger Audit log
                </h3>
                {loadingDonations ? (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
                    <Loader2 className="animate-spin" style={{ color: "#2D6A4F" }} />
                  </div>
                ) : donations.length === 0 ? (
                  <p style={{ color: "#888", textAlign: "center", padding: "40px 0" }}>No donations recorded in the system.</p>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #EDE9E0" }}>
                          <th style={{ padding: "12px 16px", color: "#888", fontSize: 13, fontWeight: 600 }}>DONOR</th>
                          <th style={{ padding: "12px 16px", color: "#888", fontSize: 13, fontWeight: 600 }}>CAMPAIGN</th>
                          <th style={{ padding: "12px 16px", color: "#888", fontSize: 13, fontWeight: 600 }}>AMOUNT</th>
                          <th style={{ padding: "12px 16px", color: "#888", fontSize: 13, fontWeight: 600 }}>PRIVACY TYPE</th>
                          <th style={{ padding: "12px 16px", color: "#888", fontSize: 13, fontWeight: 600 }}>BLOCK HASH</th>
                          <th style={{ padding: "12px 16px", color: "#888", fontSize: 13, fontWeight: 600 }}>TIMESTAMP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {donations.map((d) => (
                          <tr key={d.id} style={{ borderBottom: "1px solid #F5F3ED" }}>
                            <td style={{ padding: "16px", color: "#1A1A2E", fontWeight: 600, fontSize: 13 }}>{d.donor_name}</td>
                            <td style={{ padding: "16px", color: "#555", fontSize: 13, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.campaign_name}</td>
                            <td style={{ padding: "16px", color: "#1B4332", fontWeight: 700, fontSize: 13 }}>{fmt(d.amount)}</td>
                            <td style={{ padding: "16px", color: "#888", fontSize: 12 }}>
                              <span style={{ background: "#F0EFEA", padding: "2px 8px", borderRadius: 99, fontWeight: 500 }}>
                                {d.privacy_type}
                              </span>
                            </td>
                            <td style={{ padding: "16px", fontFamily: "monospace", fontSize: 11, color: "#888" }}>
                              <span 
                                onClick={() => copyToClipboard(d.current_hash, d.id)}
                                style={{ cursor: "pointer", textDecoration: "underline", color: copiedHashId === d.id ? "#065F46" : "#2D6A4F" }}
                              >
                                {copiedHashId === d.id ? "Copied!" : `${d.current_hash?.slice(0, 10)}...`}
                              </span>
                            </td>
                            <td style={{ padding: "16px", color: "#888", fontSize: 12 }}>{formatDate(d.timestamp)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 4. Tab Logs */}
            {activeTab === "logs" && (
              <div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, color: "#1A1A2E", marginBottom: 24 }}>
                  System Audit Logs
                </h3>
                {loadingLogs ? (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
                    <Loader2 className="animate-spin" style={{ color: "#2D6A4F" }} />
                  </div>
                ) : logs.length === 0 ? (
                  <p style={{ color: "#888", textAlign: "center", padding: "40px 0" }}>No logs recorded in the system.</p>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #EDE9E0" }}>
                          <th style={{ padding: "12px 16px", color: "#888", fontSize: 13, fontWeight: 600 }}>ACTION</th>
                          <th style={{ padding: "12px 16px", color: "#888", fontSize: 13, fontWeight: 600 }}>DETAILS</th>
                          <th style={{ padding: "12px 16px", color: "#888", fontSize: 13, fontWeight: 600 }}>TIMESTAMP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((log) => (
                          <tr key={log.id} style={{ borderBottom: "1px solid #F5F3ED" }}>
                            <td style={{ padding: "16px", color: "#1A1A2E", fontWeight: 700, fontSize: 13 }}>
                              <span style={{
                                background: log.action.includes("Error") || log.action.includes("INVALID") ? "#FDE2E2" : "#E2ECE9",
                                color: log.action.includes("Error") || log.action.includes("INVALID") ? "#922B21" : "#1B4332",
                                padding: "4px 10px", borderRadius: 8, fontSize: 12
                              }}>
                                {log.action}
                              </span>
                            </td>
                            <td style={{ padding: "16px", color: "#555", fontSize: 13, wordBreak: "break-word" }}>{log.details}</td>
                            <td style={{ padding: "16px", color: "#888", fontSize: 12 }}>{formatDate(log.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 5. Tab User Management (super_admin only) */}
            {activeTab === "users" && user?.role === "super_admin" && (
              <div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, color: "#1A1A2E", marginBottom: 24 }}>
                  User & Admin Management
                </h3>
                
                {/* Promote to Admin Form */}
                <div style={{
                  background: "#F8F6F0",
                  borderRadius: 16,
                  padding: 24,
                  border: "1px solid #EDE9E0",
                  marginBottom: 32
                }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: "#1B4332", marginBottom: 12 }}>Promote User to Admin</h4>
                  <p style={{ color: "#666", fontSize: 13, marginBottom: 16 }}>
                    Enter a registered user's email address to promote them to the Admin role. Promoted admins will have access to logs, campaigns, and donation integrity verification.
                  </p>
                  
                  <form onSubmit={handlePromoteAdmin} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <input
                      type="email"
                      placeholder="user@example.com"
                      value={promoteEmail}
                      onChange={(e) => setPromoteEmail(e.target.value)}
                      required
                      style={{
                        flex: "1 1 300px",
                        padding: "12px 16px",
                        borderRadius: 10,
                        border: "1px solid #EDE9E0",
                        fontSize: 14,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        outline: "none"
                      }}
                    />
                    <button
                      type="submit"
                      disabled={promoting}
                      style={{
                        background: promoting ? "#888" : "#1B4332",
                        color: "#fff",
                        border: "none",
                        padding: "12px 24px",
                        borderRadius: 10,
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: promoting ? "not-allowed" : "pointer",
                        transition: "background 0.2s"
                      }}
                    >
                      {promoting ? "Promoting..." : "Make Admin"}
                    </button>
                  </form>

                  {promoteMsg && (
                    <div style={{ marginTop: 12, color: "#047857", fontSize: 13, fontWeight: 600 }}>
                      ✓ {promoteMsg}
                    </div>
                  )}
                  {promoteError && (
                    <div style={{ marginTop: 12, color: "#B91C1C", fontSize: 13, fontWeight: 600 }}>
                      ✗ {promoteError}
                    </div>
                  )}
                </div>

                {/* Users List Table */}
                <h4 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A2E", marginBottom: 16 }}>Registered Users Directory</h4>
                {loadingUsers ? (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
                    <Loader2 className="animate-spin" style={{ color: "#2D6A4F" }} />
                  </div>
                ) : users.length === 0 ? (
                  <p style={{ color: "#888", textAlign: "center", padding: "40px 0" }}>No registered users found.</p>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #EDE9E0" }}>
                          <th style={{ padding: "12px 16px", color: "#888", fontSize: 13, fontWeight: 600 }}>FULL NAME</th>
                          <th style={{ padding: "12px 16px", color: "#888", fontSize: 13, fontWeight: 600 }}>EMAIL</th>
                          <th style={{ padding: "12px 16px", color: "#888", fontSize: 13, fontWeight: 600 }}>ROLE</th>
                          <th style={{ padding: "12px 16px", color: "#888", fontSize: 13, fontWeight: 600 }}>JOINED DATE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id} style={{ borderBottom: "1px solid #F5F3ED" }}>
                            <td style={{ padding: "16px", color: "#1A1A2E", fontWeight: 600, fontSize: 14 }}>
                              {u.full_name}
                            </td>
                            <td style={{ padding: "16px", color: "#555", fontSize: 13 }}>
                              {u.email}
                            </td>
                            <td style={{ padding: "16px", fontSize: 13 }}>
                              <span style={{
                                background: u.role === "super_admin" ? "#FEF3C7" : u.role === "admin" ? "#E2ECE9" : "#F3F4F6",
                                color: u.role === "super_admin" ? "#92400E" : u.role === "admin" ? "#1B4332" : "#4B5563",
                                padding: "4px 10px",
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 700
                              }}>
                                {u.role === "super_admin" ? "Super Admin" : u.role === "admin" ? "Admin" : "User"}
                              </span>
                            </td>
                            <td style={{ padding: "16px", color: "#888", fontSize: 12 }}>
                              {formatDate(u.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

        {/* Right Auditor Sidebar */}
        <div style={{
          background: "#fff", borderRadius: 24, border: "1px solid #EDE9E0",
          padding: 28, boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
          display: "flex", flexDirection: "column", gap: 24
        }}>
          <div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: "#1A1A2E" }}>
              Ledger Integrity Audit
            </h3>
            <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>Verify the cryptographic chain consistency of all donations in the ledger.</p>
          </div>

          <div style={{ borderTop: "1px solid #EDE9E0", borderBottom: "1px solid #EDE9E0", padding: "20px 0", textAlign: "center" }}>
            <span style={{ fontSize: 12, color: "#888", textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: 8 }}>
              Audit Verification Status
            </span>

            {/* Status Display badge */}
            <div style={{
              background: integrityStatus === "VALID" ? "#ECFDF5" : integrityStatus === "INVALID" ? "#FDF2F2" : "#F3F4F6",
              color: integrityStatus === "VALID" ? "#047857" : integrityStatus === "INVALID" ? "#B91C1C" : "#4B5563",
              border: integrityStatus === "VALID" ? "1px solid #A7F3D0" : integrityStatus === "INVALID" ? "1px solid #FCA5A5" : "1px solid #E5E7EB",
              padding: "12px", borderRadius: 16, fontSize: 18, fontWeight: 700, letterSpacing: "0.05em"
            }}>
              {integrityStatus}
            </div>

            <p style={{ fontSize: 11, color: "#aaa", marginTop: 10 }}>
              {integrityStatus === "VALID" 
                ? "All block hashes match and chain link links are fully intact." 
                : integrityStatus === "INVALID" 
                ? "🚨 System mismatch detected! A block or link has been tampered with." 
                : "No audit check has been performed during this session."}
            </p>
          </div>

          <button
            onClick={handleVerifyIntegrity}
            disabled={verifying}
            style={{
              background: verifying ? "#888" : "#1B4332",
              color: "#fff",
              border: "none",
              padding: "14px",
              borderRadius: 14,
              fontWeight: 600,
              fontSize: 14,
              cursor: verifying ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              transition: "background 0.2s"
            }}
            onMouseEnter={e => { if(!verifying) e.currentTarget.style.background = "#2D6A4F"; }}
            onMouseLeave={e => { if(!verifying) e.currentTarget.style.background = "#1B4332"; }}
          >
            {verifying ? (
              <>
                <Loader2 style={{ animation: "spin 1s linear infinite" }} size={16} />
                <span>Auditing Chain...</span>
              </>
            ) : (
              <>
                <span>🛡️</span>
                <span>Verify Integrity</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
