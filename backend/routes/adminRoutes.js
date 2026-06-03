const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    getAdminStats,
    getAdminCampaigns,
    getAdminDonations,
    getAdminLogs,
    verifyIntegrity
} = require("../controllers/adminController");

// Mount all admin endpoints behind auth + admin checks
router.get("/admin/stats", authMiddleware, adminMiddleware, getAdminStats);
router.get("/admin/campaigns", authMiddleware, adminMiddleware, getAdminCampaigns);
router.get("/admin/donations", authMiddleware, adminMiddleware, getAdminDonations);
router.get("/admin/logs", authMiddleware, adminMiddleware, getAdminLogs);
router.get("/verify", authMiddleware, adminMiddleware, verifyIntegrity);

module.exports = router;
