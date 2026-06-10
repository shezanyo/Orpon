const express = require("express");
const router = express.Router();
const multer = require("multer");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB file size limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed!"), false);
        }
    }
});

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
    upload.array("images", 3),
    createCampaign
);

router.delete(
    "/campaign/:id",
    authMiddleware,
    deleteCampaign
);

module.exports = router;