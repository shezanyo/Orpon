const express = require("express");
const router = express.Router();

const authMiddleware =
require("../middleware/authMiddleware");

const {
    createCampaign,
    getCampaigns,
    deleteCampaign
} = require("../controllers/campaignController");

router.get("/campaigns", getCampaigns);

router.post(
    "/campaign/create",
    authMiddleware,
    createCampaign
);

router.delete(
    "/campaign/:id",
    authMiddleware,
    deleteCampaign
);

module.exports = router;