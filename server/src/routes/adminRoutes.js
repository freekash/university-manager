// server/src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Assuming these exist

// Admin routes for Branches
router.route('/branches')
    .post(/*protect, authorize(['ADMIN']),*/ adminController.createBranch)
    .get(protect, authorize(['ADMIN']), adminController.getBranches);
router.route('/branches/:id')
    .put(protect, authorize(['ADMIN']), adminController.updateBranch)
    .delete(protect, authorize(['ADMIN']), adminController.deleteBranch);

// Admin routes for Departments
router.route('/departments')
    .post(protect, authorize(['ADMIN']), adminController.createDepartment)
    .get(protect, authorize(['ADMIN']), adminController.getDepartments);
router.route('/departments/:id')
    .put(protect, authorize(['ADMIN']), adminController.updateDepartment)
    .delete(protect, authorize(['ADMIN']), adminController.deleteDepartment);

// Admin routes for Semesters
router.route('/semesters')
    .post(protect, authorize(['ADMIN']), adminController.createSemester)
    .get(protect, authorize(['ADMIN']), adminController.getSemesters);
router.route('/semesters/:id')
    .put(protect, authorize(['ADMIN']), adminController.updateSemester)
    .delete(protect, authorize(['ADMIN']), adminController.deleteSemester);

// Admin routes for Subjects
router.route('/subjects')
    .post(protect, authorize(['ADMIN']), adminController.createSubject)
    .get(protect, authorize(['ADMIN']), adminController.getSubjects);
router.route('/subjects/:id')
    .put(protect, authorize(['ADMIN']), adminController.updateSubject)
    .delete(protect, authorize(['ADMIN']), adminController.deleteSubject);

// Admin routes for Faculty
router.route('/faculty')
    .post(protect, authorize(['ADMIN']), adminController.createFaculty) // Creates user and faculty profile
    .get(protect, authorize(['ADMIN']), adminController.getFaculty);
router.route('/faculty/:id')
    .put(protect, authorize(['ADMIN']), adminController.updateFaculty)
    .delete(protect, authorize(['ADMIN']), adminController.deleteFaculty);


module.exports = router;
