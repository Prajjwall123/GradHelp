const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    full_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    passwordHistory: [{
        hashedPassword: { type: String, required: true },
        changedAt: { type: Date, default: Date.now }
    }],
    passwordChangedAt: { 
        type: Date, 
        default: Date.now,
        select: false
    },
    passwordExpiresAt: {
        type: Date,
        default: () => new Date(+new Date() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    mfaEnabled: { 
        type: Boolean, 
        default: false 
    },
    mfaSecret: { 
        type: String, 
        select: false 
    },
    backupCodes: [{ 
        code: { 
            type: String, 
            select: false 
        },
        used: { 
            type: Boolean, 
            default: false 
        }
    }],
    isNewUser: {
        type: Boolean,
        default: true
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

module.exports = mongoose.model('User', UserSchema);
