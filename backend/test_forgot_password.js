const pool = require("./config/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { forgotPassword, verifyResetToken, resetPassword } = require("./controllers/authController");

// Mock Express req/res
const makeMockRes = () => {
    const res = {
        statusCode: 200,
        headers: {},
        jsonData: null,
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        json: function(data) {
            this.jsonData = data;
            return this;
        }
    };
    return res;
};

async function runTests() {
    console.log("🏁 Starting Forgot Password implementation checks...\n");

    try {
        // 1. Check if password_resets table exists
        console.log("🔍 [1/6] Checking if password_resets table is created...");
        const [tableCheck] = await pool.query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = 'password_resets'
        `);

        if (tableCheck.length === 0) {
            throw new Error("❌ password_resets table does not exist. Migration failed.");
        }
        console.log("✅ password_resets table exists!\n");

        // 2. Ensure test user exists in the database
        console.log("👤 [2/6] Setting up a clean test user...");
        const testEmail = "test_reset_user@orpon.com.bd";
        
        // Clean up any old test user
        await pool.query("DELETE FROM password_resets WHERE user_id IN (SELECT id FROM users WHERE email = ?)", [testEmail]);
        await pool.query("DELETE FROM users WHERE email = ?", [testEmail]);

        const testPhone = "017" + Math.floor(10000000 + Math.random() * 90000000);
        const testNid = Math.floor(1000000000 + Math.random() * 9000000000).toString();

        const hashedInitialPassword = await bcrypt.hash("InitialPass123!", 10);
        await pool.query(`
            INSERT INTO users (full_name, email, password, phone, nid, address)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            "Test Reset User",
            testEmail,
            hashedInitialPassword,
            testPhone,
            testNid,
            "Orpon Test Suite"
        ]);
        console.log(`✅ Test user created: ${testEmail}\n`);

        // 3. Test Requesting a Password Reset Token
        console.log("🔑 [3/6] Testing forgotPassword controller...");
        const reqForgot = {
            body: { email: testEmail }
        };
        const resForgot = makeMockRes();

        await forgotPassword(reqForgot, resForgot);
        console.log("Forgot Password Response status:", resForgot.statusCode);
        console.log("Forgot Password Response data:", resForgot.jsonData);

        if (resForgot.statusCode !== 200 || !resForgot.jsonData.success) {
            throw new Error("❌ Requesting password reset failed.");
        }
        console.log("✅ Forgot Password request succeeded!\n");

        // 4. Retrieve plain token from simulated email console logger (or directly fetch from DB for testing)
        console.log("💾 [4/6] Verifying token storage in database...");
        const [dbTokens] = await pool.query(`
            SELECT pr.*, u.email 
            FROM password_resets pr
            JOIN users u ON pr.user_id = u.id
            WHERE u.email = ?
        `, [testEmail]);

        if (dbTokens.length === 0) {
            throw new Error("❌ No token saved in the database for the user.");
        }

        const dbToken = dbTokens[0];
        console.log("Found token record in DB:");
        console.log(`- User ID: ${dbToken.user_id}`);
        console.log(`- Token Hash: ${dbToken.token_hash}`);
        console.log(`- Expires At: ${dbToken.expires_at}`);
        console.log(`- Used: ${dbToken.used}`);
        
        if (dbToken.used !== false && dbToken.used !== 0) {
            throw new Error("❌ New token should be marked as unused (used = 0).");
        }
        console.log("✅ Token successfully saved as an unused SHA-256 hash!\n");

        // Since we can't extract the plain token from a hash (best practice security), 
        // we'll run a custom simulation using a known token for verification.
        const customToken = crypto.randomBytes(32).toString("hex");
        const customHash = crypto.createHash("sha256").update(customToken).digest("hex");
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        
        await pool.query(`
            INSERT INTO password_resets (user_id, token_hash, expires_at, used)
            VALUES (?, ?, ?, 0)
        `, [dbToken.user_id, customHash, expiresAt]);

        // 5. Verify the generated token
        console.log("🔗 [5/6] Testing verifyResetToken controller...");
        const reqVerify = {
            query: { token: customToken }
        };
        const resVerify = makeMockRes();

        await verifyResetToken(reqVerify, resVerify);
        console.log("Verify Response status:", resVerify.statusCode);
        console.log("Verify Response data:", resVerify.jsonData);

        if (resVerify.statusCode !== 200 || !resVerify.jsonData.success) {
            throw new Error("❌ Token verification failed.");
        }
        console.log("✅ Token verification succeeded!\n");

        // 6. Test Resetting the Password
        console.log("🔄 [6/6] Testing resetPassword controller...");
        const newPassword = "NewSecurePassword99!";
        const reqReset = {
            body: {
                token: customToken,
                password: newPassword
            }
        };
        const resReset = makeMockRes();

        await resetPassword(reqReset, resReset);
        console.log("Reset Response status:", resReset.statusCode);
        console.log("Reset Response data:", resReset.jsonData);

        if (resReset.statusCode !== 200 || !resReset.jsonData.success) {
            throw new Error("❌ Password reset update failed.");
        }

        // Verify password was updated in users table
        const [updatedUsers] = await pool.query("SELECT password FROM users WHERE email = ?", [testEmail]);
        const updatedUser = updatedUsers[0];
        const isMatch = await bcrypt.compare(newPassword, updatedUser.password);
        if (!isMatch) {
            throw new Error("❌ Password in users table was not updated correctly.");
        }
        console.log("Password updated successfully in the users table!");

        // Verify token was marked as used (re-use protection)
        const [updatedTokens] = await pool.query("SELECT used FROM password_resets WHERE token_hash = ?", [customHash]);
        const tokenUsedState = updatedTokens[0].used;
        if (tokenUsedState !== true && tokenUsedState !== 1) {
            throw new Error("❌ Token was not invalidated/marked as used after successful reset.");
        }
        console.log("Reset token marked as used successfully to prevent reuse!");

        // Clean up test user
        await pool.query("DELETE FROM password_resets WHERE user_id IN (SELECT id FROM users WHERE email = ?)", [testEmail]);
        await pool.query("DELETE FROM users WHERE email = ?", [testEmail]);
        console.log("🧹 Test user cleaned up.");

        console.log("\n🎉 ALL BACKEND CHECKS PASSED SUCCESSFULLY!");
        process.exit(0);

    } catch (err) {
        console.error("\n❌ TEST FAILED:", err.message);
        process.exit(1);
    }
}

// Wait for pool connect and run tests
setTimeout(runTests, 1000);
