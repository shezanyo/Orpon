const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
    try {
        const { full_name, email, password } = req.body;

        if (!full_name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(`
            INSERT INTO users (
                full_name,
                email,
                password
            )
            VALUES (?, ?, ?)
        `, [
            full_name,
            email,
            hashedPassword
        ]);

        res.status(201).json({
            success: true,
            message: "User registered successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await pool.query(`
            SELECT * FROM users
            WHERE email = ?
        `, [email]);

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.status(200).json({
            success: true,
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

module.exports = {
    registerUser,
    loginUser
};