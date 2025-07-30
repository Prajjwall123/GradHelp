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

router.post('/forgot-password',
    forgotPasswordLimiter,
    validate(forgotPasswordSchema),
    passwordResetController.forgotPassword
);

router.post('/reset-password',
    resetPasswordLimiter,
    validate(resetPasswordSchema),
    passwordResetController.resetPassword
);


router.post('/verify-otp',
    [
        body('email', 'Please include a valid email').isEmail(),
        body('otp', 'OTP is required').notEmpty()
    ],
    authLimiter,
    (req, res, next) => validateRequest(req, res, next),
    (req, res, next) => userController.verifyOTP(req, res, next)
);


router.get('/csrf-token', (req, res) => {
    
    const identifier = req.ip + (req.get('user-agent') || '');
    const token = generateCSRFToken(identifier);
    res.setHeader('X-CSRF-Token', token);
    res.json({ csrfToken: token });
});




router.post(
    '/login',
    [
        body('email', 'Please include a valid email').isEmail(),
        body('password', 'Password is required').exists()
    ],
    authLimiter,
    require('../middleware/csrfProtection').verifyCSRFToken, 
    (req, res, next) => validateRequest(req, res, next),
    (req, res, next) => authController.login(req, res, next)
);




router.post(
    '/refresh-token',
    [
        body('refreshToken').optional(),
    ],
    (req, res, next) => validateRequest(req, res, next),
    (req, res, next) => authController.refreshToken(req, res, next)
);





router.get('/mfa/status',
    auth,
    (req, res, next) => mfaController.getMfaStatus(req, res, next)
);




router.get('/mfa/setup',
    auth,
    (req, res, next) => mfaController.setupMFA(req, res, next)
);




router.post('/mfa/verify',
    auth,
    [
        body('token', 'Token is required').isLength({ min: 6, max: 6 }),
        body('secret', 'Secret is required').notEmpty()
    ],
    (req, res, next) => validateRequest(req, res, next),
    (req, res, next) => mfaController.verifyMFA(req, res, next)
);




router.post('/mfa/verify-login',
    [
        body('token', 'Token is required').isLength({ min: 6, max: 6 }),
        body('tempToken', 'Temporary token is required').notEmpty()
    ],
    (req, res, next) => validateRequest(req, res, next),
    (req, res, next) => authController.verifyMfaLogin(req, res, next)
);




router.post(
    '/logout',
    [
        body('refreshToken').optional(),
    ],
    (req, res, next) => validateRequest(req, res, next),
    (req, res, next) => auth(req, res, next),
    (req, res, next) => authController.logout(req, res, next)
);




router.post(
    '/revoke-token',
    [
        body('token', 'Token is required').notEmpty(),
    ],
    (req, res, next) => validateRequest(req, res, next),
    (req, res, next) => auth(req, res, next),
    (req, res, next) => authController.revokeToken(req, res, next)
);




router.get(
    '/me',
    (req, res, next) => auth(req, res, next),
    (req, res, next) => authController.getCurrentUser(req, res, next)
);




router.get(
    '/refresh-tokens',
    (req, res, next) => auth(req, res, next),
    (req, res, next) => authController.getRefreshTokens(req, res, next)
);

module.exports = router;
