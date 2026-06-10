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

app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
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