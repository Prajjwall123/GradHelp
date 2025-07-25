const express = require("express");
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const {
    getAllUniversities,
    getUniversityById,
    updateUniversity,
    deleteUniversity,
    createUniversity
} = require("../controllers/universityController");

const multer = require("multer");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = file.originalname.split('.').pop();
        cb(null, 'university-' + uniqueSuffix + '.' + ext);
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(file.originalname.toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
    }
});

// Public routes
router.get("/", getAllUniversities);
router.get("/:id", getUniversityById);

// Protected routes (require authentication)
router.use(auth);

// Admin-only routes
router.post("/", adminAuth, upload.single('university_photo'), createUniversity);
router.put("/:id", adminAuth, upload.single('university_photo'), updateUniversity);
router.delete("/:id", adminAuth, deleteUniversity);

module.exports = router;