const { checkIsMock } = require('../config/db');
const CurriculumPlan = require('../models/CurriculumPlan');
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

// @desc    Get all Curriculum Plans
// @route   GET /api/curriculum
// @access  Private
exports.getCurriculums = async (req, res) => {
  try {
    const { month, academicYear, status, search } = req.query;
    const isMock = checkIsMock();
    let plans = [];

    if (isMock) {
      plans = await mockDb.getCurriculums();
      // Populate creator manually in mock
      plans = plans.map(p => {
        const creator = mockDb.mockState.users.find(u => u._id === p.createdBy);
        const approver = mockDb.mockState.users.find(u => u._id === p.approvedBy);
        const populatedActivities = (p.activities || []).map(aid => 
          mockDb.mockState.activities.find(a => a._id === aid)
        ).filter(Boolean);
        return {
          ...p,
          createdBy: creator ? { _id: creator._id, name: creator.name, role: creator.role } : null,
          approvedBy: approver ? { _id: approver._id, name: approver.name, role: approver.role } : null,
          activities: populatedActivities
        };
      });
    } else {
      let query = {};
      if (month) query.month = month;
      if (academicYear) query.academicYear = academicYear;
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { themeName: { $regex: search, $options: 'i' } }
        ];
      }
      
      // If user is a teacher, they can see draft plans only created by themselves, but see all approved/submitted plans
      if (req.user.role === 'teacher') {
        query.$or = [
          { status: { $in: ['submitted', 'approved', 'rejected'] } },
          { createdBy: req.user._id }
        ];
      }

      plans = await CurriculumPlan.find(query)
        .populate('createdBy', 'name role email')
        .populate('approvedBy', 'name role email')
        .populate('activities')
        .sort({ createdAt: -1 });
    }

    // Filter in-memory for Mock DB queries
    if (isMock) {
      if (month) plans = plans.filter(p => p.month === month);
      if (academicYear) plans = plans.filter(p => p.academicYear === academicYear);
      if (status) plans = plans.filter(p => p.status === status);
      if (search) {
        const s = search.toLowerCase();
        plans = plans.filter(p => p.title.toLowerCase().includes(s) || p.themeName.toLowerCase().includes(s));
      }
      if (req.user.role === 'teacher') {
        plans = plans.filter(p => p.status !== 'draft' || (p.createdBy && p.createdBy._id === req.user._id));
      }
    }

    res.status(200).json({ success: true, count: plans.length, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Single Curriculum Plan
// @route   GET /api/curriculum/:id
// @access  Private
exports.getCurriculumById = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let plan;

    if (isMock) {
      plan = await mockDb.getCurriculumById(req.params.id);
      if (plan) {
        if (req.user.role === 'coordinator' && plan.status === 'submitted') {
          plan.status = 'under_review';
        }
        const creator = mockDb.mockState.users.find(u => u._id === plan.createdBy);
        const approver = mockDb.mockState.users.find(u => u._id === plan.approvedBy);
        const populatedActivities = (plan.activities || []).map(aid => 
          mockDb.mockState.activities.find(a => a._id === aid)
        ).filter(Boolean);
        const populatedHistory = (plan.reviewHistory || []).map(hist => {
          const rev = mockDb.mockState.users.find(u => u._id === (hist.reviewer?._id || hist.reviewer));
          return {
            ...hist,
            reviewer: rev ? { _id: rev._id, name: rev.name, role: rev.role } : null
          };
        });
        plan = {
          ...plan,
          createdBy: creator ? { _id: creator._id, name: creator.name, role: creator.role } : null,
          approvedBy: approver ? { _id: approver._id, name: approver.name, role: approver.role } : null,
          activities: populatedActivities,
          reviewHistory: populatedHistory
        };
      }
    } else {
      plan = await CurriculumPlan.findById(req.params.id);
      if (plan && req.user.role === 'coordinator' && plan.status === 'submitted') {
        plan.status = 'under_review';
        await plan.save();
      }
      plan = await CurriculumPlan.findById(req.params.id)
        .populate('createdBy', 'name role email')
        .populate('approvedBy', 'name role email')
        .populate('activities')
        .populate('reviewHistory.reviewer', 'name role email');
    }

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Curriculum plan not found' });
    }

    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create Curriculum Plan
// @route   POST /api/curriculum
// @access  Private
exports.createCurriculum = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let plan;

    if (isMock) {
      plan = await mockDb.createCurriculum(req.body, req.user._id);
    } else {
      plan = await CurriculumPlan.create({
        ...req.body,
        createdBy: req.user._id,
      });
    }

    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Curriculum Plan
// @route   PUT /api/curriculum/:id
// @access  Private
exports.updateCurriculum = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let plan;

    if (isMock) {
      const existing = await mockDb.getCurriculumById(req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Curriculum plan not found' });
      }
      // Authorization check (only creator or admin/coordinator can update)
      if (existing.createdBy !== req.user._id && req.user.role === 'teacher') {
        return res.status(403).json({ success: false, message: 'Not authorized to edit this plan' });
      }
      plan = await mockDb.updateCurriculum(req.params.id, req.body);
    } else {
      let existing = await CurriculumPlan.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Curriculum plan not found' });
      }
      if (existing.createdBy.toString() !== req.user._id.toString() && req.user.role === 'teacher') {
        return res.status(403).json({ success: false, message: 'Not authorized to edit this plan' });
      }
      plan = await CurriculumPlan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    }

    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Curriculum Plan
