const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: JSON.stringify({ message: 'Too many requests from this IP, please try again after 15 minutes' }),
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: JSON.stringify({ message: 'Too many login attempts. Please try again later.' }),
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many login attempts. Please try again later.'
        });
    }
});

const otpVerificationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: JSON.stringify({
        success: false,
        message: 'Too many OTP verification attempts. Please try again after 15 minutes.'
    }),
    standardHeaders: true,
    legacyHeaders: false,
    skipFailedRequests: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many OTP verification attempts. Please try again after 15 minutes.'
        });
    }
});

const formSubmitLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: JSON.stringify({ message: 'Too many form submissions from this IP. Please try again later.' }),
    standardHeaders: true,
    legacyHeaders: false,
});

const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: JSON.stringify({
        success: false,
        message: 'Too many password reset attempts. Please try again after 1 hour.'
    }),
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many password reset attempts. Please try again after 1 hour.'
        });
    }
});

module.exports = {
    generalLimiter,
    authLimiter,
    otpVerificationLimiter,
    formSubmitLimiter,
    forgotPasswordLimiter
};
