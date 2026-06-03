import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  if (!user) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh", color: "#888" }}>
        Please log in to view your profile.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 650, margin: "40px auto 80px", padding: "0 20px" }}>
      <div style={{
        background: "#fff", borderRadius: 24, border: "1px solid #EDE9E0",
        padding: "40px 32px", boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
        animation: "fadeUp 0.5s ease both"
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32, borderBottom: "1px solid #EDE9E0", paddingBottom: 24 }}>
          <div style={{
            background: "linear-gradient(135deg, #2D6A4F, #1B4332)",
            color: "#fff", width: 64, height: 64, borderRadius: 20,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 700
          }}>
            {user.full_name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 700, color: "#1A1A2E" }}>
              {user.full_name}
            </h2>
            <p style={{ color: "#888", fontSize: 14 }}>Registered Supporter</p>
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ display: "grid", gap: 24 }}>
          {[
            { label: "Full Name", value: user.full_name, icon: "👤" },
            { label: "Email Address", value: user.email, icon: "✉️" },
            { label: "Phone Number", value: user.phone || "Not provided", icon: "📞" },
            { label: "NID Card Number", value: user.nid || "Not provided", icon: "💳" },
            { label: "Address", value: user.address || "Not provided", icon: "📍" },
            { label: "Member Since", value: formatDate(user.created_at), icon: "🗓️" }
          ].map((item, idx) => (
            <div key={idx} style={{
              display: "flex", alignItems: "flex-start", gap: 16,
              background: "#F8F6F0", padding: "16px 20px", borderRadius: 16
            }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <div style={{ wordBreak: "break-word" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#888", display: "block", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                  {item.label}
                </span>
                <span style={{ fontSize: 16, color: "#1A1A2E", fontWeight: 500 }}>
                  {item.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
