const express = require("express");
const router = express.Router();

const {
    createApplication,
    getApplicationById,
    getApplicationsByUser,
    updateApplicationStatus,
    deleteApplication,
    updateApplicationSOP
} = require("../controllers/applicationController");

// Create a new application
router.post("/", createApplication);

// Get a specific application by ID
router.get("/:id", getApplicationById);

// Get all applications for a specific user
router.get("/user/:userId", getApplicationsByUser);

// Update application status (protected route)
router.patch("/:id/status", updateApplicationStatus);

// Update application SOP (no authentication required, but requires userId in body)
router.patch("/:applicationId/sop", updateApplicationSOP);

// Delete an application (protected route)
router.delete("/:id", deleteApplication);

module.exports = router;
