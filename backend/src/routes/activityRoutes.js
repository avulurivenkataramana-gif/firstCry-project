const express = require('express');
const router = express.Router();
const {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  toggleFavorite
} = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

router.use(protect); // All routes require authentication

router.route('/')
  .get(getActivities)
  .post(createActivity);

router.route('/:id')
  .put(updateActivity)
  .delete(deleteActivity);

router.post('/:id/toggle-favorite', toggleFavorite);

module.exports = router;
