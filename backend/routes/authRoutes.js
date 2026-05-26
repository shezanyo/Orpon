const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    getMe
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const authRateLimiter = require("../middleware/rateLimiter");

router.post("/register", authRateLimiter, registerUser);
router.post("/login", authRateLimiter, loginUser);
router.get("/me", authMiddleware, getMe);

module.exports = router;