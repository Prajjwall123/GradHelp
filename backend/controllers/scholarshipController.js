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

//admin
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

//admin
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

//admin
const createScholarship = async (req, res) => {
    try {

        const university = await University.findById(req.body.university);
        if (!university) {
            return res.status(404).json({ message: "University not found" });
        }


        const scholarship = new Scholarship(req.body);
        const savedScholarship = await scholarship.save();


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


const getScholarshipsByUniversity = async (req, res) => {
    try {
        const { universityId } = req.params;


        const university = await University.findById(universityId);
        if (!university) {
            return res.status(404).json({ message: "University not found" });
        }

        const scholarships = await Scholarship.find({ university: universityId })
            .select('-__v')
            .lean();

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
