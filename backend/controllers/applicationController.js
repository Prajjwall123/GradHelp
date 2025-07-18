const Application = require("../models/application");
const Profile = require("../models/profile");
const Course = require("../models/course");

const getApplicationsByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find the profile for the given user and populate the user details
        const profile = await Profile.findOne({ user: userId })
            .populate('user', 'full_name email');

        if (!profile) {
            return res.status(404).json({ message: "Profile not found for this user" });
        }

        // Find all applications for this profile
        const applications = await Application.find({ profile: profile._id })
            .populate({
                path: 'course',
                populate: {
                    path: 'university',
                    select: 'university_name city country university_photo'
                }
            })
            .sort({ appliedAt: -1 });

        // Convert profile to a plain object and remove sensitive data if needed
        const profileData = profile.toObject();

        // Add profile data to each application
        const applicationsWithProfile = applications.map(app => ({
            ...app.toObject(),
            profile: {
                ...profileData,
                // Ensure we don't expose sensitive data
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
        const { userId, courseId, intake } = req.body;

        // Find the profile for the given user
        const profile = await Profile.findOne({ user: userId });

        if (!profile) {
            return res.status(404).json({ message: "Profile not found for this user" });
        }

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Check if application already exists
        const existingApplication = await Application.findOne({
            profile: profile._id,
            course: courseId
        });

        if (existingApplication) {
            return res.status(400).json({ message: "Application already exists for this course" });
        }

        const application = new Application({
            profile: profile._id,  // Store the profile ID in the model
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

        res.json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getApplicationsByProfile = async (req, res) => {
    try {
        const applications = await Application.find({ profile: req.params.profileId })
            .populate('course')
            .sort({ appliedAt: -1 });

        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const application = await Application.findByIdAndUpdate(
            req.params.id,
            {
                status,
                updatedAt: Date.now()
            },
            { new: true }
        );

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        res.json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteApplication = async (req, res) => {
    try {
        const application = await Application.findByIdAndDelete(req.params.id);

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        res.json({ message: "Application deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update SOP for an application
const updateApplicationSOP = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { sop, userId } = req.body;

        if (!sop) {
            return res.status(400).json({ message: "SOP content is required" });
        }

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const application = await Application.findById(applicationId);

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        // Check if the user making the request owns this application
        const profile = await Profile.findOne({ user: userId });
        if (!profile || !application.profile.equals(profile._id)) {
            return res.status(403).json({ message: "Not authorized to update this application" });
        }

        // Update the SOP and set the status to under_review
        application.sop = sop;
        application.status = 'under_review';
        application.updatedAt = Date.now();

        await application.save();

        res.json({
            message: "SOP updated successfully",
            application: {
                id: application._id,
                status: application.status,
                sop: application.sop
            }
        });
    } catch (error) {
        console.error("Error updating SOP:", error);
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
    updateApplicationSOP
};
