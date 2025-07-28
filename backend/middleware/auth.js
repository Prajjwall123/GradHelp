const jwt = require('jsonwebtoken');
const User = require('../models/user');
const TokenService = require('../services/tokenService');

// Load environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

/**
 * Middleware to authenticate requests using JWT
 */
const auth = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided or invalid token format',
                code: 'MISSING_AUTH_TOKEN'
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided',
                code: 'NO_TOKEN'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token',
                code: 'INVALID_TOKEN'
            });
        }

        // Check if user still exists
        const user = await User.findById(decoded.sub).select('-password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }

        // Check if user is active
        if (user.status && user.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'User account is not active',
                code: 'ACCOUNT_INACTIVE'
            });
        }

        // Attach user to request object
        req.user = {
            _id: user._id,
            email: user.email,
            role: user.role,
            full_name: user.full_name
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({
            success: false,
            message: 'Authentication failed',
            code: 'AUTH_FAILED',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Middleware to check if user has required role(s)
 * @param {...String} roles - Allowed roles
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'AUTH_REQUIRED'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this resource',
                code: 'UNAUTHORIZED_ROLE'
            });
        }

        next();
    };
};

module.exports = {
    auth,
    authorize
};
