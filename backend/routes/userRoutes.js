const express = require('express');
const router = express.Router();
const { register, verifyOTP, login, updateUser, deleteUser } = require('../controllers/userController');
const {
    registerSchema,
    loginSchema,
    otpVerificationSchema
} = require('../validations/userValidation');
const validate = require('../middleware/validation');
const auth = require('../middleware/auth');

router.post('/register', validate(registerSchema), register);
router.post('/verify-otp', validate(otpVerificationSchema), verifyOTP);
router.post('/login', validate(loginSchema), login);

router.put('/:id', auth, validate(registerSchema), updateUser);
router.delete('/:id', auth, deleteUser);

module.exports = router;
