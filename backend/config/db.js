const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const runMigrations = async () => {
    try {
        console.log("Checking database schema...");
        const [columns] = await pool.query("SHOW COLUMNS FROM users");
        const columnNames = columns.map(c => c.Field);

        if (!columnNames.includes("phone")) {
            console.log("Adding phone column to users...");
            await pool.query("ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL");
            await pool.query("ALTER TABLE users ADD UNIQUE KEY unique_phone (phone)");
        }
        if (!columnNames.includes("nid")) {
            console.log("Adding nid column to users...");
            await pool.query("ALTER TABLE users ADD COLUMN nid VARCHAR(20) NULL");
            await pool.query("ALTER TABLE users ADD UNIQUE KEY unique_nid (nid)");
        }
        if (!columnNames.includes("address")) {
            console.log("Adding address column to users...");
            await pool.query("ALTER TABLE users ADD COLUMN address TEXT NULL");
        }

        // Migration for donations table columns
        const [donationColumns] = await pool.query("SHOW COLUMNS FROM donations");
        const donationColumnNames = donationColumns.map(c => c.Field);

        if (!donationColumnNames.includes("payment_method")) {
            console.log("Adding payment_method column to donations...");
            await pool.query("ALTER TABLE donations ADD COLUMN payment_method VARCHAR(50) DEFAULT 'Direct'");
        }
        if (!donationColumnNames.includes("status")) {
            console.log("Adding status column to donations...");
            await pool.query("ALTER TABLE donations ADD COLUMN status VARCHAR(50) DEFAULT 'Completed'");
        }

        console.log("Database migrations checked & completed successfully!");
    } catch (err) {
        console.error("Database migrations error:", err);
    }
};

// Run migrations asynchronously
runMigrations();

module.exports = pool;