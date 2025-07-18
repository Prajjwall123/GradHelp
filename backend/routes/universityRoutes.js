const express = require("express");
const router = express.Router();
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

router.get("/", getAllUniversities);
router.post("/", upload.single('university_photo'), createUniversity);
router.get("/:id", getUniversityById);
router.put("/:id", upload.single('university_photo'), updateUniversity);
router.delete("/:id", deleteUniversity);

module.exports = router;