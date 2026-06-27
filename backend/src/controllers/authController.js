const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { checkIsMock } = require('../config/db');
const User = require('../models/User');
const PasswordResetToken = require('../models/PasswordResetToken');
const mockDb = require('../services/mockDb');
const { sendPasswordResetEmail } = require('../services/emailService');
const { JWT_SECRET } = require('../middleware/auth');

// ─── Helpers ────────────────────────────────────────────────────────────────

const signToken = (id, rememberMe = false) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: rememberMe ? '30d' : '7d',
  });
};

const safeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  classroom: user.classroom || '',
  phoneNumber: user.phoneNumber || '',
  childName: user.childName || '',
  profileImage: user.profileImage || '',
  isVerified: user.isVerified || false,
  performanceScore: user.performanceScore || 90,
  accountStatus: user.accountStatus || 'PENDING',
  createdAt: user.createdAt,
});

const generate6DigitOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ─── Mock DB OTP Store (in-memory for mock mode) ────────────────────────────
const mockOTPStore = new Map();

// ─── Controllers ────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Public — Register a new user
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, classroom, phoneNumber, childName } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    // Admin accounts cannot be self-registered
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Administrator accounts cannot be self-registered. Please contact your system admin.',
      });
    }

    const isMock = checkIsMock();
    let userExists = false;

    if (isMock) {
      userExists = !!(await mockDb.findUserByEmail(email));
    } else {
      userExists = !!(await User.findOne({ email: email.toLowerCase() }));
    }

    if (userExists) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please login or use a different email.',
      });
    }

    let user;
    if (isMock) {
      user = await mockDb.createUser({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role: role || 'teacher',
        classroom: classroom || '',
        phoneNumber: phoneNumber || '',
        childName: childName || '',
        isVerified: false,
        profileImage: '',
        accountStatus: 'PENDING',
      });
    } else {
      user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role: role || 'teacher',
        classroom: classroom || '',
        phoneNumber: phoneNumber || '',
        childName: childName || '',
        isVerified: false,
        profileImage: '',
        accountStatus: 'PENDING',
      });
    }

    // Do NOT issue token — user must wait for admin approval
    res.status(201).json({
      success: true,
      pending: true,
      message: 'Your account has been created successfully and is awaiting Admin approval. You can log in only after your account has been approved by the Admin.',
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message || 'Registration failed.' });
  }
};

/**
 * POST /api/auth/login
 * Public — Login with email + password
 */
exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const isMock = checkIsMock();
    let user;

    if (isMock) {
      user = await mockDb.findUserByEmail(email);
    } else {
      // Explicitly select password since it's select: false in schema
      user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Verify password
    let isMatch = false;
    if (isMock) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = await user.comparePassword(password);
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Check account approval status (admin is always APPROVED)
    if (user.role !== 'admin') {
      const status = user.accountStatus || 'PENDING';
      if (status === 'PENDING') {
        return res.status(403).json({
          success: false,
          statusCode: 'PENDING',
          message: 'Your account is awaiting Admin approval. Please wait until your account is approved.',
        });
      }
      if (status === 'REJECTED') {
        return res.status(403).json({
          success: false,
          statusCode: 'REJECTED',
          message: 'Your account has been rejected by the Admin. Please contact the Administrator.',
        });
      }
    }

    // Update lastLogin
    if (!isMock) {
      await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    }

    const token = signToken(user._id, rememberMe === true);

    res.status(200).json({
      success: true,
      token,
      user: safeUser(user),
      rememberMe: rememberMe === true,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message || 'Login failed.' });
  }
};

/**
 * POST /api/auth/logout
 * Private — Server-side logout (client clears token; server can blacklist if needed)
 */
exports.logout = async (req, res) => {
  try {
    // For JWT-based auth, the client is responsible for removing the token.
    // This endpoint provides a clean server-side hook for audit logging
    // or future token blacklisting implementation.
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/auth/me
 * Private — Get current logged-in user
 */
exports.getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: safeUser(req.user),
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/auth/profile
 * Private — Update profile (name, phone, profileImage, etc.)
 */
exports.updateProfile = async (req, res) => {
  try {
    // email can only be changed if not already taken by another user
    const allowedFields = ['name', 'email', 'phoneNumber', 'classroom', 'childName', 'profileImage'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // If email is being changed, check it's not taken
    if (updates.email) {
      updates.email = updates.email.toLowerCase().trim();
      const isMockCheck = checkIsMock();
      let existing;
      if (isMockCheck) {
        existing = await mockDb.findUserByEmail(updates.email);
      } else {
        existing = await User.findOne({ email: updates.email });
      }
      if (existing && String(existing._id) !== String(req.user._id)) {
        return res.status(409).json({ success: false, message: 'That email address is already in use.' });
      }
    }

    const isMock = checkIsMock();
    let user;

    if (isMock) {
      user = await mockDb.updateUser(req.user._id, updates);
    } else {
      user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      user: safeUser(user),
      message: 'Profile updated successfully.',
    });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/auth/forgot-password
 * Public — Send OTP to email for password reset
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your email address.' });
    }

    const isMock = checkIsMock();
    let user;

    if (isMock) {
      user = await mockDb.findUserByEmail(email);
    } else {
      user = await User.findOne({ email: email.toLowerCase() });
    }

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset OTP has been sent.',
      });
    }

    const otp = generate6DigitOTP();
    const expiryMs = 15 * 60 * 1000; // 15 minutes

    if (isMock) {
      // Store in-memory for mock mode
      mockOTPStore.set(email.toLowerCase(), {
        otp,
        userId: user._id,
        expiresAt: Date.now() + expiryMs,
        used: false,
      });
    } else {
      // Delete any existing unused tokens for this user
      await PasswordResetToken.deleteMany({ userId: user._id, used: false });

      // Hash the OTP before storing
      const salt = await bcrypt.genSalt(10);
      const tokenHash = await bcrypt.hash(otp, salt);

      await PasswordResetToken.create({
        userId: user._id,
        tokenHash,
        expiresAt: new Date(Date.now() + expiryMs),
      });
    }

    await sendPasswordResetEmail(email, otp, user.name);

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to your email. It expires in 15 minutes.',
    });
  } catch (error) {
    console.error('ForgotPassword error:', error);
    res.status(500).json({ success: false, message: 'Failed to send reset email. Please try again.' });
  }
};

