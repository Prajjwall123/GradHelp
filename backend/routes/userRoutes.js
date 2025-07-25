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
router.post('/register', validate(registerSchema), register);
router.post('/verify-otp', validate(otpVerificationSchema), verifyOTP);
router.post('/login', validate(loginSchema), login);

// Protected routes (require authentication)
router.use(auth);

// User routes - these use the authenticated user's ID
router.put('/me', updateUser);
router.delete('/me', deleteUser);

// Admin routes - these require admin privileges
router.get('/admin/users', adminAuth, getAllUsers);
router.get('/admin/users/:id', adminAuth, getUserById);
router.put('/admin/users/:id', adminAuth, updateUser);
router.delete('/admin/users/:id', adminAuth, deleteUser);

module.exports = router;
