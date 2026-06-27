const express = require('express');
const router = express.Router();
const { 
  getAttendance, 
  markAttendance, 
  updateAttendance,
  getNotices, 
  createNotice, 
  getProgress, 
  updateProgress,
  getTeacher,
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  addObservation,
  updateObservation,
  getEscalations,
  getEscalationById,
  createEscalation,
  updateEscalation
} = require('../controllers/parentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All routes require login

// Teacher route
router.route('/teacher')
  .get(getTeacher);

// Attendance routes
router.route('/attendance')
  .get(getAttendance)
  .post(authorize('teacher', 'admin'), markAttendance);

router.route('/attendance/:id')
  .put(authorize('teacher', 'admin'), updateAttendance);

// Notices routes
router.route('/notices')
  .get(getNotices)
  .post(authorize('admin', 'coordinator', 'teacher'), createNotice);

// Child progress routes
router.route('/progress')
  .get(getProgress)
  .post(authorize('teacher', 'admin'), updateProgress);

// Student management routes
router.route('/students')
  .get(authorize('teacher', 'admin'), getStudents)
  .post(authorize('admin'), createStudent);

router.route('/students/:id')
  .get(authorize('teacher', 'admin'), getStudentById)
  .put(authorize('admin'), updateStudent);

router.route('/students/:id/observations')
  .post(authorize('teacher', 'admin'), addObservation);

router.route('/students/:id/observations/:obsId')
  .put(authorize('teacher', 'admin'), updateObservation);

// Escalations routes
router.route('/escalations')
  .get(getEscalations)
  .post(authorize('parent', 'admin'), createEscalation);

router.route('/escalations/:id')
  .get(getEscalationById)
  .put(authorize('coordinator', 'admin'), updateEscalation);

module.exports = router;
