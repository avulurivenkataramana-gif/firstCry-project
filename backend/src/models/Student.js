const mongoose = require('mongoose');

const ObservationSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  teacherName: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
  },
  admissionNumber: {
    type: String,
    required: [true, 'Admission number is required'],
    unique: true,
    trim: true,
  },
  classroom: {
    type: String,
    required: [true, 'Class (Classroom) is required'],
    trim: true,
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
  },
  fatherName: {
    type: String,
    default: '',
    trim: true,
  },
  parentName: {
    type: String,
    required: [true, 'Parent/Guardian name is required'],
    trim: true,
  },
  parentEmail: {
    type: String,
    required: [true, 'Parent email is required'],
    trim: true,
    lowercase: true,
  },
  relationship: {
    type: String,
    required: [true, 'Relationship is required'],
    enum: ['Father', 'Mother', 'Guardian'],
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    trim: true,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  observations: [ObservationSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Student', StudentSchema);
