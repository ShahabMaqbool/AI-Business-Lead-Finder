const express = require("express");

const {
    getLeads,
    createLead,
    updateLeadStatus
} = require("../controllers/leadController");

const router = express.Router();

router.get("/", getLeads);

router.post("/", createLead);

router.patch("/:id/status", updateLeadStatus);

module.exports = router;