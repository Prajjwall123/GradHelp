const express = require('express');
const router = express.Router();
const {
    register,
    verifyOTP,
    login,
    updateUser,
    deleteUser,
    getUserById,
    getAllUsers,
    getPremiumStatus
} = require('../controllers/userController');
const {
    registerSchema,
    loginSchema,
    otpVerificationSchema
} = require('../validations/userValidation');
const validate = require('../middleware/validation');
const { auth } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

router.post('/register',
    (req, res, next) => validate(registerSchema)(req, res, next),
    (req, res, next) => register(req, res, next)
);

router.post('/verify-otp',
    (req, res, next) => validate(otpVerificationSchema)(req, res, next),
    (req, res, next) => verifyOTP(req, res, next)
);

router.use(auth);

router.get('/premium-status',
    (req, res, next) => getPremiumStatus(req, res, next)
);

router.put('/me',
    (req, res, next) => updateUser(req, res, next)
);

router.delete('/me',
    (req, res, next) => deleteUser(req, res, next)
);

router.get('/admin/users',
    adminAuth,
    (req, res, next) => getAllUsers(req, res, next)
);

router.get('/admin/users/:id',
    adminAuth,
    (req, res, next) => getUserById(req, res, next)
);

router.put('/admin/users/:id',
    adminAuth,
    (req, res, next) => updateUser(req, res, next)
);

router.delete('/admin/users/:id',
    adminAuth,
    (req, res, next) => deleteUser(req, res, next)
);

module.exports = router;
