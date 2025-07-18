const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true
    },
    message: {
        type: String,
        required: [true, 'Notification message is required'],
        trim: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    // Reference to the related entity (e.g., application, scholarship, etc.)
    relatedEntity: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'onModel'
    },
    // Dynamic reference to different models
    onModel: {
        type: String,
        enum: ['Application', 'Scholarship', 'User'],
        required: false
    }
}, {
    timestamps: true
});

// Index for frequently queried fields
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

// Add a virtual for formatted date
notificationSchema.virtual('time').get(function () {
    return this.createdAt;
});

// Ensure virtuals are included in toJSON output
notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Notification', notificationSchema);
