const User = require('../models/user');
const OTP = require('../models/otp');
const bcrypt = require('bcryptjs');
const { sendOTPEmail } = require('../utils/email');

// @desc    Forgot password - send OTP to email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate and save OTP
        const otpRecord = await OTP.generatePasswordResetOTP(email);

        // Send OTP via email
        const emailSent = await sendOTPEmail(email, otpRecord.otp, 'password_reset');
        if (!emailSent) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(500).json({ message: 'Failed to send OTP email' });
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
            message: 'Error processing forgot password request'
        });
    }
};

// @desc    Reset password with OTP verification
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Verify OTP
        await OTP.verifyPasswordResetOTP(email, otp);

        // Update user's password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findOneAndUpdate(
            { email },
            { password: hashedPassword },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Password has been successfully reset'
        });

    } catch (error) {
        console.error('Error in resetPassword:', error);
        const statusCode = error.message.includes('Invalid or expired OTP') ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Error resetting password'
        });
    }
};

module.exports = {
    forgotPassword,
    resetPassword
};
