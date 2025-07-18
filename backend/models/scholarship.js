const mongoose = require('mongoose');

const ScholarshipSchema = new mongoose.Schema({
    scholarship_name: String,
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
    institute: String,
    amount_per_year: Number,
    terms_and_conditions: String
});

module.exports = mongoose.model('Scholarship', ScholarshipSchema);
