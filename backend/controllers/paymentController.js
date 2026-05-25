const { v4: uuidv4 } = require("uuid");
const { createDonationRecord } = require("./donationController");

// In-memory map to store pending transaction metadata across callbacks
const pendingPayments = new Map();

// ==========================================
// 1. BKASH SANDBOX INTEGRATION
// ==========================================

/**
 * Initiate bKash Tokenized Checkout Sandbox Payment
 */
const initiateBkash = async (req, res) => {
    try {
        const { amount, campaign_id, donor_name, privacy_type } = req.body;

        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            return res.status(400).json({ message: "Invalid donation amount" });
        }
        if (!campaign_id) {
            return res.status(400).json({ message: "Campaign ID is required" });
        }

        // A. Obtain bKash Auth Token
        const tokenResponse = await fetch(`${process.env.BKASH_BASE_URL}/tokenized/checkout/token/grant`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "username": process.env.BKASH_USERNAME,
                "password": process.env.BKASH_PASSWORD
            },
            body: JSON.stringify({
                app_key: process.env.BKASH_APP_KEY,
                app_secret: process.env.BKASH_APP_SECRET
            })
        });

        const tokenData = await tokenResponse.json();
        if (!tokenResponse.ok || !tokenData.id_token) {
            console.error("bKash token grant failure:", tokenData);
            return res.status(502).json({ message: "Failed to authenticate with bKash Sandbox" });
        }

        const idToken = tokenData.id_token;

        // B. Create bKash Payment
        const createPaymentResponse = await fetch(`${process.env.BKASH_BASE_URL}/tokenized/checkout/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": idToken,
                "X-APP-Key": process.env.BKASH_APP_KEY
            },
            body: JSON.stringify({
                mode: "0011",
                payerReference: "01700000000",
                callbackURL: `${process.env.BACKEND_URL}/api/payment/bkash/callback`,
                amount: parseFloat(amount).toFixed(2),
                currency: "BDT",
                intent: "sale",
                merchantInvoiceNumber: `ORN-${Date.now()}`
            })
        });

        const paymentData = await createPaymentResponse.json();
        if (!createPaymentResponse.ok || !paymentData.paymentID) {
            console.error("bKash payment creation failure:", paymentData);
            return res.status(502).json({ message: "Failed to create payment session with bKash" });
        }

        // C. Store metadata against the paymentID for retrieval on success callback
        pendingPayments.set(paymentData.paymentID, {
            amount: parseFloat(amount),
            campaign_id,
            donor_name,
            privacy_type: privacy_type || "public",
            idToken // Preserve token for payment execute step
        });

        // D. Return the redirection URL to the client
        return res.status(200).json({
            success: true,
            redirectUrl: paymentData.bkashURL
        });
    } catch (error) {
        console.error("bKash initiate exception:", error);
        return res.status(500).json({ message: "Internal server error initiating bKash payment" });
    }
};

/**
 * Handle bKash Sandbox callback redirect from checkout
 */
const bkashCallback = async (req, res) => {
    try {
        const { paymentID, status } = req.query;

        if (!paymentID) {
            return res.redirect(`${process.env.FRONTEND_URL}/payment/fail?message=No+payment+session+found`);
        }

        const pending = pendingPayments.get(paymentID);
        if (!pending) {
            return res.redirect(`${process.env.FRONTEND_URL}/payment/fail?message=Transaction+not+found+or+expired`);
        }

        // Clean up session immediately to avoid double execution
        pendingPayments.delete(paymentID);

        if (status === "cancel") {
            return res.redirect(`${process.env.FRONTEND_URL}/payment/cancel`);
        }

        if (status !== "success") {
            return res.redirect(`${process.env.FRONTEND_URL}/payment/fail?message=Payment+cancelled+or+failed`);
        }

        // A. Execute Payment on bKash Sandbox
        const executeResponse = await fetch(`${process.env.BKASH_BASE_URL}/tokenized/checkout/execute`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": pending.idToken,
                "X-APP-Key": process.env.BKASH_APP_KEY
            },
            body: JSON.stringify({ paymentID })
        });

        const executeData = await executeResponse.json();

        if (!executeResponse.ok || executeData.transactionStatus !== "Completed") {
            console.error("bKash payment execution failure:", executeData);
            return res.redirect(`${process.env.FRONTEND_URL}/payment/fail?message=Failed+to+execute+bKash+payment`);
        }

        // B. Payment executed successfully. Persist the donation in the database.
        const donation = await createDonationRecord({
            donor_name: pending.donor_name,
            amount: pending.amount,
            privacy_type: pending.privacy_type,
            campaign_id: pending.campaign_id
        });

        // C. Redirect user to the frontend success page
        return res.redirect(`${process.env.FRONTEND_URL}/payment/success?donationId=${donation.id}&amount=${pending.amount}`);
    } catch (error) {
        console.error("bKash callback exception:", error);
        return res.redirect(`${process.env.FRONTEND_URL}/payment/fail?message=System+error+verifying+bKash+payment`);
    }
};

// ==========================================
// 2. SSLCOMMERZ CARD SANDBOX INTEGRATION
// ==========================================

/**
 * Initiate SSLCommerz Card Sandbox Session
 */
const initiateCard = async (req, res) => {
    try {
        const { amount, campaign_id, donor_name, privacy_type } = req.body;

        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            return res.status(400).json({ message: "Invalid donation amount" });
        }
        if (!campaign_id) {
            return res.status(400).json({ message: "Campaign ID is required" });
        }

        const transactionId = `ORN-${uuidv4()}`;

        // Store metadata in memory keyed by transaction ID
        pendingPayments.set(transactionId, {
            amount: parseFloat(amount),
            campaign_id,
            donor_name,
            privacy_type: privacy_type || "public"
        });

        // Set up SSLCommerz payload
        const payload = new URLSearchParams({
            store_id: process.env.SSLCOMMERZ_STORE_ID,
            store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
            total_amount: parseFloat(amount).toFixed(2),
            currency: "BDT",
            tran_id: transactionId,
            success_url: `${process.env.BACKEND_URL}/api/payment/card/success`,
            fail_url: `${process.env.BACKEND_URL}/api/payment/card/fail`,
            cancel_url: `${process.env.BACKEND_URL}/api/payment/card/cancel`,
            cus_name: donor_name || "Anonymous",
            cus_email: "donor@orpon.com.bd",
            cus_add1: "Dhaka",
            cus_city: "Dhaka",
            cus_postcode: "1000",
            cus_country: "Bangladesh",
            cus_phone: "01700000000",
            shipping_method: "NO",
            product_name: "Orpon Donation",
            product_category: "Donation",
            product_profile: "non-physical-goods",
            value_a: campaign_id,
            value_b: donor_name || "",
            value_c: privacy_type || "public"
        });

        // Create SSLCommerz Session
        const sslResponse = await fetch(`${process.env.SSLCOMMERZ_BASE_URL}/gwprocess/v4/api.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: payload.toString()
        });

        const sslData = await sslResponse.json();

        if (!sslResponse.ok || sslData.status !== "SUCCESS" || !sslData.GatewayPageURL) {
            console.error("SSLCommerz creation failure:", sslData);
            return res.status(502).json({ message: "Failed to connect to SSLCommerz Sandbox" });
        }

        return res.status(200).json({
            success: true,
            redirectUrl: sslData.GatewayPageURL
        });
    } catch (error) {
        console.error("SSLCommerz initiate exception:", error);
        return res.status(500).json({ message: "Internal server error initiating Card payment" });
    }
};

