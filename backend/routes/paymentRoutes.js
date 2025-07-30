const express = require('express');
const router = express.Router();
const { initiatePayment, verifyPayment } = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');


router.post('/initiate', auth, initiatePayment);
router.post('/verify', auth, verifyPayment);

module.exports = router;
