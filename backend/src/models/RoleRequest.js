const mongoose = require('mongoose');

const RoleRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  requestedRole: {
    type: String,
    required: true,
  },
  requestedPermissions: {
    type: String,
    required: true,
  },
  requestDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  rejectionReason: {
    type: String,
    default: '',
  },
});

module.exports = mongoose.model('RoleRequest', RoleRequestSchema);
