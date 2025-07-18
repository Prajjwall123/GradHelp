const Profile = require("../models/profile");
const fs = require('fs');
const path = require('path');

// Helper function to handle file cleanup
const cleanupOldFile = async (userId, fieldName) => {
    const existingProfile = await Profile.findOne({ user: userId });
    if (existingProfile?.[fieldName]) {
        const oldFilePath = path.join(__dirname, `../uploads/transcripts/${fieldName}`, existingProfile[fieldName]);
        if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
        }
    }
};

const createProfile = async (userId) => {
    try {
        const profile = new Profile({ user: userId });
        await profile.save();
        return profile;
    } catch (error) {
        console.error('Error creating profile:', error);
        throw error;
    }
};

const getProfile = async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.userId })
            .populate('user', 'full_name email');

        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;

        // Handle education transcript upload if present
        if (req.files?.education_transcript) {
            await cleanupOldFile(userId, 'education_transcript');
            updates.education_transcript = req.files.education_transcript[0].filename;
        }

        // Handle English transcript upload if present
        if (req.files?.english_transcript) {
            await cleanupOldFile(userId, 'english_transcript');
            updates.english_transcript = req.files.english_transcript[0].filename;
        }

        const profile = await Profile.findOneAndUpdate(
            { user: userId },
            updates,
            { new: true, runValidators: true }
        );

        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        res.json(profile);
    } catch (error) {
        // Clean up uploaded files if there was an error
        if (req.files) {
            Object.values(req.files).forEach(fileArray => {
                fileArray.forEach(file => {
                    const filePath = path.join(__dirname, `../uploads/transcripts/${file.fieldname}`, file.filename);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                });
            });
        }

        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createProfile,
    getProfile,
    updateProfile
};