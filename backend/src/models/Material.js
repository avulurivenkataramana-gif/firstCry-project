const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Material name is required'],
    trim: true,
  },
  quantity: {
    type: Number,
    required: [true, 'Total quantity is required'],
    default: 0,
  },
  availableQuantity: {
    type: Number,
    required: [true, 'Available quantity is required'],
    default: 0,
  },
  requiredQuantity: {
    type: Number,
    required: [true, 'Required quantity is required'],
    default: 0,
  },
  status: {
    type: String,
    enum: ['in-stock', 'low-stock', 'out-of-stock'],
    default: 'in-stock',
  },
  assignedTeacher: {
    type: String, // String name of classroom/teacher for ease
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Calculate status based on quantities before saving
MaterialSchema.pre('save', function (next) {
  if (this.availableQuantity === 0) {
    this.status = 'out-of-stock';
  } else if (this.availableQuantity < this.requiredQuantity) {
    this.status = 'low-stock';
  } else {
    this.status = 'in-stock';
  }
  next();
});

module.exports = mongoose.model('Material', MaterialSchema);
