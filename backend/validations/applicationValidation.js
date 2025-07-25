const Joi = require('joi');
const { sanitize } = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = require('dompurify')(window);

const detectXSS = (value) => {
    if (!value || typeof value !== 'string') return false;

    const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=\s*["']?[^"']*["']?/gi,
        /<[^>]+\s+[^>]*\b(?:on\w+|style|formaction|href|src)=[^>]*>/gi,
        /&[#\w]+;/gi,
        /<\?[^>]*>|\{\{[^}]*\}\}/gi,
        /<[^>]+\s+[^>]*\b(?:expression\(|eval\(|setTimeout\(|setInterval\(|Function\(|new\s+Function\().*?[;)]/gi,
        /<[^>]+\s+[^>]*\b(?:background|dynsrc|lowsrc|src)\s*=\s*[^>]*/gi,
        /<[^>]+\s+[^>]*\b(?:data|vbscript):[^>]*/gi,
        /<[^>]+\s+[^>]*\b(?:alert\(|prompt\(|confirm\(|document\.|window\.|eval\(|setTimeout\(|setInterval\(|Function\(|new\s+Function\().*?[;)]/gi
    ];

    return xssPatterns.some(pattern => pattern.test(value));
};

const sanitizeHTML = (dirty) => {
    if (!dirty) return '';

    const clean = DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'u', 'em', 'strong', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'],
        ALLOWED_ATTR: ['class', 'style'],
        ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|ftp|tel):|#|\/|data:image\/)/,
        ALLOW_UNKNOWN_PROTOCOLS: false,
        FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'link', 'meta', 'form', 'input', 'button', 'select', 'textarea', 'option', 'optgroup', 'fieldset', 'label', 'img', 'svg', 'video', 'audio', 'source', 'track', 'canvas', 'map', 'area', 'applet', 'base', 'basefont', 'bgsound', 'blink', 'body', 'command', 'datalist', 'details', 'dialog', 'frame', 'frameset', 'head', 'isindex', 'keygen', 'menu', 'menuitem', 'noframes', 'noscript', 'param', 'rp', 'rt', 'rtc', 'section', 'summary', 'template', 'title', 'wbr'],
        FORBID_ATTR: ['on*', 'style', 'formaction', 'href', 'src', 'data-*', 'xmlns', 'form', 'autofocus', 'autocomplete', 'autocorrect', 'autocapitalize', 'spellcheck', 'tabindex', 'contenteditable', 'contextmenu', 'dir', 'draggable', 'dropzone', 'hidden', 'id', 'lang', 'spellcheck', 'tabindex', 'title', 'translate']
    });

    return clean
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

const MONGO_OPERATORS = [
    '$where', '$ne', '$gt', '$gte', '$lt', '$lte', '$in', '$nin',
    '$exists', '$type', '$not', '$mod', '$regex', '$text', '$search',
    '$all', '$elemMatch', '$size', '$bitsAllClear', '$bitsAnyClear',
    '$bitsAllSet', '$bitsAnySet', '$expr', '$jsonSchema', '$geoIntersects',
    '$geoWithin', '$near', '$nearSphere', '$geometry', '$maxDistance',
    '$minDistance', '$center', '$centerSphere', '$box', '$polygon', '$uniqueDocs',
    '$and', '$or', '$nor', '$comment', '$meta', '$slice', '$', '$elemMatch',
    '$meta', '$slice', '$', '$elemMatch', '$meta', '$slice', '$', '$elemMatch'
];

const hasMongoOperators = (obj) => {
    if (!obj || typeof obj !== 'object') return false;

    return Object.keys(obj).some(key => {
        if (key.startsWith('$') && MONGO_OPERATORS.includes(key)) {
            return true;
        }

        if (typeof obj[key] === 'object' && obj[key] !== null) {
            return hasMongoOperators(obj[key]);
        }

        return false;
    });
};

const noSqlInjectionValidation = (value, helpers) => {
    if (hasMongoOperators(value)) {
        return helpers.error('any.invalid', { message: 'Invalid input: potential NoSQL injection detected' });
    }
    return value;
};

const sopValidation = (value, helpers) => {
    if (!value) {
        return value;
    }

    if (typeof value !== 'string') {
        return helpers.error('any.invalid', { message: 'SOP must be a string' });
    }

    if (detectXSS(value)) {
        return helpers.error('any.invalid', { message: 'Invalid content detected in SOP' });
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

    return sanitizeHTML(value);
};

const updateSOPSchema = Joi.object({
    sop: Joi.custom(sopValidation).required().messages({
        'any.required': 'SOP content is required',
        'any.invalid': 'Invalid SOP content'
    }),
    userId: Joi.string().custom(noSqlInjectionValidation).required().messages({
        'any.required': 'User ID is required',
        'string.base': 'User ID must be a string',
        'any.invalid': 'Invalid user ID: potential security issue detected'
    })
}).options({ stripUnknown: true });

const validateSOPUpdate = (req, res, next) => {
    // First, check for MongoDB operators in the raw request body
    if (hasMongoOperators(req.body)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid request: potential security issue detected',
            errors: [{
                field: 'request',
                message: 'Request contains potentially dangerous content'
            }]
        });
    }

    const { error, value } = updateSOPSchema.validate(req.body, {
        abortEarly: false,
        allowUnknown: false
    });

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
    validateSOPUpdate,
    sanitizeHTML,
    hasMongoOperators,
    noSqlInjectionValidation,
    sopValidation
};
