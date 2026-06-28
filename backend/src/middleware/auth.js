const jwt = require('jsonwebtoken');
const { checkIsMock } = require('../config/db');
const User = require('../models/User');
const mockDb = require('../services/mockDb');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set. Server cannot start securely.');
  process.exit(1);
}

// Protect routes - Verify JWT
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this resource. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if database is mock or real
    if (checkIsMock()) {
      const user = await mockDb.findUserById(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found in mock database' });
      }
      req.user = user;
    } else {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      req.user = user;
    }
    
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(401).json({ success: false, message: 'Session expired or invalid token' });
  }
};

// Authorize roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Role '${req.user ? req.user.role : 'Guest'}' is not authorized to access this route.` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize, JWT_SECRET };
