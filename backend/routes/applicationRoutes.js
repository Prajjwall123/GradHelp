const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { authorize } = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

const {
    createApplication,
    getApplicationById,
    getApplicationsByUser,
    updateApplicationStatus,
    deleteApplication,
    updateApplicationSOP
} = require("../controllers/applicationController");

const { validateSOPUpdate } = require("../validations/applicationValidation");

// Apply auth middleware to all routes
router.use(auth);

// User routes
router.get("/me", getApplicationsByUser);

// Application routes
router.post("/", createApplication);
router.get("/:id", getApplicationById);
router.get("/user/:userId", getApplicationsByUser);

// SOP update route
router.patch(
    "/:applicationId/sop",
    validateSOPUpdate,
    updateApplicationSOP
);

// Delete application
router.delete("/:id", deleteApplication);

// Admin-only routes
router.patch(
    "/:id/status", 
    adminAuth,
    updateApplicationStatus
);

module.exports = router;
