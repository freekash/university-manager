const express = require('express');
const router = express.Router();
const {
    createCourse,
    getCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
} = require('../controllers/courseController');

const { protect, authorize } = require('../middleware/authMiddleware');

router
    .route('/')
    .post(protect, authorize(['ADMIN']), createCourse)
    .get(getCourses);

router
    .route('/:id')
    .get(getCourseById)
    .patch(protect, authorize(['ADMIN']), updateCourse)
    .delete(protect, authorize(['ADMIN']), deleteCourse);

module.exports = router;
