const express = require('express');
const router = express.Router();
const {
    createScholarshipApplication,
    getMyScholarshipApplications,
    updateApplicationStatus
} = require('../controllers/scholarshipApplicationController');




router.post('/', createScholarshipApplication);




router.get('/me', getMyScholarshipApplications);




router.put('/:id/status', updateApplicationStatus);

module.exports = router;
