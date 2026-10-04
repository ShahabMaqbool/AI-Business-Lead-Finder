require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const leadRoutes = require("./routes/leadRoutes");
const searchRoutes = require("./routes/searchRoutes");
const authRoutes = require("./routes/authRoutes");

require("./db/database");

const app = express();


// ===============================
// MIDDLEWARE
// ===============================

app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true
    })
);

app.use(express.json());

// IMPORTANT: Cookie parser MUST come before routes
app.use(cookieParser());


// ===============================
// TEST ROUTE
// ===============================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "AI Business Lead Finder API is running"
    });
});


// ===============================
// API ROUTES
// ===============================

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/search", searchRoutes);


// ===============================
// 404
// ===============================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});


// ===============================
// SERVER
// ===============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});