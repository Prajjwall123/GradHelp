const mongoose = require('mongoose');
const crypto = require('crypto');

const refreshTokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    revoked: {
        type: Boolean,
        default: false
    },
    revokedAt: {
        type: Date
    },
    createdByIp: {
        type: String,
        required: true
    },
    userAgent: {
        type: String
    }
}, {
    timestamps: true
});

// Add index for faster lookups
refreshTokenSchema.index({ token: 1 });
refreshTokenSchema.index({ user: 1 });

// Add method to check if token is expired
refreshTokenSchema.virtual('isExpired').get(function () {
    return Date.now() >= this.expiresAt;
});

// Add method to check if token is active
refreshTokenSchema.virtual('isActive').get(function () {
    return !this.revoked && !this.isExpired;
});

// Static method to generate a random token
refreshTokenSchema.statics.generateToken = function () {
    return crypto.randomBytes(40).toString('hex');
};

// Pre-save hook to hash the token before saving
refreshTokenSchema.pre('save', function (next) {
    if (this.isModified('token')) {
        this.token = crypto.createHash('sha256').update(this.token).digest('hex');
    }
    next();
});

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken;
