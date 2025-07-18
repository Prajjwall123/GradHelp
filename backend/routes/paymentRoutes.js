const express = require('express');
const router = express.Router();
const { initiateTransaction, verifyTransaction } = require('../controllers/paymentController');

// Initialize payment
router.post('/initiate', initiateTransaction);

// Verify payment
router.post('/verify', verifyTransaction);

module.exports = router;
