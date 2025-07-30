const User = require('../models/user');

const adminAuth = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

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
