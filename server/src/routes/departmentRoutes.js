
/**
 * @swagger
 * tags:
 *   name: Departments
 *   description: API routes for managing departments
 */

/**
 * @swagger
 * /departments:
 *   get:
 *     summary: Get all departments
 *     tags: [Departments]
 *     responses:
 *       200:
 *         description: A list of departments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Department'
 *   post:
 *     summary: Create a new department
 *     tags: [Departments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Department'
 *     responses:
 *       201:
 *         description: The created department
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Department'
 */

/**
 * @swagger
 * /departments/{id}:
 *   get:
 *     summary: Get a department by ID
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: The department
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Department'
 *   put:
 *     summary: Update a department
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Department'
 *     responses:
 *       200:
 *         description: The updated department
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Department'
 *   delete:
 *     summary: Delete a department
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: The department was deleted
 */
const express = require('express');
const router = express.Router();
const {
    createDepartment,
    getDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
} = require('../controllers/departmentController');

const { protect, authorize } = require('../middleware/authMiddleware');
const { validateDepartment } = require('../middleware/validationMiddleware');

router
    .route('/')
    .get(getDepartments)
    .post(/*protect, authorize(['ADMIN']),*/ validateDepartment, createDepartment);

router
    .route('/:id')
    .get(getDepartmentById)
    .put(protect, authorize(['ADMIN']), validateDepartment, updateDepartment)
    .delete(protect, authorize(['ADMIN']), deleteDepartment);

module.exports = router;
