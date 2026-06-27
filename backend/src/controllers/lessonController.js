const { checkIsMock } = require('../config/db');
const LessonPlan = require('../models/LessonPlan');
const Activity = require('../models/Activity');
const mockDb = require('../services/mockDb');

// @desc    Get all Lesson Plans
// @route   GET /api/lessons
// @access  Private
exports.getLessons = async (req, res) => {
  try {
    const { weekNumber, teacherId, status } = req.query;
    const isMock = checkIsMock();
    let lessons = [];

    if (isMock) {
      lessons = await mockDb.getLessons();
      // Populate activities and teacher
      lessons = lessons.map(l => {
        const teacher = mockDb.mockState.users.find(u => u._id === l.teacher);
        const acts = l.activities.map(actId => mockDb.mockState.activities.find(a => a._id === actId)).filter(Boolean);
        return {
          ...l,
          teacher: teacher ? { _id: teacher._id, name: teacher.name, classroom: teacher.classroom } : null,
          activities: acts
        };
      });

      // Filter in-memory for mock
      if (weekNumber) lessons = lessons.filter(l => l.weekNumber === parseInt(weekNumber, 10));
      if (teacherId) lessons = lessons.filter(l => l.teacher && l.teacher._id === teacherId);
      if (status) lessons = lessons.filter(l => l.status === status);
      
      // If user is a teacher, only show their own lessons (or all if coordinator/admin)
      if (req.user.role === 'teacher') {
        lessons = lessons.filter(l => l.teacher && l.teacher._id === req.user._id);
      }
    } else {
      let query = {};
      if (weekNumber) query.weekNumber = weekNumber;
      if (teacherId) query.teacher = teacherId;
      if (status) query.status = status;
      
      if (req.user.role === 'teacher') {
        query.teacher = req.user._id;
      }

      lessons = await LessonPlan.find(query)
        .populate('teacher', 'name email classroom')
        .populate('activities')
        .sort({ date: 1 });
    }

    res.status(200).json({ success: true, count: lessons.length, data: lessons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Single Lesson Plan
// @route   GET /api/lessons/:id
// @access  Private
exports.getLessonById = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let lesson;

    if (isMock) {
      lesson = await mockDb.getLessonById(req.params.id);
      if (lesson) {
        const teacher = mockDb.mockState.users.find(u => u._id === lesson.teacher);
        const acts = lesson.activities.map(actId => mockDb.mockState.activities.find(a => a._id === actId)).filter(Boolean);
        lesson = {
          ...lesson,
          teacher: teacher ? { _id: teacher._id, name: teacher.name, classroom: teacher.classroom } : null,
          activities: acts
        };
      }
    } else {
      lesson = await LessonPlan.findById(req.params.id)
        .populate('teacher', 'name email classroom')
        .populate('activities');
    }

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson plan not found' });
    }

    res.status(200).json({ success: true, data: lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create Lesson Plan
// @route   POST /api/lessons
// @access  Private
exports.createLesson = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let lesson;

    if (isMock) {
      lesson = await mockDb.createLesson(req.body, req.user._id);
    } else {
      lesson = await LessonPlan.create({
        ...req.body,
        teacher: req.user._id,
      });
    }

    res.status(201).json({ success: true, data: lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Lesson Plan (or schedule/date change)
// @route   PUT /api/lessons/:id
// @access  Private
exports.updateLesson = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let lesson;

    if (isMock) {
      const existing = await mockDb.getLessonById(req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Lesson plan not found' });
      }
      if (existing.teacher !== req.user._id && req.user.role === 'teacher') {
        return res.status(403).json({ success: false, message: 'Not authorized to edit this lesson' });
      }
      lesson = await mockDb.updateLesson(req.params.id, req.body);
    } else {
      let existing = await LessonPlan.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Lesson plan not found' });
      }
      if (existing.teacher.toString() !== req.user._id.toString() && req.user.role === 'teacher') {
        return res.status(403).json({ success: false, message: 'Not authorized to edit this lesson' });
      }
      lesson = await LessonPlan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    }

    res.status(200).json({ success: true, data: lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Lesson Plan
// @route   DELETE /api/lessons/:id
// @access  Private
exports.deleteLesson = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let lesson;

    if (isMock) {
      const existing = await mockDb.getLessonById(req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Lesson plan not found' });
      }
      if (existing.teacher !== req.user._id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this lesson' });
      }
      lesson = await mockDb.deleteLesson(req.params.id);
    } else {
      let existing = await LessonPlan.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Lesson plan not found' });
      }
      if (existing.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this lesson' });
      }
      lesson = await LessonPlan.findByIdAndDelete(req.params.id);
    }

    res.status(200).json({ success: true, message: 'Lesson plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve/Reject Lesson Plan
// @route   POST /api/lessons/:id/approve
// @access  Private
exports.approveLesson = async (req, res) => {
  try {
    const { status, feedback } = req.body; // status: 'approved' or 'rejected'
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Please provide valid status (approved/rejected)' });
    }

    const isMock = checkIsMock();
    let lesson;

    if (isMock) {
      lesson = await mockDb.updateLesson(req.params.id, { status, feedback: feedback || '' });
    } else {
      lesson = await LessonPlan.findByIdAndUpdate(req.params.id, { status, feedback: feedback || '' }, { new: true });
    }

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson plan not found' });
    }

    res.status(200).json({ success: true, message: `Lesson plan ${status} successfully`, data: lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
