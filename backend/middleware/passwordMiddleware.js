const User = require('../models/user');
const { sendOTPEmail } = require('../utils/email');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');


const checkPasswordExpiration = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email }).select('+passwordExpiresAt +passwordChangedAt');
        
        if (!user) {
            return next(); 
        }

        if (user.passwordExpiresAt && user.passwordExpiresAt <= new Date()) {
            const tempPassword = crypto.randomBytes(8).toString('hex');
            const hashedPassword = await bcrypt.hash(tempPassword, 10);
            user.password = hashedPassword;
            user.passwordExpiresAt = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000); 
            user.passwordChangedAt = Date.now() - 1000; 
            
            user.passwordHistory.unshift({
                hashedPassword: user.password,
                changedAt: user.passwordChangedAt
            });
            
            if (user.passwordHistory.length > 5) {
                user.passwordHistory = user.passwordHistory.slice(0, 5);
            }
            
            await user.save({ validateBeforeSave: false });
            
            await sendTemporaryPasswordEmail(user.email, tempPassword);
            
            return res.status(403).json({
                success: false,
                message: 'Your password has expired. A new temporary password has been sent to your email.'
            });
        }
        
        next();
    } catch (error) {
        console.error('Password expiration check error:', error);
        next(); 
    }
};


const sendTemporaryPasswordEmail = async (email, tempPassword) => {
    try {
        const subject = 'Your Temporary Password';
        const html = `
            <h2>Password Reset Required</h2>
            <p>Your password has expired as part of our security policy. Here's your new temporary password:</p>
            <h3 style="font-size: 24px; font-weight: bold; background-color: #f0f0f0; padding: 10px; text-align: center;">
                ${tempPassword}
            </h3>
            <p>Please log in with this temporary password and change it immediately.</p>
            <p><strong>Note:</strong> This is an automated message. Please do not reply to this email.</p>
        `;

        await sendOTPEmail(email, tempPassword, 'password_reset', subject, html);
    } catch (error) {
        console.error('Error sending temporary password email:', error);
        throw error;
    }
};


const checkPasswordHistory = async (req, res, next) => {
    try {
        const { email, newPassword } = req.body;
        
        if (!newPassword) return next();
        
        const user = await User.findOne({ email }).select('+passwordHistory');
        
        if (!user) return next();
        
        for (const entry of user.passwordHistory) {
            const isMatch = await bcrypt.compare(newPassword, entry.hashedPassword);
            if (isMatch) {
                return res.status(400).json({
                    success: false,
                    message: 'You cannot use any of your last 5 passwords. Please choose a new password.'
                });
            }
        }
        
        next();
    } catch (error) {
        console.error('Password history check error:', error);
        next(error);
    }
};

module.exports = {
    checkPasswordExpiration,
    checkPasswordHistory
};
