const db = require("../db/database");


const getLeads = (req, res) => {

    const sql = "SELECT * FROM leads ORDER BY id DESC";

    db.query(sql, (err, results) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        res.json({
            success: true,
            leads: results
        });

    });
};


const createLead = (req, res) => {

    const {
        company_name,
        website,
        email,
        phone,
        location,
        description,
        category,
        ai_summary,
        lead_score
    } = req.body;


    if (!company_name) {

        return res.status(400).json({
            success: false,
            message: "Company name is required"
        });

    }


    const sql = `
        INSERT INTO leads
        (
            company_name,
            website,
            email,
            phone,
            location,
            description,
            category,
            ai_summary,
            lead_score
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;


    db.query(
        sql,
        [
            company_name,
            website || null,
            email || null,
            phone || null,
            location || null,
            description || null,
            category || null,
            ai_summary || null,
            lead_score || 0
        ],
        (err, result) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to save lead"
                });

            }


            res.status(201).json({

                success: true,

                message: "Lead saved successfully",

                lead_id: result.insertId

            });

        }
    );
};


const updateLeadStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
        "New",
        "Contacted",
        "Processing",
        "Converted",
        "Lost"
    ];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid lead status"
        });
    }

    const sql = `
        UPDATE leads
        SET status = ?
        WHERE id = ?
    `;

    db.query(sql, [status, id], (err, result) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Failed to update lead status"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Lead not found"
            });
        }

        return res.json({
            success: true,
            message: "Lead status updated successfully",
            status
        });
    });
};


module.exports = {
    getLeads,
    createLead,
    updateLeadStatus
};