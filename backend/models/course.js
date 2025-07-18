const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    course_name: String,
    course_level: {
        type: String,
        enum: ['undergraduate', 'graduate', 'postgraduate', 'diploma']
    },
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
    course_tuition: Number,
    application_fee: Number,
    course_duration: String,
    about: String,
    entry_requirements: [String],
    modules: [String],
    intake: [String],
    terms_and_conditions: [String]
});

module.exports = mongoose.model('Course', CourseSchema);
