const User = require('../models/user');

/**
 * Middleware to check if the authenticated user is an admin
 * Must be used after the auth middleware
 */
const adminAuth = async (req, res, next) => {
    try {
        // Get user from the request (set by auth middleware)
        const user = await User.findById(req.user._id);

        // Check if user exists and is an admin
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        // User is admin, proceed to the next middleware/route handler
        next();
    } catch (error) {
        console.error('Admin auth error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while verifying admin privileges'
        });
    }
};

module.exports = adminAuth;
