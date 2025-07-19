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

    relatedEntity: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'onModel'
    },

    onModel: {
        type: String,
        enum: ['Application', 'Scholarship', 'User'],
        required: false
    }
}, {
    timestamps: true
});


notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });


notificationSchema.virtual('time').get(function () {
    return this.createdAt;
});


notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Notification', notificationSchema);
