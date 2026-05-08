const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const { generateHash } = require("../services/hashService");

/*
-----------------------------------
CREATE DONATION (UPDATED)
-----------------------------------
*/
const createDonation = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const {
            donor_name,
            amount,
            privacy_type,
            campaign_id
        } = req.body;

        // ✅ VALIDATION
        if (!amount || !privacy_type || !campaign_id) {
            return res.status(400).json({
                message: "Amount, privacy_type, and campaign_id are required"
            });
        }

        // ✅ CHECK CAMPAIGN EXISTS
        const [campaign] = await connection.query(
            `SELECT * FROM campaigns WHERE id = ?`,
            [campaign_id]
        );

        if (campaign.length === 0) {
            return res.status(404).json({
                message: "Campaign not found"
            });
        }

        // ✅ DISPLAY NAME LOGIC
        let display_name = donor_name || "Anonymous";

        if (privacy_type === "anonymous") {
            display_name = "Anonymous";
        }

        if (privacy_type === "pseudonym") {
            display_name = "Donor-" + Math.floor(Math.random() * 9999);
        }

        // ✅ GET LAST HASH
        const [lastDonation] = await connection.query(`
            SELECT current_hash
            FROM donations
            ORDER BY created_at DESC
            LIMIT 1
        `);

        let previous_hash = "GENESIS";

        if (lastDonation.length > 0) {
            previous_hash = lastDonation[0].current_hash;
        }

        // ✅ CREATE NEW HASH
        const id = uuidv4();
        const timestamp = new Date();

        const current_hash = generateHash(
            amount,
            display_name,
            timestamp,
            previous_hash
        );

        // ✅ START TRANSACTION (IMPORTANT)
        await connection.beginTransaction();

        // ✅ INSERT DONATION
        await connection.query(`
            INSERT INTO donations (
                id,
                donor_name,
                privacy_type,
                display_name,
                amount,
                created_at,
                previous_hash,
                current_hash,
                campaign_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id,
            donor_name,
            privacy_type,
            display_name,
            amount,
            timestamp,
            previous_hash,
            current_hash,
            campaign_id
        ]);

        // ✅ UPDATE CAMPAIGN COLLECTED AMOUNT
        await connection.query(`
            UPDATE campaigns
            SET collected_amount = collected_amount + ?
            WHERE id = ?
        `, [
            amount,
            campaign_id
        ]);

        // ✅ COMMIT
        await connection.commit();

        return res.status(201).json({
            success: true,
            message: "Donation successful",
            donation_url: `/donation/${id}`,
            current_hash
        });

    } catch (error) {
        await connection.rollback();
        console.error(error);

        return res.status(500).json({
            message: "Server Error"
        });

    } finally {
        connection.release();
    }
};

/*
-----------------------------------
GET ALL TRANSACTIONS (UPDATED)
-----------------------------------
*/
const getAllTransactions = async (req, res) => {
    try {
        const [transactions] = await pool.query(`
            SELECT
                d.id,
                d.display_name,
                d.privacy_type,
                d.amount,
                d.created_at,
                d.previous_hash,
                d.current_hash,
                d.campaign_id,
                c.title AS campaign_title
            FROM donations d
            LEFT JOIN campaigns c
            ON d.campaign_id = c.id
            ORDER BY d.created_at DESC
        `);

        return res.status(200).json({
            success: true,
            total: transactions.length,
            transactions
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server Error"
        });
    }
};

module.exports = {
    createDonation,
    getAllTransactions
};