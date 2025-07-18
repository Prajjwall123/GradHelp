const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
    acceptScholarshipApplication,
    rejectScholarshipApplication
} = require('../controllers/scholarshipDecisionController');

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

// Accept a scholarship application (with optional acceptance letter)
router.post(
    '/:scholarshipAppId/accept',
    upload.single('file'),  // 'file' is the field name in the form data
    (req, res, next) => {
        console.log('File upload middleware:', {
            file: req.file ? 'File received' : 'No file received',
            body: req.body,
            params: req.params
        });
        next();
    },
    acceptScholarshipApplication
);

// Reject a scholarship application (with optional rejection letter)
router.post(
    '/:scholarshipAppId/reject',
    upload.single('file'),
    rejectScholarshipApplication
);

// Error handling middleware for multer
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            success: false,
            message: 'File upload error: ' + err.message
        });
    } else if (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next();
});

module.exports = router;
