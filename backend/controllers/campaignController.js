const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const { logAction } = require("./adminController");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "daosf3vmn",
    api_key: process.env.CLOUDINARY_API_KEY || "783888329164824",
    api_secret: process.env.CLOUDINARY_API_SECRET || "XdupKGAeMtM_HvIU2Qm6RUga1Kk"
});

const DEFAULT_CATEGORY = "Community";
const DEFAULT_COLOR = "#1B4332";
const DEFAULT_EMOJI = "🤲";

const CATEGORY_COLORS = {
    "Disaster Relief": "#2D6A4F",
    Education: "#1B4F72",
    Medical: "#922B21",
    Community: "#1F618D",
    Livelihood: "#6C3483"
};

const CATEGORY_EMOJIS = {
    "Disaster Relief": "🌊",
    Education: "📚",
    Medical: "💗",
    Community: "💧",
    Livelihood: "🌱"
};

const slugify = (text) =>
    text
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 50);

const createCampaign = async (req, res) => {
    try {
        const {
            title,
            story,
            description,
            category,
            target_amount,
            days_left,
            organizer_name,
            is_verified,
            color,
            emoji,
            slug
        } = req.body;

        if (!title || !story || !target_amount) {
            return res.status(400).json({
                message: "Title, story, and target amount are required"
            });
        }

        const user_id = req.user.id;
        const [userRows] = await pool.query("SELECT full_name FROM users WHERE id = ?", [user_id]);
        const userFullName = userRows[0]?.full_name || "Community Organizer";
        const finalOrganizerName = (organizer_name && organizer_name !== "You") ? organizer_name : userFullName;

        const id = uuidv4();
        const campaignCategory = category || DEFAULT_CATEGORY;
        const campaignDescription = description || story;
        const campaignSlug = slug || `${slugify(title)}-${id.slice(0, 8)}`;
        const campaignColor = color || CATEGORY_COLORS[campaignCategory] || DEFAULT_COLOR;
        const campaignEmoji = emoji || CATEGORY_EMOJIS[campaignCategory] || DEFAULT_EMOJI;

        // Cloudinary file upload in-memory streaming
        let imageUrls = [null, null, null];
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            const uploadPromises = req.files.slice(0, 3).map((file, index) => {
                return new Promise((resolve) => {
                    const stream = cloudinary.uploader.upload_stream({
                        folder: "orpon_campaigns"
                    }, (error, result) => {
                        if (result) {
                            resolve({ index, url: result.secure_url });
                        } else {
                            console.error("Cloudinary upload error:", error);
                            resolve({ index, url: null });
                        }
                    });
                    stream.end(file.buffer);
                });
            });

            const results = await Promise.all(uploadPromises);
            results.forEach(res => {
                if (res.url) {
                    imageUrls[res.index] = res.url;
                }
            });
        }

        const img1 = imageUrls[0] || req.body.image_url_1 || null;
        const img2 = imageUrls[1] || req.body.image_url_2 || null;
        const img3 = imageUrls[2] || req.body.image_url_3 || null;

        await pool.query(`
            INSERT INTO campaigns (
                id,
                user_id,
                title,
                description,
                story,
                category,
                target_amount,
                raised_amount,
                donor_count,
                days_left,
                slug,
                organizer_name,
                is_verified,
                color,
                emoji,
                image_url_1,
                image_url_2,
                image_url_3
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id,
            user_id,
            title,
            campaignDescription,
            story,
            campaignCategory,
            Number(target_amount),
            0,
            0,
            Number(days_left || 30),
            campaignSlug,
            finalOrganizerName,
            Boolean(is_verified ?? false) ? 1 : 0,
            campaignColor,
            campaignEmoji,
            img1,
            img2,
            img3
        ]);

        await logAction("Campaign Creation", `Campaign "${title}" created by User ID ${user_id}. Target goal: ${target_amount} BDT.`);

        res.status(201).json({
            success: true,
            campaign: {
                id,
                user_id,
                slug: campaignSlug,
                title,
                organizer: finalOrganizerName,
                orgVerified: Boolean(is_verified ?? false),
                category: campaignCategory,
                description: campaignDescription,
                story,
                raised: 0,
                goal: Number(target_amount),
                donors: 0,
                daysLeft: Number(days_left || 30),
                color: campaignColor,
                emoji: campaignEmoji,
                images: [img1, img2, img3].filter(Boolean)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

const getCampaigns = async (req, res) => {
    try {
        const [campaigns] = await pool.query(`
            SELECT
                id,
                user_id,
                title,
                description,
                story,
                category,
                target_amount AS goal,
                raised_amount AS raised,
                donor_count AS donors,
                days_left AS daysLeft,
                slug,
                organizer_name AS organizer,
                is_verified AS orgVerified,
                color,
                emoji,
                image_url_1,
                image_url_2,
                image_url_3
            FROM campaigns
        `);

        const mappedCampaigns = campaigns.map((campaign) => ({
            id: campaign.id,
            user_id: campaign.user_id,
            slug: campaign.slug || `${slugify(campaign.title)}-${String(campaign.id).slice(0, 8)}`,
            title: campaign.title,
            organizer: campaign.organizer || "Community Organizer",
            orgVerified: Boolean(campaign.orgVerified ?? false),
            category: campaign.category || DEFAULT_CATEGORY,
            description: campaign.description || campaign.story || "",
            story: campaign.story || campaign.description || "",
            raised: Number(campaign.raised || 0),
            goal: Number(campaign.goal || 0),
            donors: Number(campaign.donors || 0),
            daysLeft: Number(campaign.daysLeft || 30),
            color: campaign.color || CATEGORY_COLORS[campaign.category] || DEFAULT_COLOR,
            emoji: campaign.emoji || CATEGORY_EMOJIS[campaign.category] || DEFAULT_EMOJI,
            images: [campaign.image_url_1, campaign.image_url_2, campaign.image_url_3].filter(Boolean)
        }));

        res.status(200).json({
            success: true,
            campaigns: mappedCampaigns
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

const deleteCampaign = async (req, res) => {
    try {
        const campaignId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        // 1. Fetch campaign to verify ownership/existence
        const [campaigns] = await pool.query(
            "SELECT id, user_id, title FROM campaigns WHERE id = ?",
            [campaignId]
        );

        if (campaigns.length === 0) {
            return res.status(404).json({
                message: "Campaign not found"
            });
        }

        const campaign = campaigns[0];

        // 2. Authorization check: Owner, Admin, or Super Admin
        const isOwner = String(campaign.user_id) === String(userId);
        const isAdmin = userRole === "admin" || userRole === "super_admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                message: "You do not have permission to delete this campaign"
            });
        }

        // 3. Perform delete in sequential queries
        // Delete campaign comments first
        await pool.query(
            "DELETE FROM comments WHERE campaign_id = ?",
            [campaignId]
        );

        // Update donations to set campaign_id to NULL to satisfy foreign key constraints
        await pool.query(
            "UPDATE donations SET campaign_id = NULL WHERE campaign_id = ?",
            [campaignId]
        );

        // Delete the campaign
        await pool.query(
            "DELETE FROM campaigns WHERE id = ?",
            [campaignId]
        );


        // 4. Log action
        await logAction(
            "Campaign Deletion",
            `Campaign "${campaign.title}" (ID: ${campaignId}) deleted by User ID ${userId} (Role: ${userRole}).`
        );

        res.status(200).json({
            success: true,
            message: "Campaign deleted successfully"
        });
    } catch (error) {
        console.error("[deleteCampaign] Error deleting campaign:", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

module.exports = {
    createCampaign,
    getCampaigns,
    deleteCampaign
};