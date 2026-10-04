const express = require("express");

const {
    signup,
    login
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.get("/me", protect, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

router.post("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
    });

    res.json({
        success: true,
        message: "Logged out successfully"
    });
});

module.exports = router;