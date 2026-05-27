const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const { generateHash } = require("../services/hashService");

const createPendingDonationRecord = async ({ donor_name, amount, privacy_type, campaign_id, payment_method }) => {
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

        const id = uuidv4();
        const timestamp = new Date();

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
                campaign_id,
                payment_method,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id,
            donor_name,
            privacy_type,
            display_name,
            amount,
            timestamp,
            "PENDING",
            "PENDING",
            campaign_id,
            payment_method,
            "Pending"
        ]);

        return {
            success: true,
            id
        };
    } catch (error) {
        console.error("Failed to create pending donation record:", error);
        throw error;
    } finally {
        connection.release();
    }
};

const completeDonationRecord = async (id) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Fetch pending record and lock it for update
        const [donations] = await connection.query(`
            SELECT * FROM donations WHERE id = ? FOR UPDATE
        `, [id]);

        if (donations.length === 0) {
            throw new Error("Donation record not found");
        }

        const donation = donations[0];
        if (donation.status === "Completed") {
            await connection.rollback();
            return { success: true, id, current_hash: donation.current_hash };
        }

        // 2. Fetch last completed donation's hash for linking
        const [lastDonation] = await connection.query(`
            SELECT current_hash
            FROM donations
            WHERE status = 'Completed'
            ORDER BY created_at DESC
            LIMIT 1
        `);

        let previous_hash = "GENESIS";
        if (lastDonation.length > 0) {
            previous_hash = lastDonation[0].current_hash;
        }

        // 3. Compute cryptographic hash
        const timestamp = new Date();
        const timestampStr = timestamp.toISOString();
        const current_hash = generateHash(
            donation.amount,
            donation.display_name,
            timestampStr,
            previous_hash
        );

        // 4. Update the donation record
        await connection.query(`
            UPDATE donations
            SET status = 'Completed',
                created_at = ?,
                previous_hash = ?,
                current_hash = ?
            WHERE id = ?
        `, [timestamp, previous_hash, current_hash, id]);

        // 5. Increment campaign statistics
        await connection.query(`
            UPDATE campaigns
            SET raised_amount = raised_amount + ?,
                donor_count = donor_count + 1
            WHERE id = ?
        `, [donation.amount, donation.campaign_id]);

        await connection.commit();

        return {
            success: true,
            id,
            current_hash
        };
    } catch (error) {
        await connection.rollback();
        console.error("Failed to complete donation record:", error);
        throw error;
    } finally {
        connection.release();
    }
};

const failDonationRecord = async (id) => {
    const connection = await pool.getConnection();
    try {
        await connection.query(`
            UPDATE donations
            SET status = 'Failed'
            WHERE id = ? AND status = 'Pending'
        `, [id]);
        return { success: true };
    } catch (error) {
        console.error("Failed to update status to Failed:", error);
        throw error;
    } finally {
        connection.release();
    }
};

const cancelDonationRecord = async (id) => {
    const connection = await pool.getConnection();
    try {
        await connection.query(`
            UPDATE donations
            SET status = 'Cancelled'
            WHERE id = ? AND status = 'Pending'
        `, [id]);
        return { success: true };
    } catch (error) {
        console.error("Failed to update status to Cancelled:", error);
        throw error;
    } finally {
        connection.release();
    }
};

const createDonationRecord = async ({ donor_name, amount, privacy_type, campaign_id, payment_method = "Direct", status = "Completed" }) => {
    const pending = await createPendingDonationRecord({ donor_name, amount, privacy_type, campaign_id, payment_method });
    if (status === "Completed") {
        return await completeDonationRecord(pending.id);
    } else if (status === "Failed") {
        await failDonationRecord(pending.id);
    } else if (status === "Cancelled") {
        await cancelDonationRecord(pending.id);
    }
    return { success: true, id: pending.id };
};

const createDonation = async (req, res) => {
    try {
        const {
            donor_name,
            amount,
            privacy_type,
            campaign_id,
            payment_method
        } = req.body;

        if (!amount || !privacy_type || !campaign_id) {
            return res.status(400).json({
                message: "Amount, privacy_type, and campaign_id are required"
            });
        }

        const pending = await createPendingDonationRecord({
            donor_name,
            amount: parseFloat(amount),
            privacy_type,
            campaign_id,
            payment_method: payment_method || "Direct"
        });

        const donation = await completeDonationRecord(pending.id);

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
                d.payment_method,
                d.status,
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
    createPendingDonationRecord,
    completeDonationRecord,
    failDonationRecord,
    cancelDonationRecord,
    getAllTransactions
};