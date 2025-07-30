const crypto = require('crypto');

const csrfTokens = new Map();


const generateCSRFToken = (userId) => {
    const token = crypto.randomBytes(32).toString('hex');
    csrfTokens.set(userId, {
        token,
        expiresAt: Date.now() + 3600000 
    });
    return token;
};


const verifyCSRFToken = (req, res, next) => {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
        return next();
    }

    const token = req.headers["x-csrf-token"] || req.body._csrf;
    let identifier = req.user?._id;
    if (!identifier) {
        identifier = req.ip + (req.get("user-agent") || "");
    }

    if (!identifier || !token) {
        return res.status(403).json({
            success: false,
            message: "CSRF token is missing"
        });
    }

    const storedToken = csrfTokens.get(identifier);

    if (!storedToken || storedToken.token !== token || storedToken.expiresAt < Date.now()) {
        return res.status(403).json({
            success: false,
            message: "Invalid or expired CSRF token"
        });
    }

    next();
};


const csrfProtection = (req, res, next) => {
    if (!req.user) {
        return next();
    }

    const token = generateCSRFToken(req.user._id);

    res.locals.csrfToken = token;
    res.setHeader('X-CSRF-Token', token);

    next();
};

module.exports = {
    csrfProtection,
    verifyCSRFToken,
    generateCSRFToken
};
