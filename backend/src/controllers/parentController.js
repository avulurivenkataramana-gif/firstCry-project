const { checkIsMock } = require('../config/db');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Notice = require('../models/Notice');
const ChildProgress = require('../models/ChildProgress');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const Escalation = require('../models/Escalation');
const mockDb = require('../services/mockDb');


// ==========================================
// 1. ATTENDANCE LOG ACTIONS
// ==========================================

// @desc    Get attendance logs
// @route   GET /api/parent/attendance
// @access  Private
exports.getAttendance = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let records = [];

    // Filter classroom by role
    let classroom = req.query.classroom;
    let studentName = req.query.studentName;
    
    if (req.user.role === 'parent') {
      classroom = req.user.classroom;
      studentName = req.user.childName;
    }

    if (isMock) {
      records = await mockDb.getAttendance(classroom, studentName);
    } else {
      let query = {};
      if (classroom) query.classroom = classroom;
      if (studentName) query.studentName = { $regex: studentName, $options: 'i' };
      
      records = await Attendance.find(query).sort({ date: -1 });
    }

    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark attendance (Teacher only)
// @route   POST /api/parent/attendance
// @access  Private
exports.markAttendance = async (req, res) => {
  try {
    const { studentName, classroom, date, status, notifyParent } = req.body;
    
    if (!studentName || !classroom || !date || !status) {
      return res.status(400).json({ success: false, message: 'Please provide studentName, classroom, date, and status' });
    }

    const isMock = checkIsMock();
    let record;

    if (isMock) {
      record = await mockDb.markAttendance({
        studentName,
        classroom,
        date,
        status
      }, req.user._id);
    } else {
      record = await Attendance.create({
        studentName,
        classroom,
        date,
        status,
        markedBy: req.user._id
      });
    }

    if (notifyParent) {
      let parentId;
      if (isMock) {
        const studentObj = mockDb.mockState.students.find(s => s.name.toLowerCase() === studentName.toLowerCase());
        parentId = studentObj?.parentId;
      } else {
        const studentObj = await Student.findOne({ name: { $regex: new RegExp('^' + studentName + '$', 'i') } });
        parentId = studentObj?.parentId;
      }
      
      if (parentId) {
        const title = 'Attendance Update';
        const message = `${studentName} was marked ${status} for today (${date}).`;
        if (isMock) {
          await mockDb.createNotification({
            recipient: parentId,
            sender: req.user._id,
            title,
            message,
            type: 'attendance'
          });
        } else {
          await Notification.create({
            recipient: parentId,
            sender: req.user._id,
            title,
            message,
            type: 'attendance'
          });
        }
      }
    }

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update attendance log status (Teacher/Admin only)
// @route   PUT /api/parent/attendance/:id
// @access  Private
exports.updateAttendance = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['present', 'absent'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Please provide valid status (present or absent)' });
    }

    const isMock = checkIsMock();
    let record;

    if (isMock) {
      record = await mockDb.updateAttendance(req.params.id, { status });
    } else {
      record = await Attendance.findByIdAndUpdate(
        req.params.id,
        { status, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );
    }

    if (!record) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    res.status(200).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. SCHOOL NOTICES ACTIONS
// ==========================================

// @desc    Get school notices
// @route   GET /api/parent/notices
// @access  Private
exports.getNotices = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let notices = [];
    
    let classroom = req.user.role === 'parent' ? req.user.classroom : req.query.classroom;

    if (isMock) {
      notices = await mockDb.getNotices(classroom);
    } else {
      let query = { $or: [{ targetClassroom: 'All' }] };
      if (classroom) {
        query.$or.push({ targetClassroom: classroom });
      }
      notices = await Notice.find(query).populate('createdBy', 'name role').sort({ createdAt: -1 });
    }

    res.status(200).json({ success: true, count: notices.length, data: notices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create school notice (Staff only)
// @route   POST /api/parent/notices
// @access  Private
exports.createNotice = async (req, res) => {
  try {
    const { title, content, targetClassroom } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Please provide title and content' });
    }

    const isMock = checkIsMock();
    let notice;

    if (isMock) {
      notice = await mockDb.createNotice({
        title,
        content,
        targetClassroom: targetClassroom || 'All'
      }, req.user._id);
    } else {
      notice = await Notice.create({
        title,
        content,
        targetClassroom: targetClassroom || 'All',
        createdBy: req.user._id
      });
    }

    res.status(201).json({ success: true, data: notice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. CHILD PROGRESS TRACKING
// ==========================================

// @desc    Get child progress evaluation
// @route   GET /api/parent/progress
// @access  Private
exports.getProgress = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let progress;

    if (req.user.role === 'parent') {
      if (isMock) {
        progress = await mockDb.getChildProgress(req.user._id);
      } else {
        progress = await ChildProgress.findOne({ parent: req.user._id }).populate('updatedBy', 'name');
      }
    } else {
      // Teachers/coordinators view all progress records
      if (isMock) {
        progress = await mockDb.getChildProgress();
      } else {
        progress = await ChildProgress.find({}).populate('parent', 'name').populate('updatedBy', 'name');
      }
    }

    res.status(200).json({ 
      success: true, 
      data: Array.isArray(progress) ? progress : progress ? [progress] : [] 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update child progress scores (Teacher only)
// @route   POST /api/parent/progress
// @access  Private
exports.updateProgress = async (req, res) => {
  try {
    const { studentName, parentId, classroom, skills, teacherFeedback } = req.body;
    if (!studentName || !parentId || !skills) {
      return res.status(400).json({ success: false, message: 'Please provide studentName, parentId, and skills' });
    }

    const isMock = checkIsMock();
    let record;

    if (isMock) {
      record = await mockDb.updateChildProgress({
        studentName,
        parent: parentId,
        classroom: classroom || 'Nursery-A',
        skills,
        teacherFeedback: teacherFeedback || ''
      }, req.user._id);
    } else {
      // Find by student name and update or create
      record = await ChildProgress.findOneAndUpdate(
        { studentName },
        {
          studentName,
          parent: parentId,
          classroom: classroom || 'Nursery-A',
          skills,
          teacherFeedback: teacherFeedback || '',
          updatedBy: req.user._id,
          updatedAt: Date.now()
        },
        { new: true, upsert: true }
      );
    }

    res.status(200).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get classroom teacher profile
// @route   GET /api/parent/teacher
// @access  Private (Parent only)
exports.getTeacher = async (req, res) => {
  try {
    const isMock = checkIsMock();
    const classroom = req.user.classroom;
    
    if (!classroom) {
      return res.status(400).json({ success: false, message: 'Parent is not assigned to a classroom' });
    }

    let teacher;
    if (isMock) {
      teacher = mockDb.mockState.users.find(u => u.role === 'teacher' && u.classroom === classroom);
    } else {
      teacher = await User.findOne({ role: 'teacher', classroom });
    }

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'No teacher found for your classroom' });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        phoneNumber: teacher.phoneNumber,
        classroom: teacher.classroom
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ==========================================
// 4. STUDENT MANAGEMENT ACTIONS
// ==========================================

// @desc    Get all students
// @route   GET /api/parent/students
// @access  Private (Teacher, Admin)
exports.getStudents = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let students = [];

    let classroom = req.query.classroom;
    if (req.user.role === 'teacher') {
      classroom = req.user.classroom;
    }

    if (isMock) {
      students = await mockDb.getStudents(classroom);
    } else {
      let query = {};
      if (classroom && classroom !== 'All Classrooms') {
        query.classroom = classroom;
      }
      students = await Student.find(query).sort({ name: 1 });
    }

    res.status(200).json({ success: true, count: students.length, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student by ID
// @route   GET /api/parent/students/:id
// @access  Private (Teacher, Admin)
exports.getStudentById = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let student;

    if (isMock) {
      student = await mockDb.getStudentById(req.params.id);
    } else {
      student = await Student.findById(req.params.id).populate('parentId', 'name email role phoneNumber');
    }

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create student & associated parent account
// @route   POST /api/parent/students
// @access  Private/Admin
exports.createStudent = async (req, res) => {
  try {
    const { 
      name, 
      admissionNumber, 
      classroom, 
      age, 
      gender, 
      fatherName, 
      parentName, 
      parentEmail, 
      relationship, 
      contactNumber 
    } = req.body;
    
    if (!name || !admissionNumber || !classroom || !age || !gender || !parentName || !parentEmail || !relationship || !contactNumber) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const isMock = checkIsMock();
    
    if (isMock) {
      const exists = mockDb.mockState.students.some(s => s.admissionNumber === admissionNumber);
      if (exists) {
        return res.status(400).json({ success: false, message: 'Student with this admission number already exists' });
      }

      const student = await mockDb.createStudent(req.body);
      return res.status(201).json({ success: true, data: student });
    } else {
      const exists = await Student.findOne({ admissionNumber });
      if (exists) {
        return res.status(400).json({ success: false, message: 'Student with this admission number already exists' });
      }

      let parentUser = await User.findOne({ email: parentEmail.toLowerCase() });
      
      if (!parentUser) {
        parentUser = await User.create({
          name: parentName,
          email: parentEmail.toLowerCase(),
          password: 'parent123',
          role: 'parent',
          classroom: classroom,
          childName: name,
          phoneNumber: contactNumber,
          accountStatus: 'APPROVED'
        });
      } else {
        parentUser.childName = name;
        parentUser.classroom = classroom;
        parentUser.phoneNumber = contactNumber;
        parentUser.name = parentName;
        await parentUser.save();
      }

      const student = await Student.create({
        name,
        admissionNumber,
        classroom,
        age,
        gender,
        fatherName,
        parentName,
        parentEmail,
        relationship,
        contactNumber,
        parentId: parentUser._id
      });

      res.status(201).json({ success: true, data: student });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update student details
// @route   PUT /api/parent/students/:id
// @access  Private/Admin
exports.updateStudent = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let updated;

    if (isMock) {
      updated = await mockDb.updateStudent(req.params.id, req.body);
    } else {
      updated = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (updated) {
        let parentUser = await User.findById(updated.parentId);
        if (parentUser) {
          parentUser.name = updated.parentName;
          parentUser.email = updated.parentEmail.toLowerCase();
          parentUser.childName = updated.name;
          parentUser.classroom = updated.classroom;
          parentUser.phoneNumber = updated.contactNumber;
          await parentUser.save();
        }
      }
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add teacher observation
// @route   POST /api/parent/students/:id/observations
// @access  Private (Teacher, Admin)
exports.addObservation = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Observation content is required' });
    }

    const isMock = checkIsMock();
    let observation;

    if (isMock) {
      observation = await mockDb.addObservation(req.params.id, { content }, req.user._id);
      if (!observation) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }
    } else {
      const student = await Student.findById(req.params.id);
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }
      
      const newObs = {
        teacherName: req.user.name,
        content,
        createdBy: req.user._id,
        date: new Date()
      };
      
      student.observations.push(newObs);
      await student.save();
      observation = student.observations[student.observations.length - 1];
    }

    res.status(201).json({ success: true, data: observation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update teacher observation
// @route   PUT /api/parent/students/:id/observations/:obsId
// @access  Private (Teacher, Admin)
exports.updateObservation = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Observation content is required' });
    }

    const isMock = checkIsMock();
    let observation;

    if (isMock) {
      observation = await mockDb.updateObservation(req.params.id, req.params.obsId, content);
      if (!observation) {
        return res.status(404).json({ success: false, message: 'Student or observation not found' });
      }
    } else {
      const student = await Student.findById(req.params.id);
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }

      const obs = student.observations.id(req.params.obsId);
      if (!obs) {
        return res.status(404).json({ success: false, message: 'Observation not found' });
      }

      obs.content = content;
      obs.date = new Date();
      await student.save();
      observation = obs;
    }

    res.status(200).json({ success: true, data: observation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 5. PARENT ESCALATIONS ACTIONS
// ==========================================

// @desc    Get all parent escalations
// @route   GET /api/parent/escalations
// @access  Private
exports.getEscalations = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let escalations = [];
    if (isMock) {
      escalations = await mockDb.getEscalations();
      if (req.user.role === 'parent') {
        escalations = escalations.filter(e => e.parentName === req.user.name);
      }
    } else {
      let query = {};
      if (req.user.role === 'parent') {
        query.parentName = req.user.name;
      }
      escalations = await Escalation.find(query).sort({ createdAt: -1 });
    }
    res.status(200).json({ success: true, count: escalations.length, data: escalations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get escalation details by ID
// @route   GET /api/parent/escalations/:id
// @access  Private
exports.getEscalationById = async (req, res) => {
  try {
    const isMock = checkIsMock();
    let escalation;
    if (isMock) {
      escalation = await mockDb.getEscalationById(req.params.id);
    } else {
      escalation = await Escalation.findById(req.params.id);
    }

    if (!escalation) {
      return res.status(404).json({ success: false, message: 'Escalation case not found' });
    }
    res.status(200).json({ success: true, data: escalation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a parent escalation
// @route   POST /api/parent/escalations
// @access  Private (Parent)
exports.createEscalation = async (req, res) => {
  try {
    const { studentName, parentName, teacherName, classroom, issueCategory, priority, parentDescription } = req.body;
    if (!studentName || !parentName || !teacherName || !classroom || !issueCategory || !priority) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const isMock = checkIsMock();
    let escalation;

    const newEscalationData = {
      studentName,
      parentName,
      teacherName,
      classroom,
      issueCategory,
      priority,
      parentDescription: parentDescription || '',
      status: 'Pending',
      resolutionHistory: [{ status: 'Pending', note: 'Case registered by parent', date: new Date() }]
    };

    if (isMock) {
      escalation = await mockDb.createEscalation(newEscalationData);
    } else {
      const count = await Escalation.countDocuments({});
      const caseId = `ESC-${String(count + 1).padStart(3, '0')}`;
      escalation = await Escalation.create({
        caseId,
        ...newEscalationData
      });
    }

    // Notify coordinator
    const title = 'New Parent Escalation';
    const message = `A new ${priority} priority issue was raised by parent ${parentName} regarding student ${studentName}.`;
    if (isMock) {
      await mockDb.createNotification({
        recipient: 'user_coord_1',
        sender: req.user._id,
        title,
        message,
        type: 'enquiry'
      });
    } else {
      await Notification.create({
        recipient: 'user_coord_1',
        sender: req.user._id,
        title,
        message,
        type: 'enquiry'
      });
    }

    res.status(201).json({ success: true, data: escalation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update/Resolve parent escalation
// @route   PUT /api/parent/escalations/:id
// @access  Private (Coordinator, Admin)
exports.updateEscalation = async (req, res) => {
  try {
    const { priority, status, internalNotes, noteText } = req.body;
    const isMock = checkIsMock();
    let escalation;

    if (isMock) {
      escalation = await mockDb.getEscalationById(req.params.id);
    } else {
      escalation = await Escalation.findById(req.params.id);
    }

    if (!escalation) {
      return res.status(404).json({ success: false, message: 'Escalation case not found' });
    }

    const updates = {};
    if (priority) updates.priority = priority;
    if (status) updates.status = status;
    if (internalNotes !== undefined) updates.internalNotes = internalNotes;

    // Add to resolutionHistory if status changed or a note was added
    const historyEntry = {
      status: status || escalation.status,
      note: noteText || (status ? `Status updated to ${status}` : 'Internal notes updated'),
      date: new Date()
    };
    updates.resolutionHistory = [...(escalation.resolutionHistory || []), historyEntry];

    if (isMock) {
      escalation = await mockDb.updateEscalation(req.params.id, updates);
    } else {
      escalation = await Escalation.findByIdAndUpdate(req.params.id, updates, { new: true });
    }

    // Notification logic
    if (status === 'Meeting Scheduled') {
      let parentId;
      if (isMock) {
        const parentObj = mockDb.mockState.users.find(u => u.name === escalation.parentName && u.role === 'parent');
        parentId = parentObj?._id;
      } else {
        const parentObj = await User.findOne({ name: escalation.parentName, role: 'parent' });
        parentId = parentObj?._id;
      }

      if (parentId) {
        const title = 'Meeting Scheduled';
        const message = `A coordinator has scheduled a meeting to discuss your case (${escalation.caseId}). Details: ${noteText || 'Please contact coordinator office.'}`;
        if (isMock) {
          await mockDb.createNotification({
            recipient: parentId,
            sender: req.user._id,
            title,
            message,
            type: 'meeting'
          });
        } else {
          await Notification.create({
            recipient: parentId,
            sender: req.user._id,
            title,
            message,
            type: 'meeting'
          });
        }
      }
    } else if (status === 'Resolved') {
      let parentId;
      let teacherId;
      if (isMock) {
        const parentObj = mockDb.mockState.users.find(u => u.name === escalation.parentName && u.role === 'parent');
        parentId = parentObj?._id;
        const teacherObj = mockDb.mockState.users.find(u => u.name === escalation.teacherName && u.role === 'teacher');
        teacherId = teacherObj?._id;
      } else {
        const parentObj = await User.findOne({ name: escalation.parentName, role: 'parent' });
        parentId = parentObj?._id;
        const teacherObj = await User.findOne({ name: escalation.teacherName, role: 'teacher' });
        teacherId = teacherObj?._id;
      }

      const title = 'Case Resolved';
      const message = `Parent escalation case (${escalation.caseId}) has been marked as Resolved. Resolution: ${noteText || 'Issue addressed.'}`;

      if (parentId) {
        if (isMock) {
          await mockDb.createNotification({ recipient: parentId, sender: req.user._id, title, message, type: 'enquiry' });
        } else {
          await Notification.create({ recipient: parentId, sender: req.user._id, title, message, type: 'enquiry' });
        }
      }
      if (teacherId) {
        if (isMock) {
          await mockDb.createNotification({ recipient: teacherId, sender: req.user._id, title, message, type: 'feedback' });
        } else {
          await Notification.create({ recipient: teacherId, sender: req.user._id, title, message, type: 'feedback' });
        }
      }
    }

    res.status(200).json({ success: true, data: escalation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

