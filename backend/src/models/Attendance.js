const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
  },
  classroom: {
    type: String,
    required: [true, 'Classroom is required'],
  },
  date: {
    type: String, // YYYY-MM-DD
    required: [true, 'Attendance date is required'],
  },
  status: {
    type: String,
    enum: ['present', 'absent'],
    default: 'present',
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
