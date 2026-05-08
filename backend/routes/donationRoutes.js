const express = require("express");
const router = express.Router();

const {
    createDonation,
    getAllTransactions
} = require("../controllers/donationController");

/*
POST donation
*/
router.post("/donate", createDonation);

/*
GET public ledger
*/
router.get("/transactions", getAllTransactions);

module.exports = router;