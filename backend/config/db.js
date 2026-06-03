const sql = require("mssql");
require("dotenv").config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt: true, // Required for Azure SQL
        trustServerCertificate: process.env.DB_TRUST_CERT === "true" // true for local dev only
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// Lazily resolved pool – awaited on first query
const poolPromise = sql.connect(config).then(pool => {
    console.log("Connected to Azure SQL Database successfully!");
    return pool;
}).catch(err => {
    console.error("Database connection failed:", err);
    process.exit(1);
});

/**
 * Convert MySQL-style ? placeholders to MSSQL @p0, @p1, ... parameters
 */
function convertPlaceholders(sqlStr) {
    let i = 0;
    return sqlStr.replace(/\?/g, () => `@p${i++}`);
}

/**
 * Detect whether a SQL string is a read (SELECT) query
 */
function isReadQuery(sqlStr) {
    return /^\s*(SELECT|WITH)\b/i.test(sqlStr);
}

/**
 * Execute a SQL query.
 * Returns results in mysql2-compatible format:
 *   SELECT → [rows, undefined]
 *   INSERT/UPDATE/DELETE → [{ affectedRows, insertId }, undefined]
 */
async function query(sqlStr, params = []) {
    const pool = await poolPromise;
    const request = pool.request();
    const converted = convertPlaceholders(sqlStr);

    params.forEach((val, i) => {
        request.input(`p${i}`, val);
    });

    const result = await request.query(converted);

    if (isReadQuery(sqlStr)) {
        return [result.recordset || [], undefined];
    }

    return [{
        affectedRows: result.rowsAffected ? result.rowsAffected[0] : 0,
        insertId: (result.recordset && result.recordset.length > 0)
            ? result.recordset[0].id
            : null
    }, undefined];
}

/**
 * Get a connection-like object that supports transactions.
 * Mimics mysql2's pool.getConnection() API so controllers don't need
 * to change their transaction patterns.
 */
async function getConnection() {
    const pool = await poolPromise;
    let transaction = null;

    const conn = {
        query: async (sqlStr, params = []) => {
            let request;
            if (transaction) {
                request = new sql.Request(transaction);
            } else {
                request = pool.request();
            }

            const converted = convertPlaceholders(sqlStr);
            params.forEach((val, i) => {
                request.input(`p${i}`, val);
            });

            const result = await request.query(converted);

            if (isReadQuery(sqlStr)) {
                return [result.recordset || [], undefined];
            }
            return [{
                affectedRows: result.rowsAffected ? result.rowsAffected[0] : 0,
                insertId: (result.recordset && result.recordset.length > 0)
                    ? result.recordset[0].id
                    : null
            }, undefined];
        },
        beginTransaction: async () => {
            transaction = new sql.Transaction(pool);
            await transaction.begin();
        },
        commit: async () => {
            if (transaction) {
                await transaction.commit();
                transaction = null;
            }
        },
        rollback: async () => {
            if (transaction) {
                try { await transaction.rollback(); } catch (e) { /* already rolled back */ }
                transaction = null;
            }
        },
        release: () => { /* no-op – MSSQL pool handles connection lifecycle */ }
    };

    return conn;
}

/**
 * Run database migrations – check for missing columns and add them.
 * Uses INFORMATION_SCHEMA (ANSI standard) instead of MySQL's SHOW COLUMNS.
 */
const runMigrations = async () => {
    try {
        console.log("Checking database schema...");
        const [columns] = await query(
            "SELECT COLUMN_NAME AS Field FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users'"
        );
        const columnNames = columns.map(c => c.Field);

        if (!columnNames.includes("phone")) {
            console.log("Adding phone column to users...");
            await query("ALTER TABLE users ADD phone NVARCHAR(20) NULL");
            await query("ALTER TABLE users ADD CONSTRAINT unique_phone UNIQUE (phone)");
        }
        if (!columnNames.includes("nid")) {
            console.log("Adding nid column to users...");
            await query("ALTER TABLE users ADD nid NVARCHAR(20) NULL");
            await query("ALTER TABLE users ADD CONSTRAINT unique_nid UNIQUE (nid)");
        }
        if (!columnNames.includes("address")) {
            console.log("Adding address column to users...");
            await query("ALTER TABLE users ADD address NVARCHAR(MAX) NULL");
        }
        if (!columnNames.includes("role")) {
            console.log("Adding role column to users...");
            await query("ALTER TABLE users ADD role NVARCHAR(50) DEFAULT 'user'");
            await query("UPDATE users SET role = 'user' WHERE role IS NULL");
        }

        // Migration for donations table columns
        const [donationColumns] = await query(
            "SELECT COLUMN_NAME AS Field FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'donations'"
        );
        const donationColumnNames = donationColumns.map(c => c.Field);

        if (!donationColumnNames.includes("payment_method")) {
            console.log("Adding payment_method column to donations...");
            await query("ALTER TABLE donations ADD payment_method NVARCHAR(50) DEFAULT 'Direct'");
        }
        if (!donationColumnNames.includes("status")) {
            console.log("Adding status column to donations...");
            await query("ALTER TABLE donations ADD status NVARCHAR(50) DEFAULT 'Completed'");
        }

        // Check and create system_logs table
        const [tables] = await query(
            "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'system_logs'"
        );
        if (tables.length === 0) {
            console.log("Creating system_logs table...");
            await query(`
                CREATE TABLE system_logs (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    action NVARCHAR(255) NOT NULL,
                    details NVARCHAR(MAX) NULL,
                    created_at DATETIME2 DEFAULT GETDATE()
                )
            `);
        }

        console.log("Database migrations checked & completed successfully!");
    } catch (err) {
        console.error("Database migrations error:", err);
    }
};

// Run migrations asynchronously on startup
runMigrations();

module.exports = { query, getConnection };