const mongoose = require('mongoose');

const EscalationSchema = new mongoose.Schema({
  caseId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  parentName: {
    type: String,
    required: true,
    trim: true
  },
  teacherName: {
    type: String,
    required: true,
    trim: true
  },
  classroom: {
    type: String,
    required: true,
    trim: true
  },
  issueCategory: {
    type: String,
    enum: ['Medical', 'Learning Difficulty', 'Behaviour', 'Parent Complaint', 'Safety Concern', 'Special Needs', 'Transport', 'Other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Meeting Scheduled', 'Resolved', 'Closed'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  teacherNotes: {
    type: String,
    default: ''
  },
  parentDescription: {
    type: String,
    default: ''
  },
  attachments: {
    type: [String],
    default: []
  },
  internalNotes: {
    type: String,
    default: ''
  },
  resolutionHistory: [
    {
      status: { type: String, required: true },
      note: { type: String, default: '' },
      date: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('Escalation', EscalationSchema);
