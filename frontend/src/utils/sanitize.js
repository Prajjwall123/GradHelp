
export const sanitizeInput = (input) => {
    if (!input || typeof input !== 'string') return '';

    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/(javascript:|data:)\s*[^\s,)]*/gi, '')
        .replace(/on\w+\s*=\s*["']?[^"']*["']?/gi, '')
        .replace(/<[^>]+\s+[^>]*\b(?:on\w+|style|formaction|href|src|data-\w+)=[^>]*>/gi, '')
        .replace(/<!--[\s\S]*?-->|<%[\s\S]*?%>/g, '')
        .replace(/(?:javascript:|data:|vbscript:|about:)+/gi, '')
        .replace(/&[#\w]+;/gi, '')
        .replace(/<\/?\w+[^>]*?>/g, function (match) {
            const allowedTags = ['p', 'br', 'b', 'i', 'u', 'em', 'strong', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
            const tagMatch = match.match(/<\/?([\w-]+)/);
            if (tagMatch && allowedTags.includes(tagMatch[1].toLowerCase())) {
                return match;
            }
            return '';
        });
};


export const sanitizeHTML = (html) => {
    if (!html || typeof html !== 'string') return '';

    const clean = html.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>?/gi, (match, tag) => {
        const allowedTags = ['p', 'br', 'b', 'i', 'u', 'em', 'strong', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        return allowedTags.includes(tag.toLowerCase()) ? match : '';
    });

    return clean.replace(/<([a-z][a-z0-9]*)\s+([^>]*)>/gi, (match, tag, attrs) => {
        const allowedTags = ['p', 'b', 'i', 'u', 'em', 'strong', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        if (!allowedTags.includes(tag.toLowerCase())) return '';

        const classMatch = attrs.match(/class\s*=\s*["']([^"']*)["']/i);
        if (classMatch) {
            return `<${tag} class="${classMatch[1]}">`;
        }
        return `<${tag}>`;
    });
};
