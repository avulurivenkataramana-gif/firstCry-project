const express = require('express');
const router = express.Router();
const { generateLesson } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/generate', generateLesson);

module.exports = router;
