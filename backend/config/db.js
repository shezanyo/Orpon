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
        const startTime = Date.now();

        // Single consolidated query to fetch existing columns for all relevant tables
        const [allColumns] = await query(`
            SELECT TABLE_NAME AS tableName, COLUMN_NAME AS columnName 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME IN ('users', 'donations', 'comments', 'blockchain_anchors', 'system_logs', 'campaigns', 'password_resets')
        `);

        // Group columns by table name
        const schemaMap = {};
        allColumns.forEach(row => {
            const tableName = row.tableName.toLowerCase();
            const columnName = row.columnName.toLowerCase();
            if (!schemaMap[tableName]) {
                schemaMap[tableName] = [];
            }
            schemaMap[tableName].push(columnName);
        });

        // 1. Migration for users table
        const userColumnNames = schemaMap['users'] || [];
        if (!userColumnNames.includes("phone")) {
            console.log("Adding phone column to users...");
            await query("ALTER TABLE users ADD phone NVARCHAR(20) NULL");
            await query("ALTER TABLE users ADD CONSTRAINT unique_phone UNIQUE (phone)");
        }
        if (!userColumnNames.includes("nid")) {
            console.log("Adding nid column to users...");
            await query("ALTER TABLE users ADD nid NVARCHAR(20) NULL");
            await query("ALTER TABLE users ADD CONSTRAINT unique_nid UNIQUE (nid)");
        }
        if (!userColumnNames.includes("address")) {
            console.log("Adding address column to users...");
            await query("ALTER TABLE users ADD address NVARCHAR(MAX) NULL");
        }
        if (!userColumnNames.includes("role")) {
            console.log("Adding role column to users...");
            await query("ALTER TABLE users ADD role NVARCHAR(50) DEFAULT 'user'");
            await query("UPDATE users SET role = 'user' WHERE role IS NULL");
        }

        // 2. Migration for donations table
        const donationColumnNames = schemaMap['donations'] || [];
        if (!donationColumnNames.includes("payment_method")) {
            console.log("Adding payment_method column to donations...");
            await query("ALTER TABLE donations ADD payment_method NVARCHAR(50) DEFAULT 'Direct'");
        }
        if (!donationColumnNames.includes("status")) {
            console.log("Adding status column to donations...");
            await query("ALTER TABLE donations ADD status NVARCHAR(50) DEFAULT 'Completed'");
        }

        // 3. Check and create comments table
        if (!schemaMap['comments']) {
            console.log("Creating comments table...");
            await query(`
                CREATE TABLE comments (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    campaign_id NVARCHAR(36) NOT NULL,
                    user_id INT NOT NULL,
                    comment_text NVARCHAR(MAX) NOT NULL,
                    created_at DATETIME2 DEFAULT GETDATE(),
                    FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            `);
        }

        // 4. Check and create blockchain_anchors table
        if (!schemaMap['blockchain_anchors']) {
            console.log("Creating blockchain_anchors table...");
            await query(`
                CREATE TABLE blockchain_anchors (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    batch_id INT NOT NULL,
                    final_hash NVARCHAR(255) NOT NULL,
                    tx_hash NVARCHAR(255) NOT NULL,
                    created_at DATETIME2 DEFAULT GETDATE()
                )
            `);
        }

        // 5. Check and create system_logs table
        if (!schemaMap['system_logs']) {
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

        // 5b. Check and create password_resets table
        if (!schemaMap['password_resets']) {
            console.log("Creating password_resets table...");
            await query(`
                CREATE TABLE password_resets (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    user_id INT NOT NULL,
                    token_hash NVARCHAR(255) NOT NULL,
                    expires_at DATETIME2 NOT NULL,
                    used BIT DEFAULT 0,
                    created_at DATETIME2 DEFAULT GETDATE(),
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            `);
        }

        // 6. Check and alter campaigns table for image columns
        const campaignColumnNames = schemaMap['campaigns'] || [];
        if (!campaignColumnNames.includes("image_url_1")) {
            console.log("Adding image_url_1 column to campaigns...");
            await query("ALTER TABLE campaigns ADD image_url_1 NVARCHAR(MAX) NULL");
        }
        if (!campaignColumnNames.includes("image_url_2")) {
            console.log("Adding image_url_2 column to campaigns...");
            await query("ALTER TABLE campaigns ADD image_url_2 NVARCHAR(MAX) NULL");
        }
        if (!campaignColumnNames.includes("image_url_3")) {
            console.log("Adding image_url_3 column to campaigns...");
            await query("ALTER TABLE campaigns ADD image_url_3 NVARCHAR(MAX) NULL");
        }

        // 7. Create indexes if they don't exist to improve performance
        console.log("Checking database indexes...");
        try {
            await query(`
                IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_donations_status_created' AND object_id = OBJECT_ID('donations'))
                CREATE NONCLUSTERED INDEX IX_donations_status_created ON donations(status, created_at DESC)
            `);
            await query(`
                IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_donations_campaign_id' AND object_id = OBJECT_ID('donations'))
                CREATE NONCLUSTERED INDEX IX_donations_campaign_id ON donations(campaign_id)
            `);
            await query(`
                IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_comments_campaign_id' AND object_id = OBJECT_ID('comments'))
                CREATE NONCLUSTERED INDEX IX_comments_campaign_id ON comments(campaign_id)
            `);
            await query(`
                IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_campaigns_user_id' AND object_id = OBJECT_ID('campaigns'))
                CREATE NONCLUSTERED INDEX IX_campaigns_user_id ON campaigns(user_id)
            `);
            console.log("Database indexes verified/created successfully!");
        } catch (idxErr) {
            console.error("Index creation error (non-fatal):", idxErr);
        }

        const duration = Date.now() - startTime;
        console.log(`Database migrations checked & completed successfully in ${duration}ms!`);
    } catch (err) {
        console.error("Database migrations error:", err);
    }
};

// Run migrations asynchronously on startup
runMigrations();

module.exports = { query, getConnection };