/**
 * POST /api/auth/reset-password
 * Public — Verify OTP and set new password
 */
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, OTP, and new password.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ success: false, message: 'OTP must be a 6-digit number.' });
    }

    const isMock = checkIsMock();

    if (isMock) {
      const entry = mockOTPStore.get(email.toLowerCase());

      if (!entry) {
        return res.status(400).json({ success: false, message: 'No OTP found for this email. Please request a new one.' });
      }

      if (entry.used) {
        return res.status(400).json({ success: false, message: 'This OTP has already been used.' });
      }

      if (Date.now() > entry.expiresAt) {
        mockOTPStore.delete(email.toLowerCase());
        return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
      }

      if (entry.otp !== otp) {
        return res.status(400).json({ success: false, message: 'Invalid OTP. Please check and try again.' });
      }

      // Mark as used
      entry.used = true;

      // Update password in mock store
      const user = await mockDb.findUserById(entry.userId);
      if (user) {
        user.password = bcrypt.hashSync(newPassword, 10);
      }

      mockOTPStore.delete(email.toLowerCase());
    } else {
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid request. User not found.' });
      }

      const tokenRecord = await PasswordResetToken.findOne({
        userId: user._id,
        used: false,
        expiresAt: { $gt: new Date() },
      });

      if (!tokenRecord) {
        return res.status(400).json({ success: false, message: 'OTP not found or has expired. Please request a new one.' });
      }

      const isValid = await bcrypt.compare(otp, tokenRecord.tokenHash);
      if (!isValid) {
        return res.status(400).json({ success: false, message: 'Invalid OTP. Please check and try again.' });
      }

      // Mark token as used
      tokenRecord.used = true;
      await tokenRecord.save();

      // Update user password (pre-save hook will hash it)
      user.password = newPassword;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now login with your new password.',
    });
  } catch (error) {
    console.error('ResetPassword error:', error);
    res.status(500).json({ success: false, message: 'Password reset failed. Please try again.' });
  }
};

/**
 * PUT /api/auth/role
 * Private — Update current user's role (for demo switcher)
 */
exports.updateRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !['teacher', 'coordinator', 'admin', 'parent'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid role.' });
    }

    const isMock = checkIsMock();
    let user;

    if (isMock) {
      user = await mockDb.updateUserRole(req.user._id, role);
    } else {
      user = await User.findByIdAndUpdate(req.user._id, { role }, { new: true }).select('-password');
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Role updated successfully.',
      user: safeUser(user),
    });
  } catch (error) {
    console.error('UpdateRole error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/auth/change-password
 * Private — Change password (old password required)
 */
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.',
      });
    }

    const isMock = checkIsMock();
    let user;

    if (isMock) {
      user = await mockDb.findUserById(req.user._id);
    } else {
      user = await User.findById(req.user._id).select('+password');
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Verify old password
    let isMatch = false;
    if (isMock) {
      isMatch = await bcrypt.compare(oldPassword, user.password);
    } else {
      isMatch = await user.comparePassword(oldPassword);
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    // Set new password
    if (isMock) {
      user.password = bcrypt.hashSync(newPassword, 10);
    } else {
      user.password = newPassword; // pre-save hook will hash
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    console.error('ChangePassword error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/auth/admin/pending-users
 * Private (Admin only) — List all users pending approval
 */
exports.getPendingUsers = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let pendingUsers;

    if (isMock) {
      pendingUsers = await mockDb.getPendingUsers();
    } else {
      pendingUsers = await User.find({
        accountStatus: 'PENDING',
        role: { $ne: 'admin' },
      }).select('-password').sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      data: pendingUsers.map(safeUser),
      count: pendingUsers.length,
    });
  } catch (error) {
    console.error('GetPendingUsers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/auth/admin/approve/:id
 * Private (Admin only) — Approve a pending user
 */
exports.approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const isMock = checkIsMock();
    let user;

    if (isMock) {
      user = await mockDb.updateUserStatus(id, 'APPROVED');
    } else {
      user = await User.findByIdAndUpdate(
        id,
        { accountStatus: 'APPROVED' },
        { new: true }
      ).select('-password');
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Account for ${user.name} has been approved. They can now log in.`,
      user: safeUser(user),
    });
  } catch (error) {
    console.error('ApproveUser error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/auth/admin/reject/:id
 * Private (Admin only) — Reject a pending user
 */
exports.rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    const isMock = checkIsMock();
    let user;

    if (isMock) {
      user = await mockDb.updateUserStatus(id, 'REJECTED');
    } else {
      user = await User.findByIdAndUpdate(
        id,
        { accountStatus: 'REJECTED' },
        { new: true }
      ).select('-password');
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Account for ${user.name} has been rejected.`,
      user: safeUser(user),
    });
  } catch (error) {
    console.error('RejectUser error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
