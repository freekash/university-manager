// server/src/controllers/adminController.js
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

// --- Branch Management ---
const createBranch = async (req, res) => {
    try {
        const branch = await prisma.branch.create({
            data: req.body,
        });
        res.status(201).json(branch);
    } catch (error) {
        handlePrismaError(res, error, 'Branch');
    }
};

const getBranches = async (req, res) => {
    try {
        const branches = await prisma.branch.findMany();
        res.status(200).json(branches);
    } catch (error) {
        handlePrismaError(res, error, 'Branch');
    }
};

const updateBranch = async (req, res) => {
    const { id } = req.params;
    try {
        const branch = await prisma.branch.update({
            where: { id: parseInt(id) },
            data: req.body,
        });
        res.status(200).json(branch);
    } catch (error) {
        handlePrismaError(res, error, 'Branch');
    }
};

const deleteBranch = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.branch.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).send();
    } catch (error) {
        handlePrismaError(res, error, 'Branch');
    }
};

// --- Department Management ---
const createDepartment = async (req, res) => {
    try {
        const department = await prisma.department.create({
            data: req.body,
        });
        res.status(201).json(department);
    } catch (error) {
        handlePrismaError(res, error, 'Department');
    }
};

const getDepartments = async (req, res) => {
    try {
        const departments = await prisma.department.findMany({
            include: { branch: true },
        });
        res.status(200).json(departments);
    } catch (error) {
        handlePrismaError(res, error, 'Department');
    }
};

const updateDepartment = async (req, res) => {
    const { id } = req.params;
    try {
        const department = await prisma.department.update({
            where: { id: parseInt(id) },
            data: req.body,
        });
        res.status(200).json(department);
    } catch (error) {
        handlePrismaError(res, error, 'Department');
    }
};

const deleteDepartment = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.department.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).send();
    } catch (error) {
        handlePrismaError(res, error, 'Department');
    }
};

// --- Semester Management ---
const createSemester = async (req, res) => {
    try {
        const semester = await prisma.semester.create({
            data: req.body,
        });
        res.status(201).json(semester);
    } catch (error) {
        handlePrismaError(res, error, 'Semester');
    }
};

const getSemesters = async (req, res) => {
    try {
        const semesters = await prisma.semester.findMany();
        res.status(200).json(semesters);
    } catch (error) {
        handlePrismaError(res, error, 'Semester');
    }
};

const updateSemester = async (req, res) => {
    const { id } = req.params;
    try {
        const semester = await prisma.semester.update({
            where: { id: parseInt(id) },
            data: req.body,
        });
        res.status(200).json(semester);
    } catch (error) {
        handlePrismaError(res, error, 'Semester');
    }
};

const deleteSemester = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.semester.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).send();
    } catch (error) {
        handlePrismaError(res, error, 'Semester');
    }
};

// --- Subject Management ---
const createSubject = async (req, res) => {
    try {
        const subject = await prisma.subject.create({
            data: req.body,
        });
        res.status(201).json(subject);
    } catch (error) {
        handlePrismaError(res, error, 'Subject');
    }
};

const getSubjects = async (req, res) => {
    try {
        const subjects = await prisma.subject.findMany({
            include: { department: true, semester: true },
        });
        res.status(200).json(subjects);
    } catch (error) {
        handlePrismaError(res, error, 'Subject');
    }
};

const updateSubject = async (req, res) => {
    const { id } = req.params;
    try {
        const subject = await prisma.subject.update({
            where: { id: parseInt(id) },
            data: req.body,
        });
        res.status(200).json(subject);
    } catch (error) {
        handlePrismaError(res, error, 'Subject');
    }
};

const deleteSubject = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.subject.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).send();
    } catch (error) {
        handlePrismaError(res, error, 'Subject');
    }
};

// --- Faculty Management ---
// Note: Faculty creation involves creating a User first, then a Faculty profile.
// This might be better handled in authController or a dedicated user management flow.
// For simplicity here, we assume user is already created or create it here.
const createFaculty = async (req, res) => {
    const { email, password, name, departmentId } = req.body;
    try {
        const newUser = await prisma.user.create({
            data: {
                email,
                password, // Password should be hashed before saving
                name,
                role: 'FACULTY',
            },
        });

        const faculty = await prisma.faculty.create({
            data: {
                userId: newUser.id,
                departmentId: parseInt(departmentId),
            },
            include: { user: true, department: true },
        });
        res.status(201).json(faculty);
    } catch (error) {
        handlePrismaError(res, error, 'Faculty/User');
    }
};

const getFaculty = async (req, res) => {
    try {
        const faculty = await prisma.faculty.findMany({
            include: { user: true, department: true },
        });
        res.status(200).json(faculty);
    } catch (error) {
        handlePrismaError(res, error, 'Faculty');
    }
};

const updateFaculty = async (req, res) => {
    const { id } = req.params; // Faculty ID
    const { email, password, name, departmentId } = req.body;
    try {
        const existingFaculty = await prisma.faculty.findUnique({ where: { id: parseInt(id) } });
        if (!existingFaculty) {
            return res.status(404).json({ message: 'Faculty not found.' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: existingFaculty.userId },
            data: { email, password, name }, // Password should be hashed before saving
        });

        const updatedFaculty = await prisma.faculty.update({
            where: { id: parseInt(id) },
            data: { departmentId: parseInt(departmentId) },
            include: { user: true, department: true },
        });
        res.status(200).json(updatedFaculty);
    } catch (error) {
        handlePrismaError(res, error, 'Faculty/User');
    }
};

const deleteFaculty = async (req, res) => {
    const { id } = req.params; // Faculty ID
    try {
        const existingFaculty = await prisma.faculty.findUnique({ where: { id: parseInt(id) } });
        if (!existingFaculty) {
            return res.status(404).json({ message: 'Faculty not found.' });
        }
        // Deleting the user will cascade delete the faculty profile due to schema
        await prisma.user.delete({
            where: { id: existingFaculty.userId },
        });
        res.status(204).send();
    } catch (error) {
        handlePrismaError(res, error, 'Faculty/User');
    }
};

module.exports = {
    createBranch, getBranches, updateBranch, deleteBranch,
    createDepartment, getDepartments, updateDepartment, deleteDepartment,
    createSemester, getSemesters, updateSemester, deleteSemester,
    createSubject, getSubjects, updateSubject, deleteSubject,
    createFaculty, getFaculty, updateFaculty, deleteFaculty,
};
