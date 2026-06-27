const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  updateRole,
  changePassword,
  getPendingUsers,
  approveUser,
  rejectUser,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Admin-only middleware
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
  }
  next();
};

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Private routes (require valid JWT)
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/role', protect, updateRole);

// Admin approval routes
router.get('/admin/pending-users', protect, adminOnly, getPendingUsers);
router.put('/admin/approve/:id', protect, adminOnly, approveUser);
router.put('/admin/reject/:id', protect, adminOnly, rejectUser);

module.exports = router;
