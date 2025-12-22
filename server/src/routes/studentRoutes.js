const express = require('express');
const router = express.Router();
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentAttendance,
  getStudentMarks,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .post(protect, authorize(['ADMIN']), createStudent)
  .get(protect, authorize(['ADMIN', 'FACULTY']), getStudents); // Updated roles for getStudents

router
  .route('/:id')
  .get(protect, authorize(['ADMIN', 'FACULTY', 'STUDENT']), getStudentById) // Allow student to get their own profile
  .put(protect, authorize(['ADMIN']), updateStudent) // Using PUT for full update
  .delete(protect, authorize(['ADMIN']), deleteStudent);

// Student-specific routes (authenticated student accessing their own data)
router.get('/me/attendance', protect, authorize(['STUDENT']), getStudentAttendance);
router.get('/me/marks', protect, authorize(['STUDENT']), getStudentMarks);

module.exports = router;