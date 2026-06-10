const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    getMe,
    forgotPassword,
    verifyResetToken,
    resetPassword
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const authRateLimiter = require("../middleware/rateLimiter");

router.post("/register", authRateLimiter, registerUser);
router.post("/login", authRateLimiter, loginUser);
router.get("/me", authMiddleware, getMe);

// Password Reset Routes
router.post("/forgot-password", authRateLimiter, forgotPassword);
router.get("/reset-password/verify", authRateLimiter, verifyResetToken);
router.post("/reset-password", authRateLimiter, resetPassword);

module.exports = router;