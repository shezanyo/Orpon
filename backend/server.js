require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const { validateEnv } = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const campaignRoutes =
require("./routes/campaignRoutes");
const donationRoutes =
require("./routes/donationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const commentRoutes = require("./routes/commentRoutes");
const anchorRoutes = require("./routes/anchorRoutes");

// Validate required environment variables before starting
validateEnv();

const app = express();

// Build the list of allowed CORS origins:
// 1. The primary FRONTEND_URL (Azure Static Web Apps default URL)
// 2. Any additional origins from CORS_ORIGINS (comma-separated)
// 3. The custom domain orpon.me (both www and apex)
const allowedOrigins = new Set([
    process.env.FRONTEND_URL || "http://localhost:5173",
    "http://localhost:5173",
    "https://orpon.me",
    "https://www.orpon.me",
    ...(process.env.CORS_ORIGINS || "").split(",").map(o => o.trim()).filter(Boolean),
]);

app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (curl, mobile apps, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.has(origin)) return callback(null, true);
        callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", authRoutes);
app.use("/api", campaignRoutes);
app.use("/api", donationRoutes);
app.use("/api", adminRoutes);
app.use("/api", leaderboardRoutes);
app.use("/api", commentRoutes);
app.use("/api/anchors", anchorRoutes);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error"
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});