const express = require('express');
const router = express.Router();
const {
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  approveLesson
} = require('../controllers/lessonController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All routes require authentication

router.route('/')
  .get(getLessons)
  .post(authorize('teacher', 'admin'), createLesson);

router.route('/:id')
  .get(getLessonById)
  .put(authorize('teacher', 'admin'), updateLesson)
  .delete(authorize('teacher', 'admin'), deleteLesson);

router.post('/:id/approve', authorize('coordinator', 'admin'), approveLesson);

module.exports = router;
