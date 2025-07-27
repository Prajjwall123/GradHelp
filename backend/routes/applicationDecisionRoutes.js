const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth } = require('../middleware/auth');
const { authorize } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { acceptApplication, rejectApplication } = require('../controllers/applicationDecisionController');

// Apply auth and admin middleware to all routes
router.use(auth);
router.use(adminAuth); // All application decision routes are admin-only

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
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: fileFilter
});

// Accept application with file upload
router.post('/:applicationId/accept',
    upload.single('file'),
    acceptApplication
);

// Reject application with file upload
router.post('/:applicationId/reject',
    upload.single('file'),
    rejectApplication
);

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
