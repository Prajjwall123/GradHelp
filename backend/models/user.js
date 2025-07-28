const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    full_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
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
