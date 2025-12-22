// server/src/routes/facultyRoutes.js
const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Faculty routes for Attendance
router.post('/attendance', protect, authorize(['FACULTY']), facultyController.markAttendance);

// Faculty routes for Marks
router.post('/marks', protect, authorize(['FACULTY']), facultyController.addMarks);

// Faculty routes for data retrieval
router.get('/classes', protect, authorize(['FACULTY']), facultyController.getFacultyClasses);
router.get('/subjects', protect, authorize(['FACULTY']), facultyController.getFacultySubjects);
router.get('/reports', protect, authorize(['FACULTY']), facultyController.getFacultyReports);


module.exports = router;
