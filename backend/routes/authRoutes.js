const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const passwordResetController = require('../controllers/passwordResetController');
const { forgotPasswordSchema, resetPasswordSchema } = require('../validations/userValidation');
const validate = require('../middleware/validation');
const { forgotPasswordLimiter, resetPasswordLimiter, authLimiter } = require('../middleware/rateLimiter');
const mfaController = require('../controllers/mfaController');
const { auth } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const { generateCSRFToken } = require('../middleware/csrfProtection');

// Forgot password route
router.post('/forgot-password',
    forgotPasswordLimiter,
    validate(forgotPasswordSchema),
    passwordResetController.forgotPassword
);

// Reset password route
router.post('/reset-password',
    resetPasswordLimiter,
    validate(resetPasswordSchema),
    passwordResetController.resetPassword
);

// Verify OTP for registration
router.post('/verify-otp',
    [
        body('email', 'Please include a valid email').isEmail(),
        body('otp', 'OTP is required').notEmpty()
    ],
    authLimiter,
    (req, res, next) => validateRequest(req, res, next),
    (req, res, next) => userController.verifyOTP(req, res, next)
);

// Public endpoint to get a CSRF token before login
router.get('/csrf-token', (req, res) => {
    // For unauthenticated users, use IP + UA as a pseudo-identifier (not ideal for production, but works for demo)
    const identifier = req.ip + (req.get('user-agent') || '');
    const token = generateCSRFToken(identifier);
    res.setHeader('X-CSRF-Token', token);
    res.json({ csrfToken: token });
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get tokens
// @access  Public
router.post(
    '/login',
    [
        body('email', 'Please include a valid email').isEmail(),
        body('password', 'Password is required').exists()
    ],
    authLimiter,
    require('../middleware/csrfProtection').verifyCSRFToken, // Enforce CSRF on login
    (req, res, next) => validateRequest(req, res, next),
    (req, res, next) => authController.login(req, res, next)
);

// @route   POST /api/auth/refresh-token
// @desc    Refresh access token
// @access  Public (requires refresh token in cookie or body)
router.post(
    '/refresh-token',
    [
        body('refreshToken').optional(),
    ],
    (req, res, next) => validateRequest(req, res, next),
    (req, res, next) => authController.refreshToken(req, res, next)
);

// MFA Routes
// @route   GET /api/auth/mfa/status
// @desc    Get MFA status for current user
// @access  Private
router.get('/mfa/status',
    auth,
    (req, res, next) => mfaController.getMfaStatus(req, res, next)
);

// @route   GET /api/auth/mfa/setup
// @desc    Generate MFA secret and QR code
// @access  Private
router.get('/mfa/setup',
    auth,
    (req, res, next) => mfaController.setupMFA(req, res, next)
);

// @route   POST /api/auth/mfa/verify
// @desc    Verify MFA setup
// @access  Private
router.post('/mfa/verify',
    auth,
    [
        body('token', 'Token is required').isLength({ min: 6, max: 6 }),
        body('secret', 'Secret is required').notEmpty()
    ],
    (req, res, next) => validateRequest(req, res, next),
    (req, res, next) => mfaController.verifyMFA(req, res, next)
);

// @route   POST /api/auth/mfa/verify-login
// @desc    Verify MFA token during login
// @access  Public
router.post('/mfa/verify-login',
    [
        body('token', 'Token is required').isLength({ min: 6, max: 6 }),
        body('tempToken', 'Temporary token is required').notEmpty()
    ],
    (req, res, next) => validateRequest(req, res, next),
    (req, res, next) => authController.verifyMfaLogin(req, res, next)
);

// @route   POST /api/auth/logout
// @desc    Logout user (revoke refresh token)
// @access  Private
router.post(
    '/logout',
    [
        body('refreshToken').optional(),
    ],
    (req, res, next) => validateRequest(req, res, next),
    (req, res, next) => auth(req, res, next),
    (req, res, next) => authController.logout(req, res, next)
);

// @route   POST /api/auth/revoke-token
// @desc    Revoke a refresh token
// @access  Private
router.post(
    '/revoke-token',
    [
        body('token', 'Token is required').notEmpty(),
    ],
    (req, res, next) => validateRequest(req, res, next),
    (req, res, next) => auth(req, res, next),
    (req, res, next) => authController.revokeToken(req, res, next)
);

// @route   GET /api/auth/me
// @desc    Get current user info
// @access  Private
router.get(
    '/me',
    (req, res, next) => auth(req, res, next),
    (req, res, next) => authController.getCurrentUser(req, res, next)
);

// @route   GET /api/auth/refresh-tokens
// @desc    Get all refresh tokens for current user
// @access  Private
router.get(
    '/refresh-tokens',
    (req, res, next) => auth(req, res, next),
    (req, res, next) => authController.getRefreshTokens(req, res, next)
);

module.exports = router;
