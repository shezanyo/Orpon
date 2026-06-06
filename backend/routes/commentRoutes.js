const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getComments,
    createComment,
    updateComment,
    deleteComment
} = require("../controllers/commentController");

// Public route to view comments
router.get("/campaign/:campaignId/comments", getComments);

// Authenticated routes to post, edit, or delete comments
router.post("/campaign/:campaignId/comments", authMiddleware, createComment);
router.put("/comment/:commentId", authMiddleware, updateComment);
router.delete("/comment/:commentId", authMiddleware, deleteComment);

module.exports = router;
