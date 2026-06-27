const { checkIsMock } = require('../config/db');
const User = require('../models/User');
const RoleRequest = require('../models/RoleRequest');
const mockDb = require('../services/mockDb');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let users = [];

    if (isMock) {
      users = await mockDb.getUsers();
    } else {
      users = await User.find({}).select('-password').sort({ createdAt: -1 });
    }

    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new user
// @route   POST /api/admin/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, classroom, childName, phoneNumber } = req.body;
    const isMock = checkIsMock();

    // Check if user exists
    let exists = false;
    if (isMock) {
      const u = await mockDb.findUserByEmail(email);
      exists = !!u;
    } else {
      const u = await User.findOne({ email });
      exists = !!u;
    }

    if (exists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    let newUser;
    if (isMock) {
      newUser = await mockDb.createUser({
        name,
        email,
        password,
        role,
        classroom: classroom || '',
        childName: childName || '',
        phoneNumber: phoneNumber || ''
      });
    } else {
      newUser = await User.create({
        name,
        email,
        password,
        role,
        classroom: classroom || '',
        childName: childName || '',
        phoneNumber: phoneNumber || ''
      });
    }

    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user details
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let updated;

    if (isMock) {
      updated = await mockDb.updateUser(req.params.id, req.body);
    } else {
      updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-password');
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let deleted;

    if (isMock) {
      deleted = await mockDb.deleteUser(req.params.id);
    } else {
      deleted = await User.findByIdAndDelete(req.params.id);
    }

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all role requests
// @route   GET /api/admin/role-requests
// @access  Private/Admin
exports.getRoleRequests = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let requests = [];

    if (isMock) {
      requests = await mockDb.getRoleRequests();
    } else {
      requests = await RoleRequest.find({}).sort({ requestDate: -1 });
    }

    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update role request status (Approve/Reject)
// @route   PUT /api/admin/role-requests/:id
// @access  Private/Admin
exports.updateRoleRequest = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Please provide valid status (Approved or Rejected)' });
    }

    const isMock = checkIsMock();
    let updated;

    if (isMock) {
      updated = await mockDb.updateRoleRequest(req.params.id, { status, rejectionReason: rejectionReason || '' });
    } else {
      updated = await RoleRequest.findByIdAndUpdate(
        req.params.id,
        { status, rejectionReason: rejectionReason || '' },
        { new: true, runValidators: true }
      );
      
      if (updated && updated.status === 'Approved') {
        await User.findByIdAndUpdate(updated.userId, { role: updated.requestedRole });
      }
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Role request not found' });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
