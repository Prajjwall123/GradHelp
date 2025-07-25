const express = require('express');
const router = express.Router();
const { forgotPassword, resetPassword } = require('../controllers/authController');
const { forgotPasswordSchema } = require('../validations/userValidation');
const validate = require('../middleware/validation');
const { forgotPasswordLimiter, resetPasswordLimiter } = require('../middleware/rateLimiter');

router.post('/forgot-password',
    forgotPasswordLimiter,
    validate(forgotPasswordSchema),
    forgotPassword
);

router.post('/reset-password',
    resetPasswordLimiter,
    resetPassword
);

module.exports = router;
