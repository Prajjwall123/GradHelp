const express = require("express");
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const {
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    createCourse
} = require("../controllers/courseController");

// Public routes
router.get("/", getAllCourses);
router.get("/:id", getCourseById);

// Protected routes (require authentication)
router.use((req, res, next) => auth(req, res, next));

// Admin-only routes
router.post("/", 
    (req, res, next) => adminAuth(req, res, next), 
    createCourse
);

router.put("/:id", 
    (req, res, next) => adminAuth(req, res, next),
    updateCourse
);

router.delete("/:id", 
    (req, res, next) => adminAuth(req, res, next), 
    deleteCourse
);

module.exports = router;
