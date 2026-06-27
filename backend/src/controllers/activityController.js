const { checkIsMock } = require('../config/db');
const Activity = require('../models/Activity');
const mockDb = require('../services/mockDb');

// @desc    Get all Activities
// @route   GET /api/activities
// @access  Private
exports.getActivities = async (req, res) => {
  try {
    const { category, search, favoritesOnly } = req.query;
    const isMock = checkIsMock();
    let activities = [];

    if (isMock) {
      activities = await mockDb.getActivities();
      if (category) activities = activities.filter(a => a.category === category);
      if (search) {
        const s = search.toLowerCase();
        activities = activities.filter(a => a.name.toLowerCase().includes(s) || a.learningOutcome.toLowerCase().includes(s));
      }
      if (favoritesOnly === 'true') {
        activities = activities.filter(a => a.favoriteBy && a.favoriteBy.includes(req.user._id));
      }
    } else {
      let query = {};
      if (category) query.category = category;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { learningOutcome: { $regex: search, $options: 'i' } }
        ];
      }
      if (favoritesOnly === 'true') {
        query.favoriteBy = req.user._id;
      }
      activities = await Activity.find(query).sort({ createdAt: -1 });
    }

    res.status(200).json({ success: true, count: activities.length, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create Custom Activity
// @route   POST /api/activities
// @access  Private
exports.createActivity = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let activity;

    if (isMock) {
      activity = await mockDb.createActivity(req.body);
    } else {
      activity = await Activity.create(req.body);
    }

    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Activity
// @route   PUT /api/activities/:id
// @access  Private
exports.updateActivity = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let activity;

    if (isMock) {
      activity = await mockDb.updateActivity(req.params.id, req.body);
    } else {
      activity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    }

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    res.status(200).json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Activity
// @route   DELETE /api/activities/:id
// @access  Private
exports.deleteActivity = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let activity;

    if (isMock) {
      activity = await mockDb.deleteActivity(req.params.id);
    } else {
      activity = await Activity.findByIdAndDelete(req.params.id);
    }

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    res.status(200).json({ success: true, message: 'Activity deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle Favorite Activity
// @route   POST /api/activities/:id/toggle-favorite
// @access  Private
exports.toggleFavorite = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let activity;

    if (isMock) {
      activity = await mockDb.toggleFavoriteActivity(req.params.id, req.user._id);
    } else {
      activity = await Activity.findById(req.params.id);
      if (activity) {
        const index = activity.favoriteBy.indexOf(req.user._id);
        if (index === -1) {
          activity.favoriteBy.push(req.user._id);
        } else {
          activity.favoriteBy.splice(index, 1);
        }
        await activity.save();
      }
    }

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    res.status(200).json({ success: true, message: 'Favorite status toggled', data: activity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
