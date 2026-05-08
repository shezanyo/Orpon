const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const createCampaign = async (req, res) => {
    try {
        const {
            title,
            description,
            target_amount
        } = req.body;

        const user_id = req.user.id;
        const id = uuidv4();

        await pool.query(`
            INSERT INTO campaigns (
                id,
                user_id,
                title,
                description,
                target_amount
            )
            VALUES (?, ?, ?, ?, ?)
        `, [
            id,
            user_id,
            title,
            description,
            target_amount
        ]);

        res.status(201).json({
            success: true,
            campaign_url: `/campaign/${id}`
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

module.exports = {
    createCampaign
};