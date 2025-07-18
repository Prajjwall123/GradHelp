const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getProfile, updateProfile } = require('../controllers/profileController');

// Create uploads/transcripts directories if they don't exist
const baseUploadsDir = path.join(__dirname, '../uploads');
const transcriptsDir = path.join(baseUploadsDir, 'transcripts');

// Ensure directories exist
[baseUploadsDir, transcriptsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Create a subdirectory for each transcript type
        const dest = path.join(transcriptsDir, file.fieldname);
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'transcript-' + uniqueSuffix + path.extname(file.originalname).toLowerCase());
    }
});

const fileFilter = (req, file, cb) => {
    const filetypes = /pdf|doc|docx/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Only PDF and Word documents are allowed'));
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit per file
        files: 2 // Maximum of 2 files (one for each transcript type)
    },
    fileFilter: fileFilter
}).fields([
    { name: 'education_transcript', maxCount: 1 },
    { name: 'english_transcript', maxCount: 1 }
]);

// Handle file upload errors
const handleUploadErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message });
    } else if (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
};

// Routes
router.get('/:userId', getProfile);
router.patch('/:userId', upload, handleUploadErrors, updateProfile);

module.exports = router;