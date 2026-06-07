const express = require("express");
const { manualAnchor, getAnchorHistory, getBlockchainStatus } = require("../controllers/anchorController");
const { verifyAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Get blockchain status (protected)
router.get("/status", verifyAdmin, getBlockchainStatus);

// Get anchor history (public - for transparency)
router.get("/history", getAnchorHistory);

// Trigger a manual anchor (protected)
router.post("/manual", verifyAdmin, manualAnchor);

module.exports = router;
