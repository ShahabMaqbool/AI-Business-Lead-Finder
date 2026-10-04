const db = require("../db/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ==============================
// SIGNUP
// ==============================

const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        db.query(
            "SELECT id FROM users WHERE email = ?",
            [email],
            async (err, results) => {

                if (err) {
                    console.error("Signup DB Error:", err);

                    return res.status(500).json({
                        success: false,
                        message: "Database error"
                    });
                }

                if (results.length > 0) {
                    return res.status(409).json({
                        success: false,
                        message: "Email already registered"
                    });
                }

                try {

                    const hashedPassword = await bcrypt.hash(
                        password,
                        12
                    );

                    db.query(
                        `INSERT INTO users
                        (name, email, password)
                        VALUES (?, ?, ?)`,
                        [
                            name,
                            email,
                            hashedPassword
                        ],
                        (err, result) => {

                            if (err) {
                                console.error(
                                    "Insert User Error:",
                                    err
                                );

                                return res.status(500).json({
                                    success: false,
                                    message: "Signup failed"
                                });
                            }

                            return res.status(201).json({
                                success: true,
                                message: "Account created successfully"
                            });
                        }
                    );

                } catch (error) {

                    console.error(
                        "Password Hash Error:",
                        error
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Signup failed"
                    });
                }
            }
        );

    } catch (error) {

        console.error("Signup Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ==============================
// LOGIN
// ==============================

const login = async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        db.query(
            "SELECT * FROM users WHERE email = ?",
            [email],
            async (err, results) => {

                if (err) {

                    console.error(
                        "Login DB Error:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Database error"
                    });
                }

                if (results.length === 0) {

                    return res.status(401).json({
                        success: false,
                        message: "Invalid email or password"
                    });
                }

                const user = results[0];

                try {

                    const passwordMatch =
                        await bcrypt.compare(
                            password,
                            user.password
                        );

                    if (!passwordMatch) {

                        return res.status(401).json({
                            success: false,
                            message: "Invalid email or password"
                        });
                    }

                    const token = jwt.sign(
                        {
                            id: user.id,
                            email: user.email,
                            name: user.name
                        },
                        process.env.JWT_SECRET,
                        {
                            expiresIn: "1d"
                        }
                    );

                    // ==============================
                    // HTTP ONLY COOKIE
                    // ==============================

                    res.cookie(
                        "token",
                        token,
                        {
                            httpOnly: true,
                            secure:
                                process.env.NODE_ENV === "production",
                            sameSite: "lax",
                            maxAge:
                                24 * 60 * 60 * 1000
                        }
                    );

                    return res.json({
                        success: true,
                        message: "Login successful",
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email
                        }
                    });

                } catch (error) {

                    console.error(
                        "Login Authentication Error:",
                        error
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Login failed"
                    });
                }
            }
        );

    } catch (error) {

        console.error(
            "Login Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


module.exports = {
    signup,
    login
};