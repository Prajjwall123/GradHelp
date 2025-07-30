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
        console.log('Auth middleware - Headers:', req.headers);

        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        console.log('Auth header:', authHeader);

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.error('No token provided or invalid format');
            return res.status(401).json({
                success: false,
                message: 'No token provided or invalid token format',
                code: 'MISSING_AUTH_TOKEN'
            });
        }

        const token = authHeader.split(' ')[1];
        console.log('Extracted token:', token ? '***' + token.slice(-8) : 'none');

        if (!token) {
            console.error('No token found in auth header');
            return res.status(401).json({
                success: false,
                message: 'No token provided',
                code: 'NO_TOKEN'
            });
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
            console.log('Decoded token:', { id: decoded?.sub, exp: decoded?.exp });
        } catch (jwtError) {
            console.error('JWT verification failed:', jwtError.message);
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token',
                code: 'INVALID_TOKEN',
                error: jwtError.message
            });
        }

        if (!decoded) {
            console.error('Token verification returned no payload');
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token',
                code: 'INVALID_TOKEN'
            });
        }

        // Check if user still exists
        const user = await User.findById(decoded.sub).select('-password');
        console.log('User found:', user ? user._id : 'not found');

        if (!user) {
            console.error('User not found in database');
            return res.status(401).json({
                success: false,
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }

        // Check if user is active
        if (user.status && user.status !== 'active') {
            console.error('User account is not active');
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
        console.log('Authentication successful for user:', user._id);

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication failed',
            code: 'AUTH_ERROR',
            error: error.message
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
            console.error('No user in request - auth middleware not called first');
            return res.status(401).json({
                success: false,
                message: 'Not authorized',
                code: 'UNAUTHORIZED'
            });
        }

        if (!roles.includes(req.user.role)) {
            console.error(`User role ${req.user.role} not in required roles:`, roles);
            return res.status(403).json({
                success: false,
                message: 'Forbidden - Insufficient permissions',
                code: 'FORBIDDEN'
            });
        }

        next();
    };
};

module.exports = {
    auth,
    authorize
};
