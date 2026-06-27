const mongoose = require('mongoose');

const LessonPlanSchema = new mongoose.Schema({
  weekNumber: {
    type: Number,
    required: [true, 'Week number is required'],
  },
  topic: {
    type: String,
    required: [true, 'Topic/Theme focus is required'],
    trim: true,
  },
  learningGoal: {
    type: String,
    required: [true, 'Learning goal is required'],
    trim: true,
  },
  subjectArea: {
    type: String,
    required: [true, 'Subject area is required'],
  },
  activities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity',
    },
  ],
  storyTime: {
    type: String,
    default: '',
  },
  rhymes: {
    type: String,
    default: '',
  },
  assessmentMethod: {
    type: String,
    default: '',
  },
  duration: {
    type: Number, // in minutes
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected'],
    default: 'draft',
  },
  feedback: {
    type: String,
    default: '',
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String, // format YYYY-MM-DD
    required: [true, 'Target date is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('LessonPlan', LessonPlanSchema);
