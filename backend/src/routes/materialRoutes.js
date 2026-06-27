const express = require('express');
const router = express.Router();
const {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial
} = require('../controllers/materialController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getMaterials)
  .post(createMaterial);

router.route('/:id')
  .put(updateMaterial)
  .delete(deleteMaterial);

module.exports = router;
