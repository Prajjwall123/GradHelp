const express = require('express');
const router = express.Router();
const { initiatePayment, verifyPayment } = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');

// @route   POST /api/payments/initiate
// @desc    Initiate Khalti payment
// @access  Private
router.post('/initiate', auth, initiatePayment);

// @route   POST /api/payments/verify
// @desc    Verify Khalti payment and update user premium status
// @access  Private
router.post('/verify', auth, verifyPayment);

module.exports = router;
