const express = require('express');
const router = express.Router();
const { forgotPassword, resetPassword } = require('../controllers/authController');
const { forgotPasswordSchema } = require('../validations/userValidation');
const validate = require('../middleware/validation');
const { forgotPasswordLimiter, resetPasswordLimiter } = require('../middleware/rateLimiter');

router.post('/forgot-password',
    (req, res, next) => forgotPasswordLimiter(req, res, next),
    (req, res, next) => validate(forgotPasswordSchema)(req, res, next),
    (req, res, next) => forgotPassword(req, res, next)
);

router.post('/reset-password',
    (req, res, next) => resetPasswordLimiter(req, res, next),
    (req, res, next) => resetPassword(req, res, next)
);

const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

// @route   POST /api/auth/login
// @desc    Authenticate user & get tokens
// @access  Public
router.post(
    '/login',
    [
        body('email', 'Please include a valid email').isEmail(),
        body('password', 'Password is required').exists()
    ],
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
