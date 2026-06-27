const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Activity name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Activity category is required'],
    enum: [
      'Art & Craft',
      'Language Development',
      'Mathematics',
      'Science Exploration',
      'Music & Dance',
      'Storytelling',
      'Outdoor Activities',
      'Fine Motor Skills',
      'Gross Motor Skills',
    ],
  },
  ageGroup: {
    type: String,
    required: [true, 'Target age group is required'],
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Activity duration is required'],
  },
  materialsRequired: {
    type: [String],
    default: [],
  },
  instructions: {
    type: [String],
    default: [],
  },
  learningOutcome: {
    type: String,
    required: [true, 'Learning outcome is required'],
  },
  isTemplate: {
    type: Boolean,
    default: false,
  },
  favoriteBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Activity', ActivitySchema);
