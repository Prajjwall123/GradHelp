const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse
} = require("../controllers/courseController");
const { adminAuth } = require('../middleware/adminAuth');
const { verifyCSRFToken } = require('../middleware/csrfProtection');

router.get("/", getAllCourses);
router.get("/:id", getCourseById);

router.post(
    "/",
    verifyCSRFToken,
    (req, res, next) => adminAuth(req, res, next),
    [
        check('name', 'Name is required').not().isEmpty(),
        check('university', 'University ID is required').isMongoId()
    ],
    createCourse
);

router.put(
    "/:id",
    verifyCSRFToken,
    (req, res, next) => adminAuth(req, res, next),
    [
        check('name', 'Name is required').optional().not().isEmpty(),
        check('university', 'University ID must be a valid ID').optional().isMongoId()
    ],
    updateCourse
);

router.delete(
    "/:id",
    verifyCSRFToken,
    (req, res, next) => adminAuth(req, res, next),
    deleteCourse
);

module.exports = router;
