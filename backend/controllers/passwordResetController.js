const User = require('../models/user');
const OTP = require('../models/otp');
const bcrypt = require('bcryptjs');
const { sendOTPEmail } = require('../utils/email');
const { checkPasswordExpiration, checkPasswordHistory } = require('../middleware/passwordMiddleware');


const forgotPassword = [
    checkPasswordExpiration,
    async (req, res) => {
    try {
        const { email } = req.body;

        
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'If an account with this email exists, a password reset OTP has been sent.' 
            });
        }

        
        const otpRecord = await OTP.generatePasswordResetOTP(email);

        
        const emailSent = await sendOTPEmail(email, otpRecord.otp, 'password_reset');
        if (!emailSent) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(500).json({ 
                success: false,
                message: 'Failed to send OTP email. Please try again.' 
            });
        }

        res.status(200).json({
            success: true,
            message: 'Password reset OTP has been sent to your email',
            expiresAt: otpRecord.expiresAt
        });

    } catch (error) {
        console.error('Error in forgotPassword:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing forgot password request',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}];


const resetPassword = [
    checkPasswordHistory,
    async (req, res) => {
    try {
        let { email, newPassword, otp } = req.body;

        
        if (email && typeof email === 'object') {
            
            const { email: userEmail, newPassword: password, otp: userOtp } = email;
            email = userEmail;
            newPassword = newPassword || password;
            otp = otp || userOtp;
        }

        
        if (!email || !newPassword || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email, OTP, and new password are required',
                receivedData: req.body
            });
        }

        
        const isOtpValid = await OTP.verifyPasswordResetOTP(email, otp);
        if (!isOtpValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        
        user.passwordHistory.unshift({
            hashedPassword: user.password,
            changedAt: user.passwordChangedAt || new Date()
        });

        
        if (user.passwordHistory.length > 5) {
            user.passwordHistory = user.passwordHistory.slice(0, 5);
        }

        
        user.password = hashedPassword;
        user.passwordChangedAt = Date.now();
        user.passwordExpiresAt = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000); 
        
        await user.save();
        
        
        const updatedUser = await User.findById(user._id).select('-password -passwordHistory -__v');

        res.status(200).json({
            success: true,
            message: 'Password has been successfully reset'
        });

    } catch (error) {
        console.error('Error in resetPassword:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting password. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}];

module.exports = {
    forgotPassword,
    resetPassword
};
