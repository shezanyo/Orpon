const pool = require("../config/db");
const { generateHash } = require("../services/hashService");
const blockchainService = require("../services/blockchainService");

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
        console.log("[verifyIntegrity] Starting integrity verification...");
        
        const [donations] = await pool.query(`
            SELECT id, display_name, amount, created_at, previous_hash, current_hash
            FROM donations
            WHERE status = 'Completed'
            ORDER BY created_at ASC
        `);

        console.log(`[verifyIntegrity] Found ${donations.length} completed donations to verify`);

        let valid = true;
        let lastHash = "GENESIS";
        let mismatchDetails = null;
        let verificationLog = [];

        for (let i = 0; i < donations.length; i++) {
            const donation = donations[i];
            const timestampStr = new Date(donation.created_at).toISOString();
            
            console.log(`[verifyIntegrity] Block ${i + 1}: Donation ID ${donation.id}, Amount: ${donation.amount}, Donor: ${donation.display_name}`);
            
            // Validate required fields
            if (!donation.display_name || donation.amount === null || donation.amount === undefined) {
                console.error(`[verifyIntegrity] VALIDATION ERROR: Missing required fields for donation ${donation.id}`);
                valid = false;
                mismatchDetails = `Missing required fields in donation ID: ${donation.id}`;
                break;
            }
            
            // Recalculate hash chain
            try {
                const calculatedHash = generateHash(
                    donation.amount,
                    donation.display_name,
                    timestampStr,
                    donation.previous_hash
                );
                console.log(`[verifyIntegrity] Block ${i + 1}: Calculated hash = ${calculatedHash.substring(0, 16)}...`);
                console.log(`[verifyIntegrity] Block ${i + 1}: Stored hash = ${donation.current_hash ? donation.current_hash.substring(0, 16) : 'NULL'}...`);

                // Check previous hash matches the previous donation block's current hash
                if (donation.previous_hash !== lastHash) {
                    console.error(`[verifyIntegrity] CHAIN LINK BROKEN at Block ${i + 1}: Expected previous_hash = ${lastHash.substring(0, 16)}..., Got ${donation.previous_hash ? donation.previous_hash.substring(0, 16) : 'NULL'}...`);
                    valid = false;
                    mismatchDetails = `Chain link broken at donation ID: ${donation.id}. Previous hash: ${donation.previous_hash}, Expected last hash: ${lastHash}`;
                    break;
                }

                // Check current hash matches calculated current hash
                if (donation.current_hash !== calculatedHash) {
                    console.error(`[verifyIntegrity] HASH MISMATCH at Block ${i + 1}: Stored = ${donation.current_hash}, Calculated = ${calculatedHash}`);
                    valid = false;
                    mismatchDetails = `Hash mismatch at donation ID: ${donation.id}. Current hash: ${donation.current_hash}, Recalculated: ${calculatedHash}`;
                    break;
                }

                console.log(`[verifyIntegrity] Block ${i + 1}: ✓ Hash verified successfully`);
                verificationLog.push(`Block ${i + 1}: VERIFIED`);
            } catch (hashError) {
                console.error(`[verifyIntegrity] HASH CALCULATION ERROR for block ${i + 1}:`, hashError);
                valid = false;
                mismatchDetails = `Hash calculation failed for donation ID: ${donation.id}. Error: ${hashError.message}`;
                break;
            }

            lastHash = donation.current_hash;
        }

        let status = valid ? "VALID" : "INVALID";

        // Blockchain Verification
        let blockchainStatus = "NOT_ANCHORED";
        let blockchainMessage = "No blockchain anchors found.";

        if (valid) {
            try {
                // Fetch latest local anchor
                const [lastAnchor] = await pool.query(`
                    SELECT TOP 1 * FROM blockchain_anchors ORDER BY batch_id DESC
                `);

                if (lastAnchor.length > 0) {
                    const localFinalHash = lastAnchor[0].final_hash;
                    const batchId = lastAnchor[0].batch_id;

                    // Verify against blockchain
                    const anchoredData = await blockchainService.getAnchoredHash(batchId);
                    
                    if (!anchoredData) {
                        blockchainStatus = "UNVERIFIABLE";
                        blockchainMessage = \`Could not fetch data from Polygon for batch \${batchId}. Network may be down.\`;
                    } else if (anchoredData.finalHash !== localFinalHash) {
                        valid = false;
                        status = "INVALID";
                        blockchainStatus = "TAMPERED";
                        blockchainMessage = \`CRITICAL ALERT: Blockchain hash mismatch! Local: \${localFinalHash}, Polygon: \${anchoredData.finalHash}\`;
                        mismatchDetails = (mismatchDetails ? mismatchDetails + " | " : "") + blockchainMessage;
                        console.error("[verifyIntegrity] " + blockchainMessage);
                    } else {
                        blockchainStatus = "VERIFIED";
                        blockchainMessage = \`Blockchain anchor for batch \${batchId} matches local hash perfectly.\`;
                    }
                }
            } catch (err) {
                console.error("[verifyIntegrity] Failed to check blockchain:", err);
                blockchainStatus = "ERROR";
                blockchainMessage = "Error connecting to Polygon for verification.";
            }
        }

        const message = valid 
            ? \`Ledger integrity verified successfully. Total blocks verified: \${donations.length}. \${blockchainMessage}\`
            : \`Integrity verification failed. \${mismatchDetails}\`;
        
        console.log(\`[verifyIntegrity] FINAL RESULT: \${status}. \${message}\`);
        
        await logAction(
            "Integrity check run",
            \`Result: \${status}. Total blocks verified: \${donations.length}.\${mismatchDetails ? " Error: " + mismatchDetails : ""}\`
        );

        res.status(200).json({
            success: true,
            valid: status === "VALID",
            status,
            message,
            blocksVerified: donations.length,
            blockchain: {
                status: blockchainStatus,
                message: blockchainMessage
            }
        });
    } catch (error) {
        console.error("[verifyIntegrity] CRITICAL ERROR:", error);
        console.error("[verifyIntegrity] Error stack:", error.stack);
        
        const errorMessage = error.message || "Database query failed";
        res.status(200).json({
            success: false,
            valid: false,
            status: "ERROR",
            message: `Integrity verification failed: ${errorMessage}`,
            blocksVerified: 0
        });
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
