const University = require("../models/university");
const fs = require('fs');
const path = require('path');

const createUniversity = async (req, res) => {
    try {
        const universityData = req.body;

        if (req.file) {
            universityData.university_photo = req.file.filename;
        }

        const university = new University(universityData);
        const savedUniversity = await university.save();

        res.status(201).json({
            message: "University created successfully",
            university: savedUniversity
        });
    } catch (error) {
        console.error("Error creating university:", error);

        if (req.file) {
            const filePath = path.join(__dirname, '../images', req.file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        res.status(400).json({
            message: error.message,
            error: error.toString()
        });
    }
};

const updateUniversity = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (req.file) {
            updates.university_photo = req.file.filename;

            const oldUniversity = await University.findById(id);
            if (oldUniversity && oldUniversity.university_photo) {
                const oldFilePath = path.join(__dirname, '../images', oldUniversity.university_photo);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
        }

        const university = await University.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!university) {
            if (req.file) {
                const filePath = path.join(__dirname, '../images', req.file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            return res.status(404).json({ message: "University not found" });
        }

        res.status(200).json(university);
    } catch (error) {
        console.error("Error updating university:", error);
        res.status(400).json({ message: error.message });
    }
};

const deleteUniversity = async (req, res) => {
    try {
        const { id } = req.params;
        const university = await University.findByIdAndDelete(id);

        if (!university) {
            return res.status(404).json({ message: "University not found" });
        }

        // Delete the associated image
        if (university.university_photo) {
            const filePath = path.join(__dirname, '../images', university.university_photo);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        res.status(200).json({ message: "University deleted successfully" });
    } catch (error) {
        console.error("Error deleting university:", error);
        res.status(500).json({ message: error.message });
    }
};

const getAllUniversities = async (req, res) => {
    try {
        const universities = await University.find();
        res.status(200).json(universities);
    } catch (error) {
        console.error("Error fetching universities:", error);
        res.status(500).json({ message: error.message });
    }
};

const getUniversityById = async (req, res) => {
    try {
        const { id } = req.params;
        const university = await University.findById(id);

        if (!university) {
            return res.status(404).json({ message: "University not found" });
        }

        res.status(200).json(university);
    } catch (error) {
        console.error("Error fetching university:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createUniversity,
    updateUniversity,
    deleteUniversity,
    getAllUniversities,
    getUniversityById
};