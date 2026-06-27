const { checkIsMock } = require('../config/db');
const Notification = require('../models/Notification');
const mockDb = require('../services/mockDb');

// @desc    Get current user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let notifications = [];

    if (isMock) {
      notifications = await mockDb.getNotifications(req.user._id, req.user.role);
    } else {
      // Find where recipient is user ID, 'all', or if user is admin, show all
      const query = req.user.role === 'admin' 
        ? {} 
        : { $or: [{ recipient: req.user._id }, { recipient: 'all' }] };
        
      notifications = await Notification.find(query).sort({ createdAt: -1 });
    }

    res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark Notification as Read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markRead = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let notification;

    if (isMock) {
      notification = await mockDb.markNotificationRead(req.params.id);
    } else {
      notification = await Notification.findByIdAndUpdate(
        req.params.id,
        { isRead: true },
        { new: true }
      );
    }

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a Notification (Enquiry / Alert / Request)
// @route   POST /api/notifications
// @access  Private
exports.createNotification = async (req, res) => {
  try {
    const { recipient, title, message, type } = req.body;
    if (!recipient || !title || !message || !type) {
      return res.status(400).json({ success: false, message: 'Please provide recipient, title, message, and type' });
    }

    const isMock = checkIsMock();
    let notification;

    if (isMock) {
      notification = await mockDb.createNotification({
        recipient,
        sender: req.user._id,
        title,
        message,
        type
      });
    } else {
      notification = await Notification.create({
        recipient,
        sender: req.user._id,
        title,
        message,
        type
      });
    }

    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark All Notifications as Read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllRead = async (req, res) => {
  try {
    const isMock = checkIsMock();
    if (isMock) {
      await mockDb.markAllNotificationsRead(req.user._id);
    } else {
      await Notification.updateMany(
        { recipient: req.user._id, isRead: false },
        { isRead: true }
      );
    }
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let deleted;

    if (isMock) {
      deleted = await mockDb.deleteNotification(req.params.id);
    } else {
      deleted = await Notification.findByIdAndDelete(req.params.id);
    }

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
