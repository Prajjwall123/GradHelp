const Scholarship = require("../models/scholarship");
const University = require("../models/university");

const getAllScholarships = async (req, res) => {
    try {
        const scholarships = await Scholarship.find();
        res.status(200).json(scholarships);
    } catch (error) {
        console.error("Error fetching scholarships:", error);
        res.status(500).json({ message: error.message });
    }
};

const getScholarshipById = async (req, res) => {
    const { id } = req.params;
    try {
        const scholarship = await Scholarship.findById(id);

        if (!scholarship) {
            return res.status(404).json({ message: "Scholarship not found" });
        }

        res.status(200).json(scholarship);
    } catch (error) {
        console.error("Error fetching scholarship:", error);
        res.status(500).json({ message: error.message });
    }
};

const updateScholarship = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const scholarship = await Scholarship.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });

        if (!scholarship) {
            return res.status(404).json({ message: "Scholarship not found" });
        }

        res.status(200).json(scholarship);
    } catch (error) {
        console.error("Error updating scholarship:", error);
        res.status(400).json({ message: error.message });
    }
};

const deleteScholarship = async (req, res) => {
    const { id } = req.params;

    try {
        const scholarship = await Scholarship.findByIdAndDelete(id);

        if (!scholarship) {
            return res.status(404).json({ message: "Scholarship not found" });
        }

        res.status(200).json({ message: "Scholarship deleted successfully" });
    } catch (error) {
        console.error("Error deleting scholarship:", error);
        res.status(500).json({ message: error.message });
    }
};

const createScholarship = async (req, res) => {
    try {
        // 1. First validate that the university exists
        const university = await University.findById(req.body.university);
        if (!university) {
            return res.status(404).json({ message: "University not found" });
        }

        // 2. Create and save the scholarship
        const scholarship = new Scholarship(req.body);
        const savedScholarship = await scholarship.save();

        // 3. Add scholarship to university's scholarships array if not already present
        if (!university.scholarships.includes(savedScholarship._id)) {
            university.scholarships.push(savedScholarship._id);
            await university.save();
        }

        res.status(201).json(savedScholarship);
    } catch (error) {
        console.error("Error creating scholarship:", error);
        res.status(400).json({
            message: error.message,
            error: error.toString()
        });
    }
};

// In scholarshipController.js
const getScholarshipsByUniversity = async (req, res) => {
    try {
        const { universityId } = req.params;

        // Validate if university exists
        const university = await University.findById(universityId);
        if (!university) {
            return res.status(404).json({ message: "University not found" });
        }

        const scholarships = await Scholarship.find({ university: universityId })
            .select('-__v')  // Exclude version key
            .lean();  // Convert to plain JavaScript object

        res.status(200).json({
            university: {
                _id: university._id,
                name: university.university_name
            },
            scholarships
        });
    } catch (error) {
        console.error("Error fetching scholarships by university:", error);
        res.status(500).json({
            message: "Error fetching scholarships",
            error: error.message
        });
    }
};

module.exports = {
    getAllScholarships,
    getScholarshipById,
    updateScholarship,
    deleteScholarship,
    createScholarship,
    getScholarshipsByUniversity
};
