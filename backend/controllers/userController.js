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
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: "Registration successful",
            token,
            user: {
                _id: user._id,
                full_name: user.full_name,
                email: user.email
            }
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
            process.env.JWT_SECRET || "your-secret-key",
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

//admin
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        delete updates.password;
        delete updates.email;

        const user = await User.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while updating user"
        });
    }
};

//admin
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        await Promise.all([
            User.findByIdAndDelete(id),
            Profile.findOneAndDelete({ user: id })
        ]);

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while deleting user"
        });
    }
};

module.exports = {
    register,
    verifyOTP,
    login,
    updateUser,
    deleteUser
};
