const Application = require('../models/application');
const Notification = require('../models/notification');
const fs = require('fs');
const path = require('path');

// Helper function to save file and return its path
const saveFile = (file, applicationId, type) => {
    if (!file) return null;

    const uploadDir = path.join(__dirname, '../uploads/letters');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${type}_${applicationId}_${Date.now()}${path.extname(file.originalname)}`;
    const filePath = path.join(uploadDir, filename);

    // Ensure the file is written as a buffer
    fs.writeFileSync(filePath, file.buffer);
    return `/uploads/letters/${filename}`;
};

// Accept an application
const acceptApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { message } = req.body;
        const acceptanceLetter = req.file; // Changed from req.files to req.file

        console.log('Accepting application:', { applicationId, message, file: req.file });

        const application = await Application.findById(applicationId)
            .populate('profile', 'user')
            .populate('course', 'name');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Save acceptance letter if provided
        let letterPath = null;
        if (acceptanceLetter) {
            console.log('Processing acceptance letter:', acceptanceLetter);
            letterPath = saveFile(acceptanceLetter, applicationId, 'acceptance');
            console.log('Letter saved at:', letterPath);
        }

        // Update application status and save letter path
        application.status = 'accepted';
        application.acceptanceLetter = letterPath;
        application.acceptedAt = new Date();
        await application.save();

        // Create notification
        await Notification.create({
            user: application.profile.user,
            message: message || `Congratulations! Your application for ${application.course.name} has been accepted.`,
            relatedEntity: application._id,
            onModel: 'Application'
        });

        // Populate the updated application for the response
        const updatedApp = await Application.findById(applicationId)
            .populate('profile')
            .populate('course');

        res.json({
            success: true,
            message: 'Application accepted successfully',
            application: updatedApp
        });

    } catch (error) {
        console.error('Error accepting application:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Reject an application
const rejectApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { message } = req.body;
        const rejectionLetter = req.file; // Changed from req.files to req.file

        console.log('Rejecting application:', { applicationId, message, file: req.file });

        const application = await Application.findById(applicationId)
            .populate('profile', 'user')
            .populate('course', 'name');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Save rejection letter if provided
        let letterPath = null;
        if (rejectionLetter) {
            console.log('Processing rejection letter:', rejectionLetter);
            letterPath = saveFile(rejectionLetter, applicationId, 'rejection');
            console.log('Letter saved at:', letterPath);
        }

        // Update application status and save letter path
        application.status = 'rejected';
        application.rejectionLetter = letterPath;
        application.rejectedAt = new Date();
        await application.save();

        // Create notification
        await Notification.create({
            user: application.profile.user,
            message: message || `We regret to inform you that your application for ${application.course.name} has been rejected.`,
            relatedEntity: application._id,
            onModel: 'Application'
        });

        // Populate the updated application for the response
        const updatedApp = await Application.findById(applicationId)
            .populate('profile')
            .populate('course');

        res.json({
            success: true,
            message: 'Application rejected successfully',
            application: updatedApp
        });

    } catch (error) {
        console.error('Error rejecting application:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    acceptApplication,
    rejectApplication
};
