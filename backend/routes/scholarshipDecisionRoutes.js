const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth } = require('../middleware/auth');
const { authorize } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const {
    acceptScholarshipApplication,
    rejectScholarshipApplication
} = require('../controllers/scholarshipDecisionController');

router.use(auth);
router.use(adminAuth); 

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

router.post('/:scholarshipAppId/accept', 
    upload.single('file'),
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

router.post('/:scholarshipAppId/reject',
    upload.single('file'),
    rejectScholarshipApplication
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
