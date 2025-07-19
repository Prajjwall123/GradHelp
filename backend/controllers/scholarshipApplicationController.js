const ScholarshipApplication = require('../models/scholarshipApplication');
const Application = require('../models/application');
const Scholarship = require('../models/scholarship');
const Profile = require('../models/profile');
const User = require('../models/user');

const createScholarshipApplication = async (req, res) => {
    try {
        const { scholarshipId, userId } = req.body;


        const scholarship = await Scholarship.findById(scholarshipId);
        if (!scholarship) {
            return res.status(404).json({
                success: false,
                message: 'Scholarship not found'
            });
        }


        const profile = await Profile.findOne({ user: userId });
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found for this user'
            });
        }


        const application = await Application.findOne({
            profile: profile._id
        }).populate({
            path: 'course',
            match: { university: scholarship.university }
        });

        if (!application || !application.course) {
            return res.status(400).json({
                success: false,
                message: 'You must have an active application to a course from this university to apply for the scholarship'
            });
        }


        const existingApplication = await ScholarshipApplication.findOne({
            profile: profile._id,
            scholarship: scholarshipId
        });

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied for this scholarship'
            });
        }


        const scholarshipApplication = new ScholarshipApplication({
            user: userId,
            profile: profile._id,
            application: application._id,
            scholarship: scholarshipId,
            status: 'pending'
        });

        await scholarshipApplication.save();


        const populatedApp = await ScholarshipApplication.findById(scholarshipApplication._id)
            .populate('user', 'full_name email')
            .populate('scholarship', 'name')
            .populate('application');


        const profileData = await Profile.findOne({ user: userId })
            .select('firstName lastName')
            .lean();


        const response = {
            ...populatedApp.toObject(),
            profile: profileData
        };

        res.status(201).json({
            success: true,
            data: response
        });

    } catch (error) {
        console.error('Error creating scholarship application:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error while processing scholarship application'
        });
    }
};




const getMyScholarshipApplications = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }


        const profile = await Profile.findOne({ user: userId });
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found for this user'
            });
        }


        const applications = await ScholarshipApplication.find({ user: userId })
            .populate('scholarship', 'name description deadline')
            .populate('application', 'status')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: applications.length,
            data: applications
        });

    } catch (error) {
        console.error('Error getting scholarship applications:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching scholarship applications'
        });
    }
};




const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const application = await ScholarshipApplication.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        application.status = status;
        application.updatedAt = Date.now();
        await application.save();

        res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating application status'
        });
    }
};

module.exports = {
    createScholarshipApplication,
    getMyScholarshipApplications,
    updateApplicationStatus
};
