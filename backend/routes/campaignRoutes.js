const express = require("express");
const router = express.Router();

const authMiddleware =
require("../middleware/authMiddleware");

const {
    createCampaign
} = require("../controllers/campaignController");

router.post(
    "/campaign/create",
    authMiddleware,
    createCampaign
);

module.exports = router;