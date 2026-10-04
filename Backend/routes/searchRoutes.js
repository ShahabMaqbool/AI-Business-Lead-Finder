const express = require("express");

const { searchBusinesses } = require("../services/geminiService");

const router = express.Router();

router.post("/", async (req, res) => {

    try {

        const { query, location } = req.body;

        if (!query || !location) {

            return res.status(400).json({
                success: false,
                message: "Query and location are required"
            });

        }

        console.log(`🔎 Searching for ${query} in ${location}`);

        const results = await searchBusinesses(
            query,
            location
        );

        res.json({
            success: true,
            query,
            location,
            results
        });

    } catch (error) {

        console.error("Search error:", error);

        res.status(500).json({
            success: false,
            message: "Business search failed",
            error: error.message
        });

    }

});

module.exports = router;