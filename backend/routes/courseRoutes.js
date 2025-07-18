const express = require("express");
const router = express.Router();

const {
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    createCourse
} = require("../controllers/courseController");

router.get("/", getAllCourses);
router.get("/:id", getCourseById);
router.put("/:id", updateCourse);
router.post("/", createCourse);
router.delete("/:id", deleteCourse);

module.exports = router;
