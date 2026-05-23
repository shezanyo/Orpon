const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

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
        const id = uuidv4();
        const campaignCategory = category || DEFAULT_CATEGORY;
        const campaignDescription = description || story;
        const campaignSlug = slug || `${slugify(title)}-${id.slice(0, 8)}`;
        const campaignColor = color || CATEGORY_COLORS[campaignCategory] || DEFAULT_COLOR;
        const campaignEmoji = emoji || CATEGORY_EMOJIS[campaignCategory] || DEFAULT_EMOJI;

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
                emoji
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            organizer_name || "You",
            Boolean(is_verified ?? false) ? 1 : 0,
            campaignColor,
            campaignEmoji
        ]);

        res.status(201).json({
            success: true,
            campaign: {
                id,
                slug: campaignSlug,
                title,
                organizer: organizer_name || "You",
                orgVerified: Boolean(is_verified ?? false),
                category: campaignCategory,
                description: campaignDescription,
                story,
                raised: 0,
                goal: Number(target_amount),
                donors: 0,
                daysLeft: Number(days_left || 30),
                color: campaignColor,
                emoji: campaignEmoji
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
                emoji
            FROM campaigns
        `);

        const mappedCampaigns = campaigns.map((campaign) => ({
            id: campaign.id,
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
            emoji: campaign.emoji || CATEGORY_EMOJIS[campaign.category] || DEFAULT_EMOJI
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

module.exports = {
    createCampaign,
    getCampaigns
};