const express = require('express');
const router = express.Router();
const { serveLetter } = require('../controllers/fileController');

// Serve letter files
// Example: GET /api/files/letters/acceptance_12345_1234567890.pdf
router.get('/letters/:filename', serveLetter);

module.exports = router;
