const pool = require("../config/db");

module.exports = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const [users] = await pool.query(
            "SELECT role FROM users WHERE id = ?",
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = users[0];
        if (user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin role required." });
        }

        next();
    } catch (error) {
        console.error("Admin authorization error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
