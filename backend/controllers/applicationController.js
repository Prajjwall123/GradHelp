const Application = require("../models/application");
const Profile = require("../models/profile");
const Course = require("../models/course");
const { sanitizeHTML } = require("../validations/applicationValidation");
const { hasMongoOperators } = require("../validations/applicationValidation");

const getApplicationsByUser = async (req, res) => {
    try {
        const userId = req.user._id;

        const profile = await Profile.findOne({ user: userId })
            .populate('user', 'full_name email');

        if (!profile) {
            return res.status(404).json({ message: "Profile not found for this user" });
        }

        const applications = await Application.find({ profile: profile._id })
            .populate({
                path: 'course',
                populate: {
                    path: 'university',
                    select: 'university_name city country university_photo'
                }
            })
            .sort({ appliedAt: -1 });

        const profileData = profile.toObject();

        const applicationsWithProfile = applications.map(app => ({
            ...app.toObject(),
            profile: {
                ...profileData,
                user: {
                    _id: profileData.user._id,
                    full_name: profileData.user.full_name,
                    email: profileData.user.email
                }
            }
        }));

        res.json(applicationsWithProfile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createApplication = async (req, res) => {
    try {
        const { courseId, intake } = req.body;
        const userId = req.user._id;

        const profile = await Profile.findOne({ user: userId });

        if (!profile) {
            return res.status(404).json({ message: "Profile not found for this user" });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const existingApplication = await Application.findOne({
            profile: profile._id,
            course: courseId
        });

        if (existingApplication) {
            return res.status(400).json({ message: "Application already exists for this course" });
        }

        const application = new Application({
            profile: profile._id,
            course: courseId,
            intake,
            status: 'pending'
        });

        const savedApplication = await application.save();
        res.status(201).json(savedApplication);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getApplicationById = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('profile')
            .populate('course');

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        // Verify that the application belongs to the user
        const userId = req.user._id;
        if (String(application.profile.user) !== String(userId)) {
            return res.status(403).json({ message: "Not authorized to view this application" });
        }

        res.json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getApplicationsByProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const profile = await Profile.findOne({ user: userId });

        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        const applications = await Application.find({ profile: profile._id })
            .populate('course')
            .sort({ appliedAt: -1 });

        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//admin
const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const userId = req.user._id;

        const application = await Application.findById(req.params.id)
            .populate('profile');

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        // Verify that the application belongs to the user
        if (String(application.profile.user) !== String(userId)) {
            return res.status(403).json({ message: "Not authorized to update this application" });
        }

        application.status = status;
        application.updatedAt = Date.now();
        await application.save();

        res.json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteApplication = async (req, res) => {
    try {
        const userId = req.user._id;
        const application = await Application.findById(req.params.id)
            .populate('profile');

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        // Verify that the application belongs to the user
        if (String(application.profile.user) !== String(userId)) {
            return res.status(403).json({ message: "Not authorized to delete this application" });
        }

        await application.deleteOne();
        res.json({ message: "Application deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const cleanSOPContent = (content) => {
    if (!content || typeof content !== 'string') return '';

    return content
        .replace(/\$where/gi, '')
        .replace(/\$ne/gi, '')
        .replace(/\$gt/gi, '')
        .replace(/\$lt/gi, '')
        .replace(/\$in/gi, '')
        .replace(/\$nin/gi, '')
        .replace(/\$exists/gi, '')
        .replace(/\$elemMatch/gi, '')
        .replace(/\$regex/gi, '')
        .replace(/\$options/gi, '')
        .replace(/\$\{.*?\}/g, '')
        .replace(/\$function/gi, '')
        .replace(/\$accumulator/gi, '')
        .replace(/\$addFields/gi, '')
        .replace(/\$bucket/gi, '')
        .replace(/\$collStats/gi, '')
        .replace(/\$count/gi, '')
        .replace(/\$facet/gi, '')
        .replace(/\$geoNear/gi, '')
        .replace(/\$graphLookup/gi, '')
        .replace(/\$indexStats/gi, '')
        .replace(/\$lookup/gi, '')
        .replace(/\$match/gi, '')
        .replace(/\$merge/gi, '')
        .replace(/\$out/gi, '')
        .replace(/\$planCacheStats/gi, '')
        .replace(/\$project/gi, '')
        .replace(/\$redact/gi, '')
        .replace(/\$replaceRoot/gi, '')
        .replace(/\$replaceWith/gi, '')
        .replace(/\$sample/gi, '')
        .replace(/\$search/gi, '')
        .replace(/\$set/gi, '')
        .replace(/\$unset/gi, '')
        .replace(/\$unwind/gi, '')
        .replace(/\$jsonSchema/gi, '')
        .replace(/\$text/gi, '')
        .replace(/\$type/gi, '');
};

const updateApplicationSOP = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { sop } = req.body;
        const userId = req.user._id;

        if (!sop) {
            return res.status(400).json({
                success: false,
                message: 'SOP content is required',
                errors: [{
                    field: 'sop',
                    message: 'SOP content cannot be empty'
                }]
            });
        }

        // Additional security check
        if (hasMongoOperators({ sop })) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request: potential security issue detected',
                errors: [{
                    field: 'sop',
                    message: 'Request contains potentially dangerous content'
                }]
            });
        }

        const sanitizedSOP = sanitizeHTML(sop);

        const application = await Application.findById(applicationId)
            .populate('profile');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found',
                errors: [{
                    field: 'applicationId',
                    message: 'No application found with the provided ID'
                }]
            });
        }

        // Verify that the application belongs to the user
        if (String(application.profile.user) !== String(userId)) {
            return res.status(403).json({ message: "Not authorized to update this application" });
        }

        application.sop = sanitizedSOP;
        application.status = 'under_review';
        application.updatedAt = new Date();
        await application.save();

        res.status(200).json({
            success: true,
            message: 'SOP updated and application marked for review',
            data: {
                sop: application.sop,
                status: 'under_review',
                updatedAt: application.updatedAt
            }
        });
    } catch (error) {
        console.error('Error updating SOP:', error);

        const errorMessage = process.env.NODE_ENV === 'development'
            ? error.message
            : 'An error occurred while updating the SOP';

        res.status(500).json({
            success: false,
            message: 'Failed to update SOP',
            errors: [{
                message: errorMessage
            }]
        });
    }
};

const getAllApplications = async (req, res) => {
    try {
        const applications = await Application.find()
            .populate('profile')
            .populate('course');

        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createApplication,
    getApplicationById,
    getApplicationsByProfile,
    updateApplicationStatus,
    deleteApplication,
    getApplicationsByUser,
    updateApplicationSOP,
    getAllApplications
};