/**
 * Handle Card Payment Success Callback (POST)
 */
const cardSuccess = async (req, res) => {
    try {
        const { tran_id, val_id, status } = req.body;

        if (status !== "VALID" && status !== "VALIDATED") {
            return res.redirect(`${process.env.FRONTEND_URL}/payment/fail?message=SSLCommerz+reported+invalid+status`);
        }

        const pending = pendingPayments.get(tran_id);
        if (!pending) {
            return res.redirect(`${process.env.FRONTEND_URL}/payment/fail?message=Transaction+session+expired`);
        }

        pendingPayments.delete(tran_id);

        // A. Validate payment transaction via SSLCommerz Validator API
        const valUrl = `${process.env.SSLCOMMERZ_BASE_URL}/validator/api/valid.php?val_id=${val_id}&store_id=${process.env.SSLCOMMERZ_STORE_ID}&store_passwd=${process.env.SSLCOMMERZ_STORE_PASSWORD}&format=json`;
        const valResponse = await fetch(valUrl);
        const valData = await valResponse.json();

        if (!valResponse.ok || (valData.status !== "VALID" && valData.status !== "VALIDATED")) {
            console.error("SSLCommerz validation failure:", valData);
            return res.redirect(`${process.env.FRONTEND_URL}/payment/fail?message=Payment+verification+failed`);
        }

        // B. Persist donation inside our secure MySQL db & block chain ledger
        const donation = await createDonationRecord({
            donor_name: pending.donor_name,
            amount: pending.amount,
            privacy_type: pending.privacy_type,
            campaign_id: pending.campaign_id
        });

        return res.redirect(`${process.env.FRONTEND_URL}/payment/success?donationId=${donation.id}&amount=${pending.amount}`);
    } catch (error) {
        console.error("SSLCommerz success callback exception:", error);
        return res.redirect(`${process.env.FRONTEND_URL}/payment/fail?message=System+error+handling+card+callback`);
    }
};

