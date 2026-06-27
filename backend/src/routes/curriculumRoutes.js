const express = require('express');
const router = express.Router();
const {
  getCurriculums,
  getCurriculumById,
  createCurriculum,
  updateCurriculum,
  deleteCurriculum,
  submitCurriculum,
  approveCurriculum,
  rejectCurriculum,
  reviewCurriculum
} = require('../controllers/curriculumController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All curriculum routes need authentication

router.route('/')
  .get(getCurriculums)
  .post(authorize('teacher', 'admin'), createCurriculum);

router.route('/:id')
  .get(getCurriculumById)
  .put(authorize('teacher', 'admin'), updateCurriculum)
  .delete(authorize('teacher', 'admin', 'coordinator'), deleteCurriculum);

router.post('/:id/submit', submitCurriculum);
router.post('/:id/approve', authorize('coordinator', 'admin'), approveCurriculum);
router.post('/:id/reject', authorize('coordinator', 'admin'), rejectCurriculum);
router.post('/:id/review', authorize('coordinator', 'admin'), reviewCurriculum);

module.exports = router;

