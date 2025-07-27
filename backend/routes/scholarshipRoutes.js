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
router.use((req, res, next) => auth(req, res, next));

// Admin-only routes
router.post("/", 
    (req, res, next) => adminAuth(req, res, next),
    createScholarship
);

router.put("/:id", 
    (req, res, next) => adminAuth(req, res, next),
    updateScholarship
);

router.delete("/:id", 
    (req, res, next) => adminAuth(req, res, next), 
    deleteScholarship
);

module.exports = router;
