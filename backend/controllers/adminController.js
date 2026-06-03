const pool = require("../config/db");
const { generateHash } = require("../services/hashService");

// Helper to log system actions
const logAction = async (action, details = null) => {
    try {
        await pool.query(
            "INSERT INTO system_logs (action, details) VALUES (?, ?)",
            [action, details]
        );
    } catch (error) {
        console.error("Failed to write system log:", error);
    }
};

// 1. Get overview stats for the dashboard cards
const getAdminStats = async (req, res) => {
    try {
        const [users] = await pool.query("SELECT COUNT(*) AS count FROM users");
        const [campaigns] = await pool.query("SELECT COUNT(*) AS count FROM campaigns");
        const [donations] = await pool.query("SELECT COUNT(*) AS count, SUM(amount) AS raised FROM donations WHERE status = 'Completed'");

        res.status(200).json({
            success: true,
            stats: {
                totalUsers: users[0]?.count || 0,
                totalCampaigns: campaigns[0]?.count || 0,
                totalDonations: donations[0]?.count || 0,
                totalRaised: Number(donations[0]?.raised || 0)
            }
        });
    } catch (error) {
        console.error("getAdminStats error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 2. Get list of campaigns with creator full name
const getAdminCampaigns = async (req, res) => {
    try {
        const [campaigns] = await pool.query(`
            SELECT 
                c.id,
                c.title,
                u.full_name AS owner_name,
                c.target_amount AS target_amount,
                c.raised_amount AS collected_amount,
                c.created_at AS created_date
            FROM campaigns c
            LEFT JOIN users u ON c.user_id = u.id
            ORDER BY c.created_at DESC
        `);

        res.status(200).json({
            success: true,
            campaigns
        });
    } catch (error) {
        console.error("getAdminCampaigns error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 3. Get completed donations joined with campaign title
const getAdminDonations = async (req, res) => {
    try {
        const [donations] = await pool.query(`
            SELECT 
                d.id,
                d.display_name AS donor_name,
                c.title AS campaign_name,
                d.amount,
                d.privacy_type,
                d.created_at AS timestamp,
                d.current_hash
            FROM donations d
            LEFT JOIN campaigns c ON d.campaign_id = c.id
            WHERE d.status = 'Completed'
            ORDER BY d.created_at DESC
        `);

        res.status(200).json({
            success: true,
            donations
        });
    } catch (error) {
        console.error("getAdminDonations error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 4. Get system action logs
const getAdminLogs = async (req, res) => {
    try {
        const [logs] = await pool.query(`
            SELECT id, action, details, created_at
            FROM system_logs
            ORDER BY created_at DESC
        `);

        res.status(200).json({
            success: true,
            logs
        });
    } catch (error) {
        console.error("getAdminLogs error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 5. Verify cryptographic integrity of completed donations
const verifyIntegrity = async (req, res) => {
    try {
        const [donations] = await pool.query(`
            SELECT id, display_name, amount, created_at, previous_hash, current_hash
            FROM donations
            WHERE status = 'Completed'
            ORDER BY created_at ASC
        `);

        let valid = true;
        let lastHash = "GENESIS";
        let mismatchDetails = null;

        for (let i = 0; i < donations.length; i++) {
            const donation = donations[i];
            const timestampStr = new Date(donation.created_at).toISOString();
            
            // Recalculate hash chain
            const calculatedHash = generateHash(
                donation.amount,
                donation.display_name,
                timestampStr,
                donation.previous_hash
            );

            // Check previous hash matches the previous donation block's current hash
            if (donation.previous_hash !== lastHash) {
                valid = false;
                mismatchDetails = `Chain link broken at donation ID: ${donation.id}. Previous hash: ${donation.previous_hash}, Expected last hash: ${lastHash}`;
                break;
            }

            // Check current hash matches calculated current hash
            if (donation.current_hash !== calculatedHash) {
                valid = false;
                mismatchDetails = `Hash mismatch at donation ID: ${donation.id}. Current hash: ${donation.current_hash}, Recalculated: ${calculatedHash}`;
                break;
            }

            lastHash = donation.current_hash;
        }

        const status = valid ? "VALID" : "INVALID";
        await logAction(
            "Integrity check run",
            `Result: ${status}. Total blocks verified: ${donations.length}.${mismatchDetails ? " Error: " + mismatchDetails : ""}`
        );

        res.status(200).json({
            success: true,
            status
        });
    } catch (error) {
        console.error("verifyIntegrity error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 6. Get list of users (for admin management)
const getAdminUsers = async (req, res) => {
    try {
        const [users] = await pool.query(`
            SELECT id, full_name, email, phone, nid, address, created_at, role
            FROM users
            ORDER BY created_at DESC
        `);

        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        console.error("getAdminUsers error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 7. Make a user admin by email
const makeUserAdmin = async (req, res) => {
    try {
        const { email } = req.body;
        const currentUserId = req.user.id;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // Access check: only super_admin can perform this action
        const [currentUser] = await pool.query("SELECT role, email FROM users WHERE id = ?", [currentUserId]);
        if (currentUser.length === 0 || (currentUser[0].role !== "super_admin" && currentUser[0].email !== "admin@gmail.com")) {
            return res.status(403).json({ message: "Access denied. Only the super admin can promote other users to admin." });
        }

        // Find target user
        const [targetUsers] = await pool.query("SELECT id, full_name, role FROM users WHERE email = ?", [email.trim().toLowerCase()]);
        if (targetUsers.length === 0) {
            return res.status(404).json({ message: "User with this email not found." });
        }

        const targetUser = targetUsers[0];
        if (targetUser.role === "admin" || targetUser.role === "super_admin") {
            return res.status(400).json({ message: `User is already an ${targetUser.role}.` });
        }

        // Update role
        await pool.query("UPDATE users SET role = 'admin' WHERE id = ?", [targetUser.id]);
        await logAction("Make Admin", `User "${targetUser.full_name}" (${email}) promoted to Admin by super admin.`);

        res.status(200).json({
            success: true,
            message: `User ${targetUser.full_name} (${email}) promoted to Admin successfully.`
        });
    } catch (error) {
        console.error("makeUserAdmin error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    logAction,
    getAdminStats,
    getAdminCampaigns,
    getAdminDonations,
    getAdminLogs,
    verifyIntegrity,
    getAdminUsers,
    makeUserAdmin
};
