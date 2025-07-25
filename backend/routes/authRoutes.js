const express = require('express');
const router = express.Router();
const { forgotPassword, resetPassword } = require('../controllers/authController');
const { forgotPasswordSchema, resetPasswordSchema } = require('../validations/userValidation');
const validate = require('../middleware/validation');
const { forgotPasswordLimiter } = require('../middleware/rateLimiter');

router.post('/forgot-password',
    forgotPasswordLimiter,
    validate(forgotPasswordSchema),
    forgotPassword
);

router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

module.exports = router;
