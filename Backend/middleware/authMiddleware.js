const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {

    // Check if cookies exist
    if (!req.cookies) {
        return res.status(401).json({
            success: false,
            message: "Cookies not available"
        });
    }

    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {

        console.error("JWT Error:", error.message);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired session"
        });
    }
};

module.exports = protect;