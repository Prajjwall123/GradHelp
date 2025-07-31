const Profile = require("../models/profile");
const fs = require('fs');
const path = require('path');
const { Types } = require('mongoose');


const cleanupOldFile = async (userId, fieldName) => {
    try {
        const profile = await Profile.findOne({ user: userId });
        if (!profile) return;

        const oldFilePath = profile[fieldName];
        if (oldFilePath) {
            const fullPath = path.join(__dirname, '..', oldFilePath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        }
    } catch (error) {
        console.error(`Error cleaning up old ${fieldName}:`, error);
    }
};

const createProfile = async (userId, profileData = {}) => {
    try {
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
        console.log('getProfile - req.user:', req.user); 
        
        if (!req.user || !req.user._id) {
            console.error('No user ID found in request');
            return res.status(401).json({
                success: false,
                message: 'User not authenticated',
                code: 'UNAUTHENTICATED'
            });
        }

        const userId = req.user._id;
        console.log('User ID from token:', userId);

        if (!Types.ObjectId.isValid(userId)) {
            console.error('Invalid user ID format:', userId);
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format',
                code: 'INVALID_USER_ID'
            });
        }

        console.log('Looking up profile for user ID:', userId);
        const profile = await Profile.findOne({ user: userId })
            .populate('user', 'full_name email')
            .lean();

        console.log('Profile lookup result:', profile);

        if (!profile) {
            console.log('No profile found, creating default profile for user:', userId);
            try {
                const newProfile = await createProfile(userId);
                console.log('Created new default profile:', newProfile);
                return res.status(200).json({
                    success: true,
                    profile: newProfile
                });
            } catch (createError) {
                console.error('Error creating default profile:', createError);
                throw createError;
            }
        }

        console.log('Returning existing profile for user:', userId);
        res.status(200).json({
            success: true,
            profile
        });
    } catch (error) {
        console.error('Error in getProfile:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code,
            keyValue: error.keyValue,
            errors: error.errors
        });
        
        res.status(500).json({
            success: false,
            message: 'Server error while fetching profile',
            error: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
                code: error.code
            } : {}
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const updateData = { ...req.body };

        
        if (req.files) {
            if (req.files['education_transcript']) {
                await cleanupOldFile(userId, 'education_transcript');
                updateData.education_transcript = req.files['education_transcript'][0].path;
            }
            if (req.files['english_transcript']) {
                await cleanupOldFile(userId, 'english_transcript');
                updateData.english_test = updateData.english_test || {};
                updateData.english_test.transcript = req.files['english_transcript'][0].path;
            }
        }

        
        const profile = await Profile.findOneAndUpdate(
            { user: userId },
            { $set: updateData },
            { new: true, runValidators: true, context: 'query' }
        ).populate('user', 'full_name email');

        if (!profile) {
            
            const newProfile = await createProfile(userId, updateData);
            return res.status(201).json({
                success: true,
                message: 'Profile created successfully',
                profile: newProfile
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            profile
        });
    } catch (error) {
        console.error('Error updating profile:', error);

        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while updating profile',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

module.exports = {
    createProfile,
    getProfile,
    updateProfile
};