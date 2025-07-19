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


router.post("/", createApplication);


router.get("/:id", getApplicationById);


router.get("/user/:userId", getApplicationsByUser);


router.patch("/:id/status", updateApplicationStatus);


router.patch("/:applicationId/sop", updateApplicationSOP);


router.delete("/:id", deleteApplication);

module.exports = router;
