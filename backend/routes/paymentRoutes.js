const express = require('express');
const router = express.Router();
const { initiateTransaction, verifyTransaction } = require('../controllers/paymentController');


router.post('/initiate', initiateTransaction);


router.post('/verify', verifyTransaction);

module.exports = router;
