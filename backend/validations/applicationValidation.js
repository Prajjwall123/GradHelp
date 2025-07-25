const Joi = require('joi');

const detectNoSQLInjection = (value) => {
    if (!value || typeof value !== 'string') return false;

    const noSqlPatterns = [
        /\$where/i,
        /\$ne/i,
        /\$gt/i,
        /\$lt/i,
        /\$in/i,
        /\$nin/i,
        /\$exists/i,
        /\$elemMatch/i,
        /\$regex/i,
        /\$options/i,
        /\$\{.*\}/,
        /\$function/i,
        /\$accumulator/i,
        /\$addFields/i,
        /\$bucket/i,
        /\$collStats/i,
        /\$count/i,
        /\$facet/i,
        /\$geoNear/i,
        /\$graphLookup/i,
        /\$indexStats/i,
        /\$lookup/i,
        /\$match/i,
        /\$merge/i,
        /\$out/i,
        /\$planCacheStats/i,
        /\$project/i,
        /\$redact/i,
        /\$replaceRoot/i,
        /\$replaceWith/i,
        /\$sample/i,
        /\$search/i,
        /\$set/i,
        /\$unset/i,
        /\$unwind/i,
        /\$jsonSchema/i,
        /\$text/i,
        /\$type/i
    ];

    return noSqlPatterns.some(pattern => pattern.test(value));
};

const sopValidation = (value, helpers) => {
    if (!value) {
        return value;
    }

    if (typeof value !== 'string') {
        return helpers.error('any.invalid', { message: 'SOP must be a string' });
    }

    if (detectNoSQLInjection(value)) {
        return helpers.error('any.invalid', { message: 'Invalid characters detected in SOP' });
    }

    const sopSchema = Joi.string()
        .max(10000)
        .messages({
            'string.max': 'SOP cannot be longer than 10000 characters',
            'string.base': 'SOP must be a string'
        });

    const { error } = sopSchema.validate(value);
    if (error) {
        return helpers.error('any.invalid', { message: error.details[0].message });
    }

    return value;
};

const updateSOPSchema = Joi.object({
    sop: Joi.custom(sopValidation).required().messages({
        'any.required': 'SOP content is required',
        'any.invalid': 'Invalid SOP content'
    }),
    userId: Joi.string().required().messages({
        'any.required': 'User ID is required',
        'string.base': 'User ID must be a string'
    })
}).options({ stripUnknown: true });

const validateSOPUpdate = (req, res, next) => {
    const { error, value } = updateSOPSchema.validate(req.body, { abortEarly: false });

    if (error) {
        const errorMessage = error.details.map(detail => detail.message).join('; ');
        return res.status(400).json({
            success: false,
            message: `Validation error: ${errorMessage}`,
            errors: error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }))
        });
    }

    req.body = value;
    next();
};

module.exports = {
    validateSOPUpdate
};
