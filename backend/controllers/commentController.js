const db = require("../config/db");

const getComments = async (req, res) => {
    try {
        const { campaignId } = req.params;
        const [comments] = await db.query(`
            SELECT c.id, c.campaign_id, c.user_id, c.comment_text, c.created_at, u.full_name AS user_name
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.campaign_id = ?
            ORDER BY c.created_at DESC
        `, [campaignId]);

        res.json({
            success: true,
            comments
        });
    } catch (error) {
        console.error("getComments error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

const createComment = async (req, res) => {
    try {
        const { campaignId } = req.params;
        const { comment_text } = req.body;
        const userId = req.user.id;

        if (!comment_text || !comment_text.trim()) {
            return res.status(400).json({ message: "Comment content cannot be empty" });
        }

        if (comment_text.trim().length > 1000) {
            return res.status(400).json({ message: "Comment cannot exceed 1000 characters" });
        }

        // Verify campaign exists
        const [campaigns] = await db.query("SELECT id FROM campaigns WHERE id = ?", [campaignId]);
        if (campaigns.length === 0) {
            return res.status(404).json({ message: "Campaign not found" });
        }

        // Insert comment
        const [result] = await db.query(`
            INSERT INTO comments (campaign_id, user_id, comment_text, created_at)
            OUTPUT INSERTED.id
            VALUES (?, ?, ?, GETDATE())
        `, [campaignId, userId, comment_text.trim()]);

        const commentId = result.insertId;

        // Fetch the newly created comment with user details
        const [newComments] = await db.query(`
            SELECT c.id, c.campaign_id, c.user_id, c.comment_text, c.created_at, u.full_name AS user_name
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        `, [commentId]);

        res.status(201).json({
            success: true,
            comment: newComments[0]
        });
    } catch (error) {
        console.error("createComment error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

const updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { comment_text } = req.body;
        const userId = req.user.id;

        if (!comment_text || !comment_text.trim()) {
            return res.status(400).json({ message: "Comment content cannot be empty" });
        }

        if (comment_text.trim().length > 1000) {
            return res.status(400).json({ message: "Comment cannot exceed 1000 characters" });
        }

        // Verify comment exists and user is owner
        const [comments] = await db.query("SELECT user_id FROM comments WHERE id = ?", [commentId]);
        if (comments.length === 0) {
            return res.status(404).json({ message: "Comment not found" });
        }

        if (String(comments[0].user_id) !== String(userId)) {
            return res.status(403).json({ message: "You can only edit your own comments" });
        }

        // Update comment
        await db.query("UPDATE comments SET comment_text = ? WHERE id = ?", [comment_text.trim(), commentId]);

        // Fetch updated comment
        const [updatedComments] = await db.query(`
            SELECT c.id, c.campaign_id, c.user_id, c.comment_text, c.created_at, u.full_name AS user_name
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        `, [commentId]);

        res.json({
            success: true,
            comment: updatedComments[0]
        });
    } catch (error) {
        console.error("updateComment error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Fetch comment and the associated campaign owner
        const [comments] = await db.query(`
            SELECT c.user_id, c.campaign_id, camp.user_id AS campaign_owner_id
            FROM comments c
            JOIN campaigns camp ON c.campaign_id = camp.id
            WHERE c.id = ?
        `, [commentId]);

        if (comments.length === 0) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const comment = comments[0];

        // Authorization: Author, Campaign Owner, Admin, or Super Admin
        const isAuthor = String(comment.user_id) === String(userId);
        const isCampaignOwner = String(comment.campaign_owner_id) === String(userId);
        const isAdmin = userRole === "admin" || userRole === "super_admin";

        if (!isAuthor && !isCampaignOwner && !isAdmin) {
            return res.status(403).json({ message: "You do not have permission to delete this comment" });
        }

        // Delete comment
        await db.query("DELETE FROM comments WHERE id = ?", [commentId]);

        res.json({
            success: true,
            message: "Comment deleted successfully"
        });
    } catch (error) {
        console.error("deleteComment error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    getComments,
    createComment,
    updateComment,
    deleteComment
};
