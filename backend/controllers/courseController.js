const mongoose = require('mongoose');
const Course = require("../models/course");
const University = require("../models/university")

const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .populate({
                path: 'university',
                select: 'university_name city country university_photo'
            })
            .lean(); // Convert to plain JavaScript object

        // Format the response to include university details at the root level
        const formattedCourses = courses.map(course => {
            const { university, ...courseData } = course;
            return {
                ...courseData,
                university: {
                    _id: university?._id,
                    name: university?.university_name,
                    location: `${university?.city}, ${university?.country}`,
                    photo: university?.university_photo
                        ? `/api/images/${university.university_photo}`
                        : null
                }
            };
        });

        res.status(200).json(formattedCourses);
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ message: error.message });
    }
};

const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findById(id)
            .populate({
                path: 'university',
                select: 'university_name city country university_photo'
            })
            .lean(); // Convert to plain JavaScript object

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Format the response to include university details at the root level
        const { university, ...courseData } = course;
        const formattedCourse = {
            ...courseData,
            university: {
                _id: university?._id,
                name: university?.university_name,
                location: `${university?.city}, ${university?.country}`,
                photo: university?.university_photo
                    ? `/api/images/${university.university_photo}`
                    : null
            }
        };

        res.status(200).json(formattedCourse);
    } catch (error) {
        console.error("Error fetching course:", error);
        res.status(500).json({ message: error.message });
    }
};

const updateCourse = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const course = await Course.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        }).populate("university");

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.status(200).json(course);
    } catch (error) {
        console.error("Error updating course:", error);
        res.status(400).json({ message: error.message });
    }
};

const deleteCourse = async (req, res) => {
    const { id } = req.params;

    try {
        const course = await Course.findByIdAndDelete(id);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.status(200).json({ message: "Course deleted successfully" });
    } catch (error) {
        console.error("Error deleting course:", error);
        res.status(500).json({ message: error.message });
    }
};

const createCourse = async (req, res) => {
    try {
        const university = await University.findById(req.body.university);
        if (!university) {
            return res.status(404).json({ message: "University not found" });
        }

        const course = new Course(req.body);
        const savedCourse = await course.save();

        if (!university.courses.includes(savedCourse._id)) {
            university.courses.push(savedCourse._id);
            await university.save();
        }

        res.status(201).json(savedCourse);
    } catch (error) {
        console.error("Error creating course:", error);
        res.status(400).json({
            message: error.message,
            error: error.toString()
        });
    }
};


module.exports = {
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    createCourse,
};
