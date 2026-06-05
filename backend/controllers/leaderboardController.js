const pool = require("../config/db");

/**
 * GET /api/leaderboard
 * Returns top donors, top campaigns, and top fundraisers.
 * Public endpoint – no auth required.
 */
const getLeaderboard = async (req, res) => {
    try {
        // Top Donors – ranked by total amount donated (completed only)
        const [topDonors] = await pool.query(`
            SELECT TOP 10
                d.display_name,
                d.privacy_type,
                COUNT(d.id)          AS donation_count,
                SUM(d.amount)        AS total_donated,
                MAX(d.created_at)    AS last_donation
            FROM donations d
            WHERE d.status = 'Completed'
              AND d.display_name IS NOT NULL
            GROUP BY d.display_name, d.privacy_type
            ORDER BY total_donated DESC
        `);

        // Top Campaigns – ranked by total raised amount
        const [topCampaigns] = await pool.query(`
            SELECT TOP 10
                c.id,
                c.title,
                c.target_amount,
                c.raised_amount,
                c.donor_count,
                c.created_at,
                CASE
                    WHEN c.target_amount > 0
                    THEN CAST(ROUND((c.raised_amount * 100.0 / c.target_amount), 1) AS FLOAT)
                    ELSE 0
                END AS progress_pct
            FROM campaigns c
            WHERE c.raised_amount > 0
            ORDER BY c.raised_amount DESC
        `);

        // Top Fundraisers – campaign creators ranked by total raised across all their campaigns
        const [topFundraisers] = await pool.query(`
            SELECT TOP 10
                u.full_name,
                COUNT(c.id)           AS campaign_count,
                SUM(c.raised_amount)  AS total_raised,
                SUM(c.donor_count)    AS total_donors
            FROM campaigns c
            JOIN users u ON c.user_id = u.id
            WHERE c.raised_amount > 0
            GROUP BY u.full_name
            ORDER BY total_raised DESC
        `);

        // Platform-wide stats for the hero section
        const [platformStats] = await pool.query(`
            SELECT
                (SELECT COUNT(*)       FROM donations  WHERE status = 'Completed') AS total_donations,
                (SELECT ISNULL(SUM(amount), 0) FROM donations WHERE status = 'Completed') AS total_raised,
                (SELECT COUNT(*)       FROM campaigns) AS total_campaigns,
                (SELECT COUNT(DISTINCT display_name) FROM donations WHERE status = 'Completed') AS unique_donors
        `);

        return res.status(200).json({
            success: true,
            stats: platformStats[0] || {},
            topDonors,
            topCampaigns,
            topFundraisers
        });
    } catch (error) {
        console.error("[Leaderboard] Error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = { getLeaderboard };
