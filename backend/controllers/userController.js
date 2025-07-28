const User = require("../models/user");
const OTP = require("../models/otp");
const Profile = require("../models/profile");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOTPEmail } = require("../utils/email");
const Joi = require("joi");

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const register = async (req, res) => {
    try {
        const { full_name, email, password } = req.body;

        const existingUser = await User.findOne({ email: { $eq: email } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        const otpEntry = new OTP({
            full_name: full_name,
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            otp,
            expiresAt
        });

        await otpEntry.save();

        const emailSent = await sendOTPEmail(email, otp);
        if (!emailSent) {
            await OTP.deleteOne({ _id: otpEntry._id });
            return res.status(500).json({
                success: false,
                message: "Failed to send OTP email"
            });
        }

        res.status(201).json({
            success: true,
            message: "Registration initiated. Please check your email for OTP.",
            expiresAt
        });
    } catch (error) {
        console.error("Error in user registration:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred during registration"
        });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const otpRecord = await OTP.findOne({
            email: email.toLowerCase().trim(),
            otp,
            expiresAt: { $gt: new Date() }
        });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP"
            });
        }

        const user = new User({
            full_name: otpRecord.full_name,
            email: otpRecord.email,
            password: otpRecord.password
        });

        await user.save();

        const profile = new Profile({
            user: user._id,
            email: user.email,
            full_name: otpRecord.full_name
        });

        await profile.save();

        await OTP.deleteOne({ _id: otpRecord._id });

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: "Registration successful",
            token
        });
    } catch (error) {
        console.error("Error in OTP verification:", error);
        res.status(500).json({
            success: false,
            message: error.message || "An error occurred during verification"
        });
    }
};

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const login = async (req, res) => {
    try {
        const { error } = await loginSchema.validateAsync(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email: { $eq: email.toLowerCase().trim() } });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            success: true,
            token,
            user: {
                _id: user._id,
                full_name: user.full_name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Error in user login:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred during login"
        });
    }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Error getting all users:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching users'
        });
    }
};

// Get user by ID (admin only)
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error getting user by ID:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching the user'
        });
    }
};

// Update user (can be used by user for self or by admin for any user)
const updateUser = async (req, res) => {
    try {
        const { full_name, email, role } = req.body;
        const userId = req.params.id || req.user._id; // Get from params for admin, from token for self

        // If not admin, can only update own profile
        if (req.user.role !== 'admin' && String(userId) !== String(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this user'
            });
        }

        const updateData = { full_name, email };

        // Only allow role update for admins
        if (req.user.role === 'admin' && role) {
            updateData.role = role;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: updatedUser
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while updating the user'
        });
    }
};

// Delete user (can be used by user for self or by admin for any user)
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id || req.user._id; // Get from params for admin, from token for self

        // If not admin, can only delete own account
        if (req.user.role !== 'admin' && String(userId) !== String(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this user'
            });
        }

        // Prevent admin from deleting themselves
        if (String(userId) === String(req.user._id) && req.user.role === 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Admins cannot delete their own accounts'
            });
        }

        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Also delete associated profile
        await Profile.findOneAndDelete({ user: userId });

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while deleting the user'
        });
    }
};

module.exports = {
    register,
    verifyOTP,
    login,
    updateUser,
    deleteUser,
    getAllUsers,
    getUserById
};
