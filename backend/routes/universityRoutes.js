const express = require("express");
const router = express.Router();
const fs = require('fs');
const path = require('path');
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

const imagesDir = path.join(__dirname, '..', 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, imagesDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = file.originalname.split('.').pop();
        cb(null, 'university-' + uniqueSuffix + '.' + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size too large. Maximum size is 5MB' });
        }
        return res.status(400).json({ error: err.message });
    } else if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
};

router.get("/", getAllUniversities);
router.get("/:id", getUniversityById);

router.use((req, res, next) => auth(req, res, next));

router.post("/", 
    (req, res, next) => adminAuth(req, res, next),
    upload.single('university_photo'), 
    (req, res, next) => handleUploadError(req, res, next),
    createUniversity
);

router.put("/:id", 
    (req, res, next) => adminAuth(req, res, next),
    upload.single('university_photo'),
    (req, res, next) => handleUploadError(req, res, next),
    updateUniversity
);

router.delete("/:id", 
    (req, res, next) => adminAuth(req, res, next), 
    deleteUniversity
);

module.exports = router;