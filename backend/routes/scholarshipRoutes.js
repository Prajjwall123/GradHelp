const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

const {
    getAllScholarships,
    getScholarshipById,
    updateScholarship,
    deleteScholarship,
    createScholarship,
    getScholarshipsByUniversity
} = require("../controllers/scholarshipController");

// Public routes
router.get("/", getAllScholarships);
router.get("/university/:universityId", getScholarshipsByUniversity);
router.get("/:id", getScholarshipById);

// Protected routes (require authentication)
router.use(auth);

// Admin-only routes
router.post("/", adminAuth, createScholarship);
router.put("/:id", adminAuth, updateScholarship);
router.delete("/:id", adminAuth, deleteScholarship);

module.exports = router;
