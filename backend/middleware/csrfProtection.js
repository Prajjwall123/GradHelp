const crypto = require('crypto');

// In-memory store for CSRF tokens (in production, use Redis or similar)
const csrfTokens = new Map();

/**
 * Generate a new CSRF token and store it in memory
 * @param {string} userId - The user's ID
 * @returns {string} The generated CSRF token
 */
const generateCSRFToken = (userId) => {
    const token = crypto.randomBytes(32).toString('hex');
    // Store token with 1-hour expiration
    csrfTokens.set(userId, {
        token,
        expiresAt: Date.now() + 3600000 // 1 hour
    });
    return token;
};

/**
 * Middleware to verify CSRF token
 */
const verifyCSRFToken = (req, res, next) => {
    // Skip CSRF check for GET, HEAD, OPTIONS requests
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
        return next();
    }

    const token = req.headers["x-csrf-token"] || req.body._csrf;
    // Use userId if authenticated, else fallback to IP+UA for unauthenticated routes (like login)
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

    // Check if token exists and is not expired
    if (!storedToken || storedToken.token !== token || storedToken.expiresAt < Date.now()) {
        return res.status(403).json({
            success: false,
            message: "Invalid or expired CSRF token"
        });
    }

    // Token is valid, proceed to the next middleware
    next();
};

/**
 * Middleware to generate and attach CSRF token to response
 */
const csrfProtection = (req, res, next) => {
    if (!req.user) {
        return next();
    }

    // Generate new token for each request
    const token = generateCSRFToken(req.user._id);

    // Attach token to response locals and headers
    res.locals.csrfToken = token;
    res.setHeader('X-CSRF-Token', token);

    next();
};

module.exports = {
    csrfProtection,
    verifyCSRFToken,
    generateCSRFToken
};
