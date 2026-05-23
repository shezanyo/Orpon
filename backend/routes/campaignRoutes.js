const express = require("express");
const router = express.Router();

const authMiddleware =
require("../middleware/authMiddleware");

const {
    createCampaign,
    getCampaigns
} = require("../controllers/campaignController");

router.get("/campaigns", getCampaigns);

router.post(
    "/campaign/create",
    authMiddleware,
    createCampaign
);

module.exports = router;