const express = require('express');
const router = express.Router();
const {
    register,
    verifyOTP,
    login,
    updateUser,
    deleteUser,
    getUserById,
    getAllUsers
} = require('../controllers/userController');
const {
    registerSchema,
    loginSchema,
    otpVerificationSchema
} = require('../validations/userValidation');
const validate = require('../middleware/validation');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Public routes
router.post('/register', 
    (req, res, next) => validate(registerSchema)(req, res, next),
    (req, res, next) => register(req, res, next)
);

router.post('/verify-otp', 
    (req, res, next) => validate(otpVerificationSchema)(req, res, next),
    (req, res, next) => verifyOTP(req, res, next)
);

// Protected routes (require authentication)
router.use((req, res, next) => auth(req, res, next));

// User routes - these use the authenticated user's ID
router.put('/me', 
    (req, res, next) => updateUser(req, res, next)
);

router.delete('/me', 
    (req, res, next) => deleteUser(req, res, next)
);

// Admin routes - these require admin privileges
router.get('/admin/users', 
    (req, res, next) => adminAuth(req, res, next), 
    (req, res, next) => getAllUsers(req, res, next)
);

router.get('/admin/users/:id', 
    (req, res, next) => adminAuth(req, res, next), 
    (req, res, next) => getUserById(req, res, next)
);

router.put('/admin/users/:id', 
    (req, res, next) => adminAuth(req, res, next), 
    (req, res, next) => updateUser(req, res, next)
);

router.delete('/admin/users/:id', 
    (req, res, next) => adminAuth(req, res, next), 
    (req, res, next) => deleteUser(req, res, next)
);

module.exports = router;
