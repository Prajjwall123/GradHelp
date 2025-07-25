const User = require('../models/user');
const OTP = require('../models/otp');
const bcrypt = require('bcryptjs');
const { sendOTPEmail } = require('../utils/email');




const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;


        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        const otpRecord = await OTP.generatePasswordResetOTP(email);


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




const resetPassword = async (req, res) => {
    try {
        let email, newPassword, otp;

        if (req.body.email && typeof req.body.email === 'object') {
            email = req.body.email.email;
            newPassword = req.body.email.newPassword;
            otp = req.body.email.otp;
        } else {
            ({ email, newPassword, otp } = req.body);
        }

        if (!email || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email and new password are required',
                receivedData: req.body 
            });
        }

        if (typeof newPassword !== 'string' || newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be a string with at least 8 characters'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updatedUser = await User.findOneAndUpdate(
            { email: email.trim().toLowerCase() },
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
            error: error.message
        });
    }
};

module.exports = {
    forgotPassword,
    resetPassword
};
