const pool = require("../config/db");
const blockchainService = require("../services/blockchainService");
const { logAction } = require("./adminController");

/**
 * Triggers a manual anchor of the latest hash if there are pending un-anchored donations.
 */
const manualAnchor = async (req, res) => {
    try {
        // 1. Get the latest anchored batch
        const [lastAnchorData] = await pool.query(`
            SELECT TOP 1 batch_id FROM blockchain_anchors ORDER BY batch_id DESC
        `);
        const nextBatchId = lastAnchorData.length > 0 ? lastAnchorData[0].batch_id + 1 : 1;

        // 2. Count total completed donations
        const [countData] = await pool.query(`
            SELECT COUNT(*) AS total FROM donations WHERE status = 'Completed'
        `);
        const totalDonations = countData[0].total;

        // If no donations exist, nothing to anchor
        if (totalDonations === 0) {
            return res.status(400).json({ message: "No donations to anchor." });
        }

        // Check if we even need to anchor (maybe already anchored up to the latest)
        // Let's assume an anchor happens every 10 donations.
        // If totalDonations <= (nextBatchId - 1) * 10, then we don't necessarily have new ones.
        // But for manual anchor, we might want to force an anchor of the latest hash anyway,
        // so let's just grab the absolute latest hash.

        const [latestDonation] = await pool.query(`
            SELECT TOP 1 current_hash FROM donations WHERE status = 'Completed' ORDER BY created_at DESC
        `);
        
        const finalHash = latestDonation[0].current_hash;

        // 3. Prevent duplicate anchoring of the exact same hash
        const [checkHash] = await pool.query(`
            SELECT TOP 1 id FROM blockchain_anchors WHERE final_hash = ?
        `, [finalHash]);

        if (checkHash.length > 0) {
            return res.status(400).json({ message: "Latest hash is already anchored." });
        }

        // 4. Send to Polygon
        const txHash = await blockchainService.anchorHash(nextBatchId, finalHash);

        if (!txHash) {
            return res.status(500).json({ message: "Blockchain anchoring failed or disabled." });
        }

        // 5. Store anchor locally
        await pool.query(`
            INSERT INTO blockchain_anchors (batch_id, final_hash, tx_hash)
            VALUES (?, ?, ?)
        `, [nextBatchId, finalHash, txHash]);

        await logAction("Manual Blockchain Anchor", `Forced anchor of batch ${nextBatchId}. TX: ${txHash}`);

        return res.status(200).json({
            success: true,
            message: "Successfully anchored to Polygon.",
            batch_id: nextBatchId,
            tx_hash: txHash
        });

    } catch (error) {
        console.error("Manual anchor failed:", error);
        return res.status(500).json({ message: "Server error during manual anchoring." });
    }
};

/**
 * Retrieves the history of all blockchain anchors.
 */
const getAnchorHistory = async (req, res) => {
    try {
        const [anchors] = await pool.query(`
            SELECT * FROM blockchain_anchors ORDER BY batch_id DESC
        `);

        return res.status(200).json({
            success: true,
            total: anchors.length,
            anchors
        });
    } catch (error) {
        console.error("Failed to fetch anchor history:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

/**
 * Fetch the latest blockchain status.
 */
const getBlockchainStatus = async (req, res) => {
    try {
        const [lastAnchor] = await pool.query(`
            SELECT TOP 1 * FROM blockchain_anchors ORDER BY batch_id DESC
        `);

        const [countData] = await pool.query(`
            SELECT COUNT(*) AS total FROM donations WHERE status = 'Completed'
        `);
        const totalDonations = countData[0].total;
        
        const anchoredCount = lastAnchor.length > 0 ? lastAnchor[0].batch_id * 10 : 0;
        const pendingAnchors = Math.max(0, totalDonations - anchoredCount);

        return res.status(200).json({
            success: true,
            last_anchor: lastAnchor.length > 0 ? lastAnchor[0] : null,
            pending_donations: pendingAnchors,
            total_donations: totalDonations
        });
    } catch (error) {
        console.error("Failed to fetch blockchain status:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    manualAnchor,
    getAnchorHistory,
    getBlockchainStatus
};
