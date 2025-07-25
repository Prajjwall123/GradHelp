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
router.use(auth);

// Admin-only routes
router.post("/", adminAuth, createCourse);
router.put("/:id", adminAuth, updateCourse);
router.delete("/:id", adminAuth, deleteCourse);

module.exports = router;
