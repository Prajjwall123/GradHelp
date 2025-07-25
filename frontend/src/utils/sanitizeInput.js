/**
 * Sanitizes user input to prevent XSS attacks
 * @param {string|number} input - The input to sanitize
 * @param {Object} options - Sanitization options
 * @param {boolean} [options.allowBasicFormatting=false] - Whether to allow basic formatting (bold, italic, underline)
 * @param {boolean} [options.stripHtml=true] - Whether to strip HTML tags
 * @returns {string} Sanitized input
 */
const sanitizeInput = (input, options = {}) => {
    const {
        allowBasicFormatting = false,
        stripHtml = true,
    } = options;

    if (input === null || input === undefined) {
        return '';
    }

    // Convert to string if it's a number
    let str = String(input).trim();

    // Remove or escape HTML tags
    if (stripHtml) {
        if (allowBasicFormatting) {
            // Allow basic formatting tags
            str = str.replace(/<(?!\/?[biu]>|\/?(b|i|u|strong|em|u|br|p|div|span)(\s[^>]*)?>)/gi, '&lt;');
        } else {
            // Remove all HTML tags
            str = str.replace(/<[^>]*>?/gm, '');
        }
    }

    // Escape special characters
    const escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };

    // Replace special characters with their HTML entities
    return str.replace(/[&<>"'`=]/g, (char) => escapeMap[char]);
};

export default sanitizeInput;
