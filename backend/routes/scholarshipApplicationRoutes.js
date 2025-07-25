const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const {
    createScholarshipApplication,
    getMyScholarshipApplications,
    updateApplicationStatus
} = require('../controllers/scholarshipApplicationController');

// Apply auth middleware to all routes
router.use(auth);

router.post('/', createScholarshipApplication);
router.get('/me', getMyScholarshipApplications);
router.put('/:id/status', updateApplicationStatus);

module.exports = router;
