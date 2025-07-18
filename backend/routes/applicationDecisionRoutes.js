const express = require('express');
const router = express.Router();
const multer = require('multer');
const { acceptApplication, rejectApplication } = require('../controllers/applicationDecisionController');

// Configure multer for file uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: fileFilter
});

// Accept an application (with optional acceptance letter)
router.post(
    '/:applicationId/accept',
    upload.single('file'),
    acceptApplication
);

// Reject an application (with optional rejection letter)
router.post(
    '/:applicationId/reject',
    upload.single('file'),
    rejectApplication
);

// Error handling middleware for multer
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading
        return res.status(400).json({
            success: false,
            message: 'File upload error: ' + err.message
        });
    } else if (err) {
        // An unknown error occurred
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next();
});

module.exports = router;
