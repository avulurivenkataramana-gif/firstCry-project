const mongoose = require('mongoose');

const ChildProgressSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  classroom: {
    type: String,
    required: [true, 'Classroom is required'],
  },
  skills: [
    {
      skillName: { type: String, required: true },
      score: { type: Number, required: true, min: 0, max: 100 }, // percentage completion
    }
  ],
  teacherFeedback: {
    type: String,
    default: '',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ChildProgress', ChildProgressSchema);
