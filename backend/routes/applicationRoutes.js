const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

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

router.get("/me", getApplicationsByUser);

router.post("/", createApplication);
router.get("/:id", getApplicationById);
router.get("/user/:userId", getApplicationsByUser);
router.patch("/:id/status", updateApplicationStatus);
router.patch(
    "/:applicationId/sop",
    validateSOPUpdate,
    updateApplicationSOP
);
router.delete("/:id", deleteApplication);

module.exports = router;
