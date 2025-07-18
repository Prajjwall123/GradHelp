const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    intake: {
        type: String,
        required: true
    },
    sop: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'under_review', 'accepted', 'rejected', 'waitlisted', 'cancelled'],
        default: 'pending'
    },
    acceptanceLetter: {
        type: String, // Path to the uploaded PDF file
        default: null
    },
    rejectionLetter: {
        type: String, // Path to the uploaded PDF file
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
    appliedAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Compound index to ensure one application per profile per course
ApplicationSchema.index({ profile: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);
