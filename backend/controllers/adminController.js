const User = require('../models/user');
const Application = require('../models/application');
const ScholarshipApplication = require('../models/scholarshipApplication');
const Course = require('../models/course');
const University = require('../models/university');
const Log = require('../models/Log');

const getDashboardStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalApplications,
            totalScholarshipApps,
            totalCourses,
            totalUniversities,
            pendingApplications,
            pendingScholarships,
            recentLogs
        ] = await Promise.all([
            User.countDocuments(),
            Application.countDocuments(),
            ScholarshipApplication.countDocuments(),
            Course.countDocuments(),
            University.countDocuments(),
            Application.countDocuments({ status: 'pending' }),
            ScholarshipApplication.countDocuments({ status: 'pending' }),
            Log.find().sort({ createdAt: -1 }).limit(10)
        ]);

        res.json({
            success: true,
            data: {
                users: totalUsers,
                applications: totalApplications,
                scholarshipApplications: totalScholarshipApps,
                courses: totalCourses,
                universities: totalUniversities,
                pending: {
                    applications: pendingApplications,
                    scholarships: pendingScholarships
                },
                recentActivity: recentLogs
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics'
        });
    }
};

module.exports = {
    getDashboardStats
};