/**
 * Handle Card Payment Fail Callback (POST)
 */
const cardFail = async (req, res) => {
    const { tran_id } = req.body;
    pendingPayments.delete(tran_id);
    return res.redirect(`${process.env.FRONTEND_URL}/payment/fail?message=Card+payment+failed`);
};

/**
 * Handle Card Payment Cancel Callback (POST)
 */
const cardCancel = async (req, res) => {
    const { tran_id } = req.body;
    pendingPayments.delete(tran_id);
    return res.redirect(`${process.env.FRONTEND_URL}/payment/cancel`);
};

// ==========================================
// 3. NAGAD SIMULATED SANDBOX INTEGRATION
// ==========================================

/**
 * Initiate Nagad Sandbox Session (Simulated Endpoint)
 */
const initiateNagad = async (req, res) => {
    try {
        const { amount, campaign_id, donor_name, privacy_type } = req.body;

        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            return res.status(400).json({ message: "Invalid donation amount" });
        }
        if (!campaign_id) {
            return res.status(400).json({ message: "Campaign ID is required" });
        }

        const sessionId = `NGD-${uuidv4()}`;

        // Cache transaction metadata in memory
        pendingPayments.set(sessionId, {
            amount: parseFloat(amount),
            campaign_id,
            donor_name,
            privacy_type: privacy_type || "public"
        });

        // Return URL to frontend simulated Nagad checkout page
        return res.status(200).json({
            success: true,
            redirectUrl: `${process.env.FRONTEND_URL}/donate/nagad-sandbox?sessionId=${sessionId}`
        });
    } catch (error) {
        console.error("Nagad initiate exception:", error);
        return res.status(500).json({ message: "Internal server error initiating Nagad payment" });
    }
};

/**
 * Complete Nagad payment verification callback
 */
const verifyNagadPayment = async (req, res) => {
    try {
        const { sessionId, otp, pin } = req.body;

        if (!sessionId) {
            return res.status(400).json({ message: "Session ID is required" });
        }

        const pending = pendingPayments.get(sessionId);
        if (!pending) {
            return res.status(400).json({ message: "Payment session has expired or is invalid" });
        }

        // Validate Sandbox OTP and PIN
        if (otp !== "123456") {
            return res.status(400).json({ message: "Invalid OTP. Use sandbox OTP: 123456" });
        }
        if (pin !== "12121") {
            return res.status(400).json({ message: "Invalid PIN. Use sandbox PIN: 12121" });
        }

        // Delete pending payment to prevent replay attacks
        pendingPayments.delete(sessionId);

        // Complete database insertion and ledger update
        const donation = await createDonationRecord({
            donor_name: pending.donor_name,
            amount: pending.amount,
            privacy_type: pending.privacy_type,
            campaign_id: pending.campaign_id
        });

        return res.status(200).json({
            success: true,
            donationId: donation.id,
            amount: pending.amount,
            message: "Nagad sandbox payment verified successfully"
        });
    } catch (error) {
        console.error("Nagad verification exception:", error);
        return res.status(500).json({ message: "Server error executing Nagad payment validation" });
    }
};

module.exports = {
    initiateBkash,
    bkashCallback,
    initiateCard,
    cardSuccess,
    cardFail,
    cardCancel,
    initiateNagad,
    verifyNagadPayment
};
