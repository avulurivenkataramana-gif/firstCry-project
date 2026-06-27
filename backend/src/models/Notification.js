const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: String, // String representation so we can put ObjectIds or 'all'
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: [
      'approval_request',
      'approval_status',
      'material_shortage',
      'deadline',
      'enquiry',
      'general',
      'feedback',
      'progress',
      'attendance',
      'meeting',
      'report',
      'announcement',
      'parent_message'
    ],
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Notification', NotificationSchema);
