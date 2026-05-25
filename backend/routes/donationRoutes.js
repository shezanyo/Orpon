const express = require("express");
const router = express.Router();

const {
    createDonation,
    getAllTransactions
} = require("../controllers/donationController");

const {
    initiateBkash,
    bkashCallback,
    initiateCard,
    cardSuccess,
    cardFail,
    cardCancel,
    initiateNagad,
    verifyNagadPayment
} = require("../controllers/paymentController");

/*
POST donation
*/
router.post("/donate", createDonation);

/*
GET public ledger
*/
router.get("/transactions", getAllTransactions);

/*
bKash Sandbox routes
*/
router.post("/payment/bkash/initiate", initiateBkash);
router.get("/payment/bkash/callback", bkashCallback);

/*
Card Sandbox (SSLCommerz) routes
*/
router.post("/payment/card/initiate", initiateCard);
router.post("/payment/card/success", cardSuccess);
router.post("/payment/card/fail", cardFail);
router.post("/payment/card/cancel", cardCancel);

/*
Nagad Sandbox routes
*/
router.post("/payment/nagad/initiate", initiateNagad);
router.post("/payment/nagad/callback", verifyNagadPayment);

module.exports = router;