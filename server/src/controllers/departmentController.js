const prisma = require('../config/prismaClient');

// @desc    Create a new department
// @route   POST /api/departments
// @access  Private (Admin)
const createDepartment = async (req, res) => {
  const { name, branchId } = req.body;
  try {
    const department = await prisma.department.create({
      data: { name, branchId: parseInt(branchId) },
    });
    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public
const getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// @desc    Get a single department
// @route   GET /api/departments/:id
// @access  Public
const getDepartmentById = async (req, res) => {
  const { id } = req.params;
  try {
    const department = await prisma.department.findUnique({
      where: { id: parseInt(id) },
    });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.json(department);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// @desc    Update a department
// @route   PATCH /api/departments/:id
// @access  Private (Admin)
const updateDepartment = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const department = await prisma.department.update({
      where: { id: parseInt(id) },
      data: { name },
    });
    res.json(department);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// @desc    Delete a department
// @route   DELETE /api/departments/:id
// @access  Private (Admin)
const deleteDepartment = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.department.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Department removed' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};