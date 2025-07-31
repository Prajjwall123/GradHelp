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


refreshTokenSchema.index({ token: 1 });
refreshTokenSchema.index({ user: 1 });


refreshTokenSchema.virtual('isExpired').get(function () {
    return Date.now() >= this.expiresAt;
});


refreshTokenSchema.virtual('isActive').get(function () {
    return !this.revoked && !this.isExpired;
});


refreshTokenSchema.statics.generateToken = function () {
    return crypto.randomBytes(40).toString('hex');
};


refreshTokenSchema.pre('save', function (next) {
    if (this.isModified('token')) {
        this.token = crypto.createHash('sha256').update(this.token).digest('hex');
    }
    next();
});

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken;
