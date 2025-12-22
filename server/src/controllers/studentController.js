const bcrypt = require('bcryptjs'); // Ensure bcryptjs is used for password hashing
const prisma = require('../config/prismaClient');

// Helper to handle common Prisma errors

const handlePrismaError = (res, error, modelName) => {
    console.error(`Prisma error in ${modelName} operations:`, error);
    if (error.code === 'P2002') {
        return res.status(409).json({ message: `${modelName} with this unique field already exists.`, details: error.meta.target });
    }
    if (error.code === 'P2025') {
        return res.status(404).json({ message: `${modelName} not found.`, details: error.meta.cause });
    }
    return res.status(500).json({ message: `An unexpected error occurred during ${modelName} operation.`, error: error.message });
};


// @desc    Create a new student
// @route   POST /api/students
// @access  Private (Admin)
const createStudent = async (req, res) => {
    const { email, password, name, departmentId, parentWhatsappNumber, batch } = req.body;

    try {
        // First create the User entry
        const user = await prisma.user.create({
            data: {
                email,
                password: await bcrypt.hash(password, 10), // Hash password before storing
                name,
                role: 'STUDENT',
            },
        });

        // Then create the Student entry, linking it to the User
        const student = await prisma.student.create({
            data: {
                userId: user.id,
                departmentId: parseInt(departmentId),
                parentWhatsappNumber,
                batch,
            },
            include: {
                user: true,
                department: true,
            }
        });

        res.status(201).json({ user: user, student: student });
    } catch (error) {
        handlePrismaError(res, error, 'Student/User');
    }
};

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin, Faculty)
const getStudents = async (req, res) => {
    try {
        const students = await prisma.student.findMany({
            include: {
                user: true,
                department: true,
            },
        });
        res.json(students);
    } catch (error) {
        handlePrismaError(res, error, 'Student');
    }
};

// @desc    Get a single student
// @route   GET /api/students/:id
// @access  Private (Admin, Faculty, or Student themselves)
const getStudentById = async (req, res) => {
    const { id } = req.params;
    try {
        const student = await prisma.student.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: true,
                department: true,
                attendances: true,
                marks: true,
            },
        });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        handlePrismaError(res, error, 'Student');
    }
};

// @desc    Update a student
// @route   PUT /api/students/:id
// @access  Private (Admin)
const updateStudent = async (req, res) => {
    const { id } = req.params; // Student profile ID
    const { name, email, password, departmentId, parentWhatsappNumber, batch } = req.body;

    try {
        const existingStudent = await prisma.student.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingStudent) {
            return res.status(404).json({ message: 'Student profile not found.' });
        }

        // Update User information
        const updatedUser = await prisma.user.update({
            where: { id: existingStudent.userId },
            data: {
                name: name || existingStudent.user.name,
                email: email || existingStudent.user.email,
                password: password ? await bcrypt.hash(password, 10) : existingStudent.user.password,
            },
        });

        // Update Student profile information
        const updatedStudent = await prisma.student.update({
            where: { id: parseInt(id) },
            data: {
                departmentId: departmentId ? parseInt(departmentId) : existingStudent.departmentId,
                parentWhatsappNumber: parentWhatsappNumber || existingStudent.parentWhatsappNumber,
                batch: batch || existingStudent.batch,
            },
            include: { user: true, department: true }
        });

        res.json({ user: updatedUser, student: updatedStudent });
    } catch (error) {
        handlePrismaError(res, error, 'Student/User');
    }
};

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Private (Admin)
const deleteStudent = async (req, res) => {
    const { id } = req.params; // Student profile ID
    try {
        const existingStudent = await prisma.student.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingStudent) {
            return res.status(404).json({ message: 'Student profile not found.' });
        }

        // Delete the student profile first
        await prisma.student.delete({
            where: { id: parseInt(id) },
        });

        // Then delete the associated user (which will also delete related records via cascade)
        await prisma.user.delete({
            where: { id: existingStudent.userId },
        });

        res.status(204).send();
    } catch (error) {
        handlePrismaError(res, error, 'Student/User');
    }
};

// @desc    Get attendance for the authenticated student
// @route   GET /api/students/me/attendance
// @access  Private (Student)
const getStudentAttendance = async (req, res) => {
    const userId = req.user.id; // User ID from authenticated token

    try {
        const student = await prisma.student.findUnique({
            where: { userId: userId },
        });

        if (!student) {
            return res.status(404).json({ message: 'Student profile not found for this user.' });
        }

        const attendanceRecords = await prisma.attendance.findMany({
            where: { studentId: student.id },
            include: {
                subject: true,
                class: true,
            },
            orderBy: { date: 'desc' },
        });

        res.status(200).json(attendanceRecords);
    } catch (error) {
        handlePrismaError(res, error, 'Student Attendance');
    }
};

// @desc    Get marks for the authenticated student
// @route   GET /api/students/me/marks
// @access  Private (Student)
const getStudentMarks = async (req, res) => {
    const userId = req.user.id; // User ID from authenticated token

    try {
        const student = await prisma.student.findUnique({
            where: { userId: userId },
        });

        if (!student) {
            return res.status(404).json({ message: 'Student profile not found for this user.' });
        }

        const markRecords = await prisma.mark.findMany({
            where: { studentId: student.id },
            include: {
                subject: true,
                class: true,
            },
            orderBy: { examType: 'asc' }, // Or by date if you add a date field to Mark model
        });

        res.status(200).json(markRecords);
    } catch (error) {
        handlePrismaError(res, error, 'Student Marks');
    }
};

module.exports = {
    createStudent,
    getStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    getStudentAttendance,
    getStudentMarks,
};
