const prisma = require('../config/prismaClient');

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (Admin)
const createCourse = async (req, res) => {
    const { name, departmentId } = req.body;
    try {
        const course = await prisma.course.create({
            data: { name, departmentId },
        });
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
    try {
        const courses = await prisma.course.findMany({
            include: {
                department: true,
            },
        });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

// @desc    Get a single course
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res) => {
    const { id } = req.params;
    try {
        const course = await prisma.course.findUnique({
            where: { id: parseInt(id) },
        });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

// @desc    Update a course
// @route   PATCH /api/courses/:id
// @access  Private (Admin)
const updateCourse = async (req, res) => {
    const { id } = req.params;
    const { name, departmentId } = req.body;
    try {
        const course = await prisma.course.update({
            where: { id: parseInt(id) },
            data: { name, departmentId },
        });
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private (Admin)
const deleteCourse = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.course.delete({
            where: { id: parseInt(id) },
        });
        res.json({ message: 'Course removed' });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

module.exports = {
    createCourse,
    getCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
};