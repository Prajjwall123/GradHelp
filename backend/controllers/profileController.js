const Profile = require("../models/profile");
const fs = require('fs');
const path = require('path');
const { Types } = require('mongoose');

const cleanupOldFile = async (userId, fieldName) => {
    try {
        if (!Types.ObjectId.isValid(userId)) {
            throw new Error('Invalid user ID');
        }

        const existingProfile = await Profile.findOne({ user: userId });
        if (existingProfile?.[fieldName]) {
            const oldFilePath = path.join(__dirname, `../uploads/transcripts/${fieldName}`, existingProfile[fieldName]);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }
    } catch (error) {
        console.error('Error cleaning up old file:', error);
        throw error;
    }
};

const createProfile = async (userId, profileData = {}) => {
    try {
        if (!Types.ObjectId.isValid(userId)) {
            throw new Error('Invalid user ID');
        }

        const profile = new Profile({
            user: userId,
            ...profileData
        });

        await profile.save();
        return profile;
    } catch (error) {
        console.error('Error creating profile:', error);
        throw error;
    }
};

const getProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        if (!Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        const profile = await Profile.findOne({ user: userId })
            .populate('user', 'full_name email')
            .lean();

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });
        }

        res.json({
            success: true,
            data: profile
        });
    } catch (error) {
        console.error('Error getting profile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        if (!Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        const updates = { ...req.validatedData };

        if (req.files?.education_transcript) {
            try {
                await cleanupOldFile(userId, 'education_transcript');
                updates.education_transcript = req.files.education_transcript[0].filename;
            } catch (error) {
                console.error('Error handling education transcript:', error);
            }
        }

        if (req.files?.english_transcript) {
            try {
                await cleanupOldFile(userId, 'english_transcript');
                updates.english_transcript = req.files.english_transcript[0].filename;
            } catch (error) {
                console.error('Error handling English test transcript:', error);
            }
        }

        const profile = await Profile.findOneAndUpdate(
            { user: userId },
            { $set: updates },
            {
                new: true,
                runValidators: true,
                context: 'query'
            }
        );

        if (!profile) {
            const newProfile = await createProfile(userId, updates);
            return res.status(201).json({
                success: true,
                message: 'Profile created successfully',
                data: newProfile
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: profile
        });
    } catch (error) {
        console.error('Error updating profile:', error);

        if (req.files) {
            Object.values(req.files).forEach(fileArray => {
                fileArray.forEach(file => {
                    try {
                        const filePath = path.join(__dirname, `../uploads/transcripts/${file.fieldname}`, file.filename);
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                        }
                    } catch (fileError) {
                        console.error('Error cleaning up file:', fileError);
                    }
                });
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    createProfile,
    getProfile,
    updateProfile
};