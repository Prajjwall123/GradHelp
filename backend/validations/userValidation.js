const Joi = require('joi');

const emailSchema = Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required',
    'any.required': 'Email is required'
});

const passwordSchema = Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s:]).*$/)
    .required()
    .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'string.min': 'Password must be at least 8 characters long',
        'string.empty': 'Password is required',
        'any.required': 'Password is required'
    });

exports.registerSchema = Joi.object({
    full_name: Joi.string()
        .min(2)
        .required()
        .messages({
            'string.min': 'Full name must be at least 2 characters long',
            'string.empty': 'Full name is required',
            'any.required': 'Full name is required'
        }),
    email: emailSchema,
    password: passwordSchema
});

exports.loginSchema = Joi.object({
    email: emailSchema,
    password: Joi.string().required().messages({
        'string.empty': 'Password is required',
        'any.required': 'Password is required'
    })
});

exports.otpVerificationSchema = Joi.object({
    email: emailSchema,
    otp: Joi.string()
        .length(6)
        .pattern(/^\d+$/)
        .required()
        .messages({
            'string.length': 'OTP must be 6 digits',
            'string.pattern.base': 'OTP must contain only numbers',
            'string.empty': 'OTP is required',
            'any.required': 'OTP is required'
        })
});

// For forgot password request
exports.forgotPasswordSchema = Joi.object({
    email: emailSchema
});

// For reset password
exports.resetPasswordSchema = Joi.object({
    email: Joi.alternatives()
        .try(
            emailSchema,
            Joi.object({
                email: emailSchema.required(),
                newPassword: passwordSchema.required(),
                otp: Joi.string()
                    .length(6)
                    .pattern(/^\d+$/)
                    .required()
            })
        )
        .required()
        .messages({
            'alternatives.match': 'Invalid request format',
            'any.required': 'Request body is required'
        }),
    
    // These fields are kept for backward compatibility
    newPassword: Joi.when('email', {
        is: Joi.object(),
        then: Joi.forbidden(),
        otherwise: passwordSchema.required()
    }),
    
    otp: Joi.when('email', {
        is: Joi.object(),
        then: Joi.forbidden(),
        otherwise: Joi.string()
            .length(6)
            .pattern(/^\d+$/)
            .required()
            .messages({
                'string.length': 'OTP must be 6 digits',
                'string.pattern.base': 'OTP must contain only numbers',
                'string.empty': 'OTP is required',
                'any.required': 'OTP is required'
            })
    })
});
