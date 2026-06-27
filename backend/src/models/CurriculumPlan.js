const mongoose = require('mongoose');

const CurriculumPlanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Curriculum title is required'],
    trim: true,
  },
  themeName: {
    type: String,
    required: [true, 'Theme name is required'],
    trim: true,
  },
  month: {
    type: String,
    required: [true, 'Planning month is required'],
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
  },
  description: {
    type: String,
    default: '',
  },
  learningObjectives: {
    type: [String],
    default: [],
  },
  learningOutcomes: {
    type: [String],
    default: [],
  },
  skillsCovered: {
    type: [String],
    default: [],
  },
  weeklyBreakdown: {
    week1: { type: String, default: '' },
    week2: { type: String, default: '' },
    week3: { type: String, default: '' },
    week4: { type: String, default: '' },
  },
  notes: {
    type: String,
    default: '',
  },
  activities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    default: []
  }],
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'approved', 'needs_revision', 'rejected'],
    default: 'draft',
  },
  feedback: {
    type: String,
    default: '',
  },
  reviewHistory: [
    {
      status: { type: String, required: true },
      feedback: { type: String, default: '' },
      reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('CurriculumPlan', CurriculumPlanSchema);
