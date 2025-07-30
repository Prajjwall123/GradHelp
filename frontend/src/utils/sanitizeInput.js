const sanitizeInput = (input, options = {}) => {
    const {
        allowBasicFormatting = false,
        stripHtml = true,
    } = options;

    if (input === null || input === undefined) {
        return '';
    }

    let str = String(input).trim();

    if (stripHtml) {
        if (allowBasicFormatting) {
            str = str.replace(/<(?!\/?[biu]>|\/?(b|i|u|strong|em|u|br|p|div|span)(\s[^>]*)?>)/gi, '&lt;');
        } else {
            str = str.replace(/<[^>]*>?/gm, '');
        }
    }

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

    return str.replace(/[&<>"'`=]/g, (char) => escapeMap[char]);
};

export default sanitizeInput;


