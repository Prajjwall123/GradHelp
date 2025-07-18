const mongoose = require('mongoose');

const scholarshipApplicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true
    },
    scholarship: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Scholarship',
        required: true
    },
    application: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'under_review', 'accepted', 'rejected'],
        default: 'pending'
    },
    acceptanceLetter: {
        type: String,
        default: null
    },
    rejectionLetter: {
        type: String,
        default: null
    },
    acceptedAt: {
        type: Date,
        default: null
    },
    rejectedAt: {
        type: Date,
        default: null
    },
    message: {
        type: String,
        trim: true
    }
}, { timestamps: true });

// Prevent duplicate applications
scholarshipApplicationSchema.index({ user: 1, scholarship: 1 }, { unique: true });

// Add a method to check if the application is eligible for scholarship
scholarshipApplicationSchema.methods.isEligibleForScholarship = async function () {
    const application = await mongoose.model('Application').findById(this.application);
    return application && application.status !== 'rejected';
};

module.exports = mongoose.model('ScholarshipApplication', scholarshipApplicationSchema);
