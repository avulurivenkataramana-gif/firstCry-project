const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Notice title is required'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Notice content is required'],
    trim: true,
  },
  targetClassroom: {
    type: String, // 'All' or specific classroom like 'Nursery-A'
    default: 'All',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Notice', NoticeSchema);
