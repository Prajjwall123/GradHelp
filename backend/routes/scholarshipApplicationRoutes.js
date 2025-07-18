const express = require('express');
const router = express.Router();
const {
    createScholarshipApplication,
    getMyScholarshipApplications,
    updateApplicationStatus
} = require('../controllers/scholarshipApplicationController');

// @route   POST /api/scholarship-applications
// @desc    Apply for a scholarship
// @access  Public
router.post('/', createScholarshipApplication);

// @route   GET /api/scholarship-applications/me
// @desc    Get user's scholarship applications
// @access  Public
router.get('/me', getMyScholarshipApplications);

// @route   PUT /api/scholarship-applications/:id/status
// @desc    Update application status
// @access  Public
router.put('/:id/status', updateApplicationStatus);

module.exports = router;
