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

router.get("/", getAllScholarships);
router.get("/university/:universityId", getScholarshipsByUniversity);
router.get("/:id", getScholarshipById);

router.use((req, res, next) => auth(req, res, next));

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
