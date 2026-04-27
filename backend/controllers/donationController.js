const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const { generateHash } = require("../services/hashService");

/*
-----------------------------------
CREATE DONATION
-----------------------------------
*/
const createDonation = async (req, res) => {
    try {
        const {
            donor_name,
            amount,
            privacy_type
        } = req.body;

        if (!amount || !privacy_type) {
            return res.status(400).json({
                message: "Amount and privacy type required"
            });
        }

        let display_name = donor_name || "Anonymous";

        if (privacy_type === "anonymous") {
            display_name = "Anonymous";
        }

        if (privacy_type === "pseudonym") {
            display_name = "Donor-" + Math.floor(Math.random() * 9999);
        }

        const [lastDonation] = await pool.query(`
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

        const current_hash = generateHash(
            amount,
            display_name,
            timestamp,
            previous_hash
        );

        await pool.query(`
            INSERT INTO donations (
                id,
                donor_name,
                privacy_type,
                display_name,
                amount,
                created_at,
                previous_hash,
                current_hash
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id,
            donor_name,
            privacy_type,
            display_name,
            amount,
            timestamp,
            previous_hash,
            current_hash
        ]);

        return res.status(201).json({
            success: true,
            message: "Donation successful",
            donation_url: `/donation/${id}`,
            current_hash
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server Error"
        });
    }
};

/*
-----------------------------------
GET ALL TRANSACTIONS
-----------------------------------
*/
const getAllTransactions = async (req, res) => {
    try {
        const [transactions] = await pool.query(`
            SELECT
                id,
                display_name,
                privacy_type,
                amount,
                created_at,
                previous_hash,
                current_hash
            FROM donations
            ORDER BY created_at DESC
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