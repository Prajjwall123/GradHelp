const path = require('path');
const fs = require('fs');

// Serve letter file
const serveLetter = (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(__dirname, '../uploads/letters', filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        // Set appropriate headers for PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        // Handle stream errors
        fileStream.on('error', (error) => {
            console.error('Error streaming file:', error);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: 'Error streaming file'
                });
            }
        });

    } catch (error) {
        console.error('Error serving file:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Serve scholarship letter (acceptance or rejection)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const serveScholarshipLetter = async (req, res) => {
    try {
        const { scholarshipAppId } = req.params;
        const { type } = req.query; // 'acceptance' or 'rejection'

        if (!['acceptance', 'rejection'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid letter type. Must be either "acceptance" or "rejection"'
            });
        }

        // Find the scholarship application
        const scholarshipApp = await ScholarshipApplication.findById(scholarshipAppId);
        if (!scholarshipApp) {
            return res.status(404).json({
                success: false,
                message: 'Scholarship application not found'
            });
        }

        // Get the appropriate letter path based on type
        const letterPath = type === 'acceptance'
            ? scholarshipApp.acceptanceLetter
            : scholarshipApp.rejectionLetter;

        if (!letterPath) {
            return res.status(404).json({
                success: false,
                message: `${type} letter not found for this application`
            });
        }

        const fullPath = path.join(__dirname, '..', letterPath);

        // Check if file exists
        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({
                success: false,
                message: 'Letter file not found on server'
            });
        }

        // Set appropriate headers for PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${path.basename(fullPath)}"`);

        // Stream the file
        const fileStream = fs.createReadStream(fullPath);
        fileStream.pipe(res);

    } catch (error) {
        console.error('Error serving scholarship letter:', error);
        res.status(500).json({
            success: false,
            message: 'Error serving scholarship letter',
            error: error.message
        });
    }
};

module.exports = {
    serveLetter,
    serveScholarshipLetter
};
