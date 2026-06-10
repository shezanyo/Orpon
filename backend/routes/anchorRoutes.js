const express = require("express");
const { manualAnchor, getAnchorHistory, getBlockchainStatus } = require("../controllers/anchorController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// Get blockchain status (protected)
router.get("/status", authMiddleware, adminMiddleware, getBlockchainStatus);

// Get anchor history (public - for transparency)
router.get("/history", getAnchorHistory);

// Trigger a manual anchor (protected)
router.post("/manual", authMiddleware, adminMiddleware, manualAnchor);

module.exports = router;
