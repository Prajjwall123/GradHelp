const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getProfile, updateProfile } = require('../controllers/profileController');
const { validateProfile } = require('../validations/profileValidation');

const baseUploadsDir = path.join(__dirname, '../uploads');
const transcriptsDir = path.join(baseUploadsDir, 'transcripts');

[baseUploadsDir, transcriptsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
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
        fileSize: 10 * 1024 * 1024,
        files: 2
    },
    fileFilter: fileFilter
}).fields([
    { name: 'education_transcript', maxCount: 1 },
    { name: 'english_transcript', maxCount: 1 }
]);

const handleUploadErrors = (err, req, res, next) => {
    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message || 'File upload error',
            error: process.env.NODE_ENV === 'development' ? err.stack : {}
        });
    }
    next();
};

router.get('/:userId', getProfile);
router.patch('/:userId',
    (req, res, next) => {
        upload(req, res, (err) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message || 'File upload error',
                    error: process.env.NODE_ENV === 'development' ? err.stack : {}
                });
            }
            next();
        });
    },
    validateProfile,
    updateProfile
);

module.exports = router;