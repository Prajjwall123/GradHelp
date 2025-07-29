const User = require('../models/user');
const OTP = require('../models/otp');
const bcrypt = require('bcryptjs');
const { sendOTPEmail } = require('../utils/email');

/**
 * Handles forgot password request
 * 1. Validates email
 * 2. Generates and saves OTP
 * 3. Sends OTP to user's email
 */
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'If an account with this email exists, a password reset OTP has been sent.' 
            });
        }

        // Generate and save OTP
        const otpRecord = await OTP.generatePasswordResetOTP(email);

        // Send OTP via email
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
};

/**
 * Handles password reset with OTP verification
 * 1. Validates OTP
 * 2. Updates user's password
 */
const resetPassword = async (req, res) => {
    try {
        let { email, newPassword, otp } = req.body;

        // Handle nested email object if present (from frontend)
        if (email && typeof email === 'object') {
            // Extract fields from the nested email object
            const { email: userEmail, newPassword: password, otp: userOtp } = email;
            email = userEmail;
            newPassword = newPassword || password;
            otp = otp || userOtp;
        }

        // Input validation (should be handled by Joi, but keeping as a safety check)
        if (!email || !newPassword || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email, OTP, and new password are required',
                receivedData: req.body
            });
        }

        // Verify OTP
        const isOtpValid = await OTP.verifyPasswordResetOTP(email, otp);
        if (!isOtpValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password
        const updatedUser = await User.findOneAndUpdate(
            { email: email.toLowerCase().trim() },
            { password: hashedPassword },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

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
};

module.exports = {
    forgotPassword,
    resetPassword
};