// @route   DELETE /api/curriculum/:id
// @access  Private
exports.deleteCurriculum = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let plan;

    if (isMock) {
      const existing = await mockDb.getCurriculumById(req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Curriculum plan not found' });
      }
      if (existing.createdBy !== req.user._id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this plan' });
      }
      plan = await mockDb.deleteCurriculum(req.params.id);
    } else {
      let existing = await CurriculumPlan.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Curriculum plan not found' });
      }
      if (existing.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this plan' });
      }
      plan = await CurriculumPlan.findByIdAndDelete(req.params.id);
    }

    res.status(200).json({ success: true, message: 'Curriculum plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit Curriculum Plan for Approval
// @route   POST /api/curriculum/:id/submit
// @access  Private
exports.submitCurriculum = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let plan;

    if (isMock) {
      const existing = await mockDb.getCurriculumById(req.params.id);
      if (!existing) return res.status(404).json({ success: false, message: 'Plan not found' });
      plan = await mockDb.updateCurriculum(req.params.id, { status: 'submitted' });
    } else {
      plan = await CurriculumPlan.findByIdAndUpdate(req.params.id, { status: 'submitted' }, { new: true });
    }

    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    // Notify coordinators/admins
    await createNotificationHelper({
      recipient: 'user_coord_1', // Target active coordinator
      sender: req.user._id,
      title: 'New Curriculum Submitted',
      message: `${req.user.name} submitted curriculum "${plan.title}" for review.`,
      type: 'approval_request'
    });

    res.status(200).json({ success: true, message: 'Curriculum plan submitted for approval', data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve Curriculum Plan
// @route   POST /api/curriculum/:id/approve
// @access  Private
exports.approveCurriculum = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let plan;

    if (isMock) {
      const existing = await mockDb.getCurriculumById(req.params.id);
      const historyEntry = {
        status: 'approved',
        feedback: req.body.feedback || 'Plan approved',
        reviewer: req.user._id,
        createdAt: new Date()
      };
      const updatedHistory = existing.reviewHistory ? [...existing.reviewHistory, historyEntry] : [historyEntry];
      plan = await mockDb.updateCurriculum(req.params.id, {
        status: 'approved',
        approvedBy: req.user._id,
        feedback: req.body.feedback || '',
        reviewHistory: updatedHistory
      });
    } else {
      plan = await CurriculumPlan.findByIdAndUpdate(req.params.id, {
        status: 'approved',
        approvedBy: req.user._id,
        feedback: req.body.feedback || '',
        $push: {
          reviewHistory: {
            status: 'approved',
            feedback: req.body.feedback || '',
            reviewer: req.user._id
          }
        }
      }, { new: true });
    }

    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    // Notify teacher who created the curriculum
    const recipientId = isMock ? plan.createdBy : plan.createdBy.toString();
    await createNotificationHelper({
      recipient: recipientId,
      sender: req.user._id,
      title: 'Curriculum Plan Approved',
      message: `Your curriculum plan "${plan.title}" has been approved.`,
      type: 'approval_status'
    });

    res.status(200).json({ success: true, message: 'Curriculum plan approved', data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject / Request Changes for Curriculum Plan
// @route   POST /api/curriculum/:id/reject
// @access  Private
exports.rejectCurriculum = async (req, res) => {
  try {
    const { feedback, status } = req.body;
    if (!feedback) {
      return res.status(400).json({ success: false, message: 'Please provide feedback for review action' });
    }

    const isMock = checkIsMock();
    let plan;
    const targetStatus = (status === 'rejected') ? 'rejected' : 'needs_revision';

    if (isMock) {
      const existing = await mockDb.getCurriculumById(req.params.id);
      const historyEntry = {
        status: targetStatus,
        feedback,
        reviewer: req.user._id,
        createdAt: new Date()
      };
      const updatedHistory = existing.reviewHistory ? [...existing.reviewHistory, historyEntry] : [historyEntry];
      plan = await mockDb.updateCurriculum(req.params.id, {
        status: targetStatus,
        feedback,
        reviewHistory: updatedHistory
      });
    } else {
      plan = await CurriculumPlan.findByIdAndUpdate(req.params.id, {
        status: targetStatus,
        feedback,
        $push: {
          reviewHistory: {
            status: targetStatus,
            feedback,
            reviewer: req.user._id
          }
        }
      }, { new: true });
    }

    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    // Notify teacher who created the curriculum
    const recipientId = isMock ? plan.createdBy : plan.createdBy.toString();
    const title = targetStatus === 'rejected' ? 'Curriculum Plan Rejected' : 'Curriculum Plan Needs Revision';
    await createNotificationHelper({
      recipient: recipientId,
      sender: req.user._id,
      title,
      message: `Your curriculum plan "${plan.title}" status is now: ${targetStatus}. Comments: ${feedback}`,
      type: 'approval_status'
    });

    res.status(200).json({ success: true, message: `Curriculum plan updated to ${targetStatus}`, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark Curriculum Plan as Under Review
// @route   POST /api/curriculum/:id/review
// @access  Private
exports.reviewCurriculum = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let plan;

    if (isMock) {
      const existing = await mockDb.getCurriculumById(req.params.id);
      if (!existing) return res.status(404).json({ success: false, message: 'Plan not found' });
      plan = await mockDb.updateCurriculum(req.params.id, { status: 'under_review' });
    } else {
      plan = await CurriculumPlan.findByIdAndUpdate(req.params.id, { status: 'under_review' }, { new: true });
    }

    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    res.status(200).json({ success: true, message: 'Curriculum plan status updated to under_review', data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

