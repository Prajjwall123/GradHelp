const { StatusCodes } = require('http-status-codes');


const validate = (schema) => (req, res, next) => {
    try {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false, 
            stripUnknown: true,
            allowUnknown: true 
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        req.body = value;
        next();
    } catch (err) {
        console.error('Validation middleware error:', err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'An error occurred during validation'
        });
    }
};

module.exports = validate;
