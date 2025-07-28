const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    level: {
        type: String,
        enum: ['error', 'warn', 'info', 'http', 'debug'],
        default: 'info'
    },
    message: {
        type: String,
        required: true
    },
    method: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    statusCode: {
        type: Number
    },
    responseTime: {
        type: Number,
        description: 'Response time in ms'
    },
    ip: {
        type: String
    },
    userAgent: {
        type: String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    requestBody: {
        type: mongoose.Schema.Types.Mixed
    },
    queryParams: {
        type: mongoose.Schema.Types.Mixed
    },
    error: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
logSchema.index({ createdAt: -1 });
logSchema.index({ level: 1 });
logSchema.index({ path: 1 });
logSchema.index({ method: 1 });
logSchema.index({ statusCode: 1 });
logSchema.index({ userId: 1 });

const Log = mongoose.model('Log', logSchema);

module.exports = Log;
