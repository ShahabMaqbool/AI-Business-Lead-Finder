
const express = require("express");

const {
    generateColdEmail
} = require("../services/geminiService");

const router = express.Router();


router.post("/generate", async (req, res) => {

    try {

        const lead = req.body;

        if (!lead.company_name) {

            return res.status(400).json({
                success: false,
                message: "Company name is required"
            });

        }


        console.log(
            `✉️ Generating cold email for ${lead.company_name}`
        );


        const email = await generateColdEmail(lead);


        res.json({

            success: true,

            email

        });


    } catch (error) {

        console.error(
            "Cold email error:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Failed to generate cold email",

            error: error.message

        });

    }

});


module.exports = router;