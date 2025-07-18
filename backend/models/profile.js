const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    full_name: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    gender: {
        type: String,
    },
    address: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    highest_education_level: {
        type: String,
    },
    institution_name: {
        type: String,
        trim: true
    },
    field_of_study: {
        type: String,
        trim: true
    },
    education_transcript: {
        type: String,
        trim: true
    },
    english_transcript: {
        type: String,
        trim: true
    },
    graduation_year: {
        type: Number,
        min: 1900,
        max: new Date().getFullYear() + 10
    },
    currently_enrolled: {
        type: Boolean,
        default: false
    },
    visa_application_country: {
        type: String,
        trim: true
    },
    visa_type: {
        type: String,
        trim: true
    },
    application_date: {
        type: Date
    },
    status: {
        type: String,
        trim: true
    },
    currently_hold_a_visa: {
        type: Boolean,
        default: false
    },
    first_language: {
        type: String,
    },
    date_of_birth: {
        type: Date
    },
    previous_visa_application: {
        type: Boolean,
        default: false
    },
    application_country: {
        type: String,
    },
    application_year: {
        type: Number,
        min: 2000,
        max: new Date().getFullYear() + 1
    },
    other_visa_information: {
        type: String,
        trim: true
    },
    final_grade: {
        type: String,
    },
    graduation_status: {
        type: Boolean,
        default: false
    },
    english_test: {
        test_type: {
            type: String,
            default: null
        },
        reading: {
            type: Number,
            min: 0,
            max: 9.5,
            default: null
        },
        speaking: {
            type: Number,
            min: 0,
            max: 9.5,
            default: null
        },
        writing: {
            type: Number,
            min: 0,
            max: 9.5,
            default: null
        },
        listening: {
            type: Number,
            min: 0,
            max: 9.5,
            default: null
        },
        exam_date: {
            type: Date,
            default: null
        }
    }
}, {
    timestamps: true
});

profileSchema.index({ email: 1 });
profileSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model('Profile', profileSchema);