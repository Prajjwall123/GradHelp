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
    updateApplicationSOP,
    getAllApplications
} = require("../controllers/applicationController");

const { validateSOPUpdate } = require("../validations/applicationValidation");

router.use(auth);

router.get("/me", getApplicationsByUser);

router.post("/", createApplication);
router.get("/:id", getApplicationById);
router.get("/user/:userId", getApplicationsByUser);

router.patch(
    "/:applicationId/sop",
    validateSOPUpdate,
    updateApplicationSOP
);

router.delete("/:id", deleteApplication);

router.get("/admin/all", adminAuth, getAllApplications);

router.patch(
    "/:id/status", 
    adminAuth,
    updateApplicationStatus
);

module.exports = router;
