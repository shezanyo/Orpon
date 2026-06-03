const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { logAction } = require("./adminController");

const registerUser = async (req, res) => {
    try {
        let { full_name, email, password, phone, nid, address } = req.body;

        // 1. Basic Presence Validation & Sanitization
        if (!full_name || !email || !password || !phone || !nid) {
            return res.status(400).json({
                message: "Full name, email, password, phone, and NID are required."
            });
        }

        full_name = full_name.trim();
        email = email.trim().toLowerCase();
        phone = phone.trim();
        nid = nid.trim();
        address = address ? address.trim() : null;

        if (full_name.length < 3) {
            return res.status(400).json({
                message: "Full name must be at least 3 characters long."
            });
        }

        // 2. Email Format Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid email address."
            });
        }

        // 3. Bangladesh Phone Number Validation
        // Prefix optional: +88 or 88, then 01 followed by 9 digits (total 11 digits mobile)
        const phoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                message: "Please enter a valid Bangladeshi mobile number (e.g. 01XXXXXXXXX)."
            });
        }
        // Normalize phone number to 11-digit format
        const normalizedPhone = phone.match(phoneRegex)[1];

        // 4. Bangladesh NID Number Validation
        // Smart card NID: 10 digits, old NID: 13 or 17 digits
        const nidRegex = /^\d{10}$|^\d{13}$|^\d{17}$/;
        if (!nidRegex.test(nid)) {
            return res.status(400).json({
                message: "Please enter a valid Bangladeshi NID card number (exactly 10, 13, or 17 digits)."
            });
        }

        // 5. Strong Password Validation
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
            });
        }

        // 6. Email, Phone, and NID Uniqueness check (Pre-checking to prevent duplicate accounts)
        const [existingEmail] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
        if (existingEmail.length > 0) {
            return res.status(400).json({
                message: "Email is already registered."
            });
        }

        const [existingPhone] = await pool.query("SELECT id FROM users WHERE phone = ?", [normalizedPhone]);
        if (existingPhone.length > 0) {
            return res.status(400).json({
                message: "Phone number is already registered."
            });
        }

        const [existingNid] = await pool.query("SELECT id FROM users WHERE nid = ?", [nid]);
        if (existingNid.length > 0) {
            return res.status(400).json({
                message: "NID card number is already registered."
            });
        }

        // 7. Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 8. Insert User
        const [result] = await pool.query(`
            INSERT INTO users (
                full_name,
                email,
                password,
                phone,
                nid,
                address
            )
            OUTPUT INSERTED.id
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            full_name,
            email,
            hashedPassword,
            normalizedPhone,
            nid,
            address
        ]);

        const newUserId = result.insertId;

                // 9. Generate Token (Auto-Login)
        const token = jwt.sign(
            {
                id: newUserId,
                email: email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        await logAction("User Registration", `User ${full_name} (${email}) registered successfully.`);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: {
                id: newUserId,
                full_name,
                email,
                phone: normalizedPhone,
                nid,
                address
            }
        });

    } catch (error) {
        console.error("Register Error:", error);
        // Catch duplicate keys in race conditions
        if (error.number === 2627 || error.number === 2601) {
            let msg = "A user with this email, phone, or NID already exists.";
            if (error.message.includes("email")) msg = "Email is already registered.";
            else if (error.message.includes("phone")) msg = "Phone number is already registered.";
            else if (error.message.includes("nid")) msg = "NID card number is already registered.";
            return res.status(400).json({
                message: msg
            });
        }
        res.status(500).json({
            message: "Server Error"
        });
    }
};

const loginUser = async (req, res) => {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        email = email.trim().toLowerCase();

        const [users] = await pool.query(`
            SELECT * FROM users
            WHERE email = ?
        `, [email]);

        // Prevention of username enumeration / info leakage: return generic message
        if (users.length === 0) {
            return res.status(400).json({
                message: "Invalid email or password."
            });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password."
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

        await logAction("User Login", `User ${user.full_name} (${user.email}) logged in.`);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                nid: user.nid,
                address: user.address
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

const getMe = async (req, res) => {
    try {
        const [users] = await pool.query(`
            SELECT id, full_name, email, phone, nid, address, created_at
            FROM users
            WHERE id = ?
        `, [req.user.id]);

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user: users[0]
        });

    } catch (error) {
        console.error("GetMe Error:", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe
};