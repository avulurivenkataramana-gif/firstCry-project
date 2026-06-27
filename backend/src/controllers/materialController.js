const { checkIsMock } = require('../config/db');
const Material = require('../models/Material');
const Notification = require('../models/Notification');
const mockDb = require('../services/mockDb');

// Helper to create notifications
const createNotificationHelper = async ({ recipient, sender, title, message, type }) => {
  if (checkIsMock()) {
    await mockDb.createNotification({ recipient, sender, title, message, type });
  } else {
    try {
      await Notification.create({ recipient, sender, title, message, type });
    } catch (e) {
      console.error('Failed to create DB notification:', e.message);
    }
  }
};

// @desc    Get all Materials
// @route   GET /api/materials
// @access  Private
exports.getMaterials = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let materials = [];

    if (isMock) {
      materials = await mockDb.getMaterials();
    } else {
      materials = await Material.find({}).sort({ createdAt: -1 });
    }

    res.status(200).json({ success: true, count: materials.length, data: materials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add New Material
// @route   POST /api/materials
// @access  Private
exports.createMaterial = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let material;

    if (isMock) {
      material = await mockDb.createMaterial(req.body);
    } else {
      material = await Material.create(req.body);
    }

    // Check if new material is immediately low or out of stock, trigger notification
    if (material.status === 'out-of-stock' || material.status === 'low-stock') {
      await createNotificationHelper({
        recipient: 'all',
        sender: req.user._id,
        title: `Material Shortage Alert: ${material.name}`,
        message: `Inventory warning: ${material.name} is currently ${material.status.replace('-', ' ')} (${material.availableQuantity} available, ${material.requiredQuantity} required).`,
        type: 'material_shortage'
      });
    }

    res.status(201).json({ success: true, data: material });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Material Inventory
// @route   PUT /api/materials/:id
// @access  Private
exports.updateMaterial = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let material;

    if (isMock) {
      material = await mockDb.updateMaterial(req.params.id, req.body);
    } else {
      // Find and update with pre-save hook running correctly
      material = await Material.findById(req.params.id);
      if (material) {
        Object.assign(material, req.body);
        await material.save();
      }
    }

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    // Trigger notification if updated to low-stock or out-of-stock
    if (material.status === 'out-of-stock' || material.status === 'low-stock') {
      await createNotificationHelper({
        recipient: 'all',
        sender: req.user._id,
        title: `Material Shortage Alert: ${material.name}`,
        message: `Inventory warning: ${material.name} is currently ${material.status.replace('-', ' ')} (${material.availableQuantity} available, ${material.requiredQuantity} required).`,
        type: 'material_shortage'
      });
    }

    res.status(200).json({ success: true, data: material });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Material
// @route   DELETE /api/materials/:id
// @access  Private
exports.deleteMaterial = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let material;

    if (isMock) {
      material = await mockDb.deleteMaterial(req.params.id);
    } else {
      material = await Material.findByIdAndDelete(req.params.id);
    }

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    res.status(200).json({ success: true, message: 'Material deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
