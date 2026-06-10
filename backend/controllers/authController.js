const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { logAction } = require("./adminController");
const crypto = require("crypto");
const { sendResetEmail } = require("../services/emailService");

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
                email: email,
                role: "user"
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
                address,
                role: "user",
                created_at: new Date().toISOString()
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
                email: user.email,
                role: user.role
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
                address: user.address,
                role: user.role,
                created_at: user.created_at
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
            SELECT id, full_name, email, phone, nid, address, created_at, role
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

const forgotPassword = async (req, res) => {
    try {
        let { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required."
            });
        }

        email = email.trim().toLowerCase();

        // 1. Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid email address."
            });
        }

        // 2. Query user by email
        const [users] = await pool.query("SELECT id, full_name FROM users WHERE email = ?", [email]);

        // Prevent User Enumeration: if user doesn't exist, still return generic success response
        if (users.length === 0) {
            return res.status(200).json({
                success: true,
                message: "If that email is registered, we have sent a reset link to it."
            });
        }

        const user = users[0];

        // 3. Generate secure random token
        const token = crypto.randomBytes(32).toString("hex");

        // 4. Hash the token for DB storage
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

        // 5. Expiration time: 15 minutes
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // 6. Save token to DB
        await pool.query(`
            INSERT INTO password_resets (user_id, token_hash, expires_at, used)
            VALUES (?, ?, ?, 0)
        `, [user.id, tokenHash, expiresAt]);

        // 7. Send email
        const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${token}`;
        await sendResetEmail(email, resetLink);

        res.status(200).json({
            success: true,
            message: "If that email is registered, we have sent a reset link to it."
        });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

const verifyResetToken = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({
                message: "Token is required."
            });
        }

        // 1. Hash the token
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

        // 2. Query password_resets table
        const [resets] = await pool.query(`
            SELECT id, user_id FROM password_resets
            WHERE token_hash = ? AND used = 0 AND expires_at > GETDATE()
        `, [tokenHash]);

        if (resets.length === 0) {
            return res.status(400).json({
                message: "Invalid or expired password reset token."
            });
        }

        res.status(200).json({
            success: true,
            message: "Token is valid."
        });

    } catch (error) {
        console.error("Verify Reset Token Error:", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                message: "Token and password are required."
            });
        }

        // 1. Validate password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
            });
        }

        // 2. Hash the token
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

        // 3. Query the token record
        const [resets] = await pool.query(`
            SELECT id, user_id FROM password_resets
            WHERE token_hash = ? AND used = 0 AND expires_at > GETDATE()
        `, [tokenHash]);

        if (resets.length === 0) {
            return res.status(400).json({
                message: "Invalid or expired password reset token."
            });
        }

        const resetRecord = resets[0];
        const userId = resetRecord.user_id;

        // 4. Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Update user password and invalidate tokens in transaction
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // Update user password
            await conn.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, userId]);

            // Mark all tokens for this user as used
            await conn.query("UPDATE password_resets SET used = 1 WHERE user_id = ?", [userId]);

            await conn.commit();
        } catch (txError) {
            await conn.rollback();
            throw txError;
        } finally {
            conn.release();
        }

        // 6. Log security action
        await logAction("Password Reset", `Password reset successfully for user ID ${userId}.`);

        res.status(200).json({
            success: true,
            message: "Your password has been successfully reset. You can now log in."
        });

    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    forgotPassword,
    verifyResetToken,
    resetPassword
};