const Application = require('../models/application');
const fs = require('fs');
const path = require('path');

//admin
const saveFile = (file, applicationId, type) => {
    if (!file) return null;

    const uploadDir = path.join(__dirname, '../uploads/letters');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${type}_${applicationId}_${Date.now()}${path.extname(file.originalname)}`;
    const filePath = path.join(uploadDir, filename);


    fs.writeFileSync(filePath, file.buffer);
    return `/uploads/letters/${filename}`;
};

//admin
const acceptApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { message } = req.body;
        const acceptanceLetter = req.file;

        console.log('Accepting application:', { applicationId, message, file: req.file });

        const application = await Application.findById(applicationId)
            .populate('profile', 'user')
            .populate('course', 'name');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }


        let letterPath = null;
        if (acceptanceLetter) {
            console.log('Processing acceptance letter:', acceptanceLetter);
            letterPath = saveFile(acceptanceLetter, applicationId, 'acceptance');
            console.log('Letter saved at:', letterPath);
        }


        application.status = 'accepted';
        application.acceptanceLetter = letterPath;
        application.acceptedAt = new Date();
        await application.save();

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

//admin
const rejectApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { message } = req.body;
        const rejectionLetter = req.file;

        console.log('Rejecting application:', { applicationId, message, file: req.file });

        const application = await Application.findById(applicationId)
            .populate('profile', 'user')
            .populate('course', 'name');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }


        let letterPath = null;
        if (rejectionLetter) {
            console.log('Processing rejection letter:', rejectionLetter);
            letterPath = saveFile(rejectionLetter, applicationId, 'rejection');
            console.log('Letter saved at:', letterPath);
        }


        application.status = 'rejected';
        application.rejectionLetter = letterPath;
        application.rejectedAt = new Date();
        await application.save();

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
