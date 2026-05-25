const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const { generateHash } = require("../services/hashService");

const createDonationRecord = async ({ donor_name, amount, privacy_type, campaign_id }) => {
    const connection = await pool.getConnection();

    try {
        const [campaign] = await connection.query(
            `SELECT * FROM campaigns WHERE id = ?`,
            [campaign_id]
        );

        if (campaign.length === 0) {
            throw new Error("Campaign not found");
        }

        let display_name = donor_name || "Anonymous";

        if (privacy_type === "anonymous") {
            display_name = "Anonymous";
        }

        if (privacy_type === "pseudonym") {
            display_name = "Donor-" + Math.floor(Math.random() * 9999);
        }

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

        const id = uuidv4();
        const timestamp = new Date();
        const timestampStr = timestamp.toISOString();
        const current_hash = generateHash(
            amount,
            display_name,
            timestampStr,
            previous_hash
        );

        await connection.beginTransaction();

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

        await connection.query(`
            UPDATE campaigns
            SET raised_amount = raised_amount + ?,
                donor_count = donor_count + 1
            WHERE id = ?
        `, [
            amount,
            campaign_id
        ]);

        await connection.commit();

        return {
            success: true,
            id,
            current_hash
        };
    } catch (error) {
        await connection.rollback();
        console.error("Donation database transaction failed:", error);
        throw error;
    } finally {
        connection.release();
    }
};

const createDonation = async (req, res) => {
    try {
        const {
            donor_name,
            amount,
            privacy_type,
            campaign_id
        } = req.body;

        if (!amount || !privacy_type || !campaign_id) {
            return res.status(400).json({
                message: "Amount, privacy_type, and campaign_id are required"
            });
        }

        const donation = await createDonationRecord({
            donor_name,
            amount,
            privacy_type,
            campaign_id
        });

        return res.status(201).json({
            success: true,
            message: "Donation successful",
            donation_url: `/donation/${donation.id}`,
            current_hash: donation.current_hash
        });
    } catch (error) {
        console.error(error);

        if (error.message === "Campaign not found") {
            return res.status(404).json({
                message: "Campaign not found"
            });
        }

        return res.status(500).json({
            message: "Server Error"
        });
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
    createDonationRecord,
    getAllTransactions
};