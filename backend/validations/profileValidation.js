const Joi = require('joi');
const { Types } = require('mongoose');

const objectId = (value, helpers) => {
    if (!Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
    }
    return value;
};

const commonRules = {
    full_name: Joi.string().trim().min(2).max(100).required()
        .messages({
            'string.empty': 'Full name is required',
            'string.min': 'Full name must be at least 2 characters long',
            'string.max': 'Full name cannot be longer than 100 characters',
            'any.required': 'Full name is required'
        }),
    email: Joi.string().email().trim().lowercase().required()
        .messages({
            'string.email': 'Please enter a valid email address',
            'string.empty': 'Email is required',
            'any.required': 'Email is required'
        }),
    gender: Joi.string().valid('Male', 'Female', 'Other', 'Prefer not to say').optional(),
    address: Joi.string().trim().max(500).allow('').optional(),
    city: Joi.string().trim().max(100).allow('').optional(),
    first_language: Joi.string().trim().max(100).allow('').optional(),
    date_of_birth: Joi.date().max('now').iso().allow('').optional()
        .messages({
            'date.base': 'Please enter a valid date',
            'date.max': 'Date of birth cannot be in the future',
            'date.format': 'Date must be in YYYY-MM-DD format'
        })
};

const educationRules = {
    highest_education_level: Joi.string().trim().allow('').optional(),
    institution_name: Joi.string().trim().max(200).allow('').optional(),
    field_of_study: Joi.string().trim().max(200).allow('').optional(),
    education_transcript: Joi.string().trim().allow('').optional(),
    graduation_year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 5)
        .allow('')
        .optional()
        .messages({
            'number.base': 'Graduation year must be a number',
            'number.min': 'Graduation year must be after 1900',
            'number.max': `Graduation year cannot be after ${new Date().getFullYear() + 5}`
        }),
    currently_enrolled: Joi.boolean().default(false),
    graduation_status: Joi.boolean().default(false),
    final_grade: Joi.string().trim().allow('').optional()
};

const visaRules = {
    visa_application_country: Joi.string().trim().max(100).allow('').optional(),
    visa_type: Joi.string().trim().max(100).allow('').optional(),
    application_date: Joi.date().max('now').iso().allow('').optional()
        .messages({
            'date.base': 'Please enter a valid date',
            'date.max': 'Application date cannot be in the future',
            'date.format': 'Date must be in YYYY-MM-DD format'
        }),
    status: Joi.string().trim().max(100).allow('').optional(),
    currently_hold_a_visa: Joi.boolean().default(false),
    previous_visa_application: Joi.boolean().default(false),
    application_country: Joi.string().trim().max(100).allow('').optional(),
    application_year: Joi.number().integer().min(2000).max(new Date().getFullYear() + 1)
        .allow('')
        .optional()
        .messages({
            'number.base': 'Application year must be a number',
            'number.min': 'Application year must be 2000 or later',
            'number.max': `Application year cannot be after ${new Date().getFullYear() + 1}`
        }),
    other_visa_information: Joi.string().trim().max(1000).allow('').optional()
};

const englishTestRules = {
    english_test: Joi.object({
        test_type: Joi.string().valid('ielts', 'toefl', 'pte', 'duolingo', 'other').allow('').optional(),
        reading: Joi.number().min(0).max(120).allow('').optional(),
        writing: Joi.number().min(0).max(120).allow('').optional(),
        speaking: Joi.number().min(0).max(120).allow('').optional(),
        listening: Joi.number().min(0).max(120).allow('').optional(),
        overall_score: Joi.number().min(0).max(120).allow('').optional(),
        exam_date: Joi.date().max('now').iso().allow('').optional()
            .messages({
                'date.base': 'Please enter a valid exam date',
                'date.max': 'Exam date cannot be in the future',
                'date.format': 'Date must be in YYYY-MM-DD format'
            }),
        english_transcript: Joi.string().trim().allow('').optional()
    }).optional()
};

const profileSchema = Joi.object({
    ...commonRules,
    ...educationRules,
    ...visaRules,
    ...englishTestRules,
}).options({ allowUnknown: true, stripUnknown: true });

const validateProfile = (req, res, next) => {
    // Combine request data
    const dataToValidate = {
        ...req.body,
        ...(req.files || {}),
    };

    // Convert file objects to filenames if they exist
    if (req.files) {
        Object.entries(req.files).forEach(([field, fileArray]) => {
            if (fileArray && fileArray[0] && fileArray[0].filename) {
                dataToValidate[field] = fileArray[0].filename;
            }
        });
    }

    // Validate the data
    const { error, value } = profileSchema.validate(dataToValidate, {
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: true
    });

    if (error) {
        // Format error messages
        const errors = error.details.map(detail => {
            // Extract the field name from the path
            const field = detail.path.join('.');

            // Customize error messages based on the field and error type
            let message = detail.message;

            // Remove quotes from around field names in error messages
            message = message.replace(/\"/g, '');

            // Special handling for required fields
            if (detail.type === 'any.required') {
                message = `${field} is required`;
            }

            return {
                field,
                message
            };
        });

        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    // Attach validated data to the request object
    req.validatedData = value;
    next();
};

module.exports = {
    validateProfile
};
