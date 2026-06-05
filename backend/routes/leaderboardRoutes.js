const express = require("express");
const router = express.Router();
const { getLeaderboard } = require("../controllers/leaderboardController");

// Public endpoint – no auth required
router.get("/leaderboard", getLeaderboard);

module.exports = router;
