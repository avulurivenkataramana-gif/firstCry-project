require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const { connectDB, checkIsMock } = require('./config/db');
const mongoose = require('mongoose');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const curriculumRoutes = require('./routes/curriculumRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const activityRoutes = require('./routes/activityRoutes');
const materialRoutes = require('./routes/materialRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiRoutes = require('./routes/aiRoutes');
const parentRoutes = require('./routes/parentRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Model Imports (for seeding)
const User = require('./models/User');
const Activity = require('./models/Activity');
const Material = require('./models/Material');
const CurriculumPlan = require('./models/CurriculumPlan');
const LessonPlan = require('./models/LessonPlan');
const Notification = require('./models/Notification');
const Attendance = require('./models/Attendance');
const Notice = require('./models/Notice');
const ChildProgress = require('./models/ChildProgress');
const mockDb = require('./services/mockDb');

const app = express();

// ── Security Middlewares ─────────────────────────────────────────────────────

// Helmet: Set secure HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // Disable CSP for API-only server
}));

// CORS: Restrict to allowed origins
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    
    // Check if origin is explicitly allowed
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Dynamic fallback for easier deployment on Render/Vercel
    if (origin.endsWith('.onrender.com') || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: '10mb' }));

// Mongo Sanitize: Prevent NoSQL injection
app.use(mongoSanitize());

// Rate limiter for auth routes (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per window per IP
  message: { success: false, message: 'Too many attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Health Check ─────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    database: checkIsMock() ? 'mock' : 'mongodb',
    timestamp: new Date().toISOString(),
  });
});

// URL Rewrite Middleware: If a request doesn't start with /api, automatically prefix /api
app.use((req, res, next) => {
  if (!req.url.startsWith('/api') && req.url !== '/' && !req.url.includes('.')) {
    req.url = `/api${req.url}`;
  }
  next();
});

// ── Mount API Routes ─────────────────────────────────────────────────────────

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/curriculum', curriculumRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/admin', adminRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Curriculum Planner Dashboard API',
    database: checkIsMock() ? 'Mock In-Memory DB' : 'MongoDB Active'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
});

const PORT = process.env.PORT || 5002;

// Seed Real MongoDB Helper
const seedDatabase = async () => {
  try {
    // Dynamic migration: Ensure all existing seeded users are APPROVED so they can log in immediately
    await User.updateMany(
      { 
        email: { 
          $in: [
            'coordinator@intellitots.com', 
            'teacher@intellitots.com', 
            'sneha@intellitots.com', 
            'parent@intellitots.com', 
            'avulurivenkataramana@gmail.com'
          ] 
        } 
      },
      { $set: { accountStatus: 'APPROVED' } }
    );

    const userCount = await User.countDocuments({});
    if (userCount > 0) {
      console.log('Database already seeded. Skipping seed.');
      return;
    }

    console.log('Database is empty. Starting seeding process...');

    // 1. Seed Users (need to map string IDs to ObjectIds)
    const idMap = {};
    const seededUsers = [];

    for (const u of mockDb.mockState.users) {
      const newId = new mongoose.Types.ObjectId();
      idMap[u._id] = newId;

      // Assign correct plaintext password per role — schema pre-save will hash it
      let plainPassword = 'Teach@123';
      if (u.role === 'admin') plainPassword = 'venky123';
      else if (u.role === 'coordinator') plainPassword = 'Coord@123';
      else if (u.role === 'parent') plainPassword = 'Parent@123';

      const userDoc = new User({
        _id: newId,
        name: u.name,
        email: u.email,
        password: plainPassword,
        role: u.role,
        phoneNumber: u.phoneNumber,
        classroom: u.classroom,
        childName: u.childName || '',
        performanceScore: u.performanceScore,
        accountStatus: 'APPROVED'
      });

      await userDoc.save();
      seededUsers.push(userDoc);
    }
    console.log(`Seeded ${seededUsers.length} Users.`);

    // 2. Seed Activities
    const seededActivities = [];
    for (const a of mockDb.mockState.activities) {
      const newId = new mongoose.Types.ObjectId();
      idMap[a._id] = newId;

      const actDoc = await Activity.create({
        _id: newId,
        name: a.name,
        category: a.category,
        ageGroup: a.ageGroup,
        duration: a.duration,
        materialsRequired: a.materialsRequired,
        instructions: a.instructions,
        learningOutcome: a.learningOutcome,
        isTemplate: a.isTemplate,
        favoriteBy: a.favoriteBy.map(fid => idMap[fid]).filter(Boolean)
      });
      seededActivities.push(actDoc);
    }
    console.log(`Seeded ${seededActivities.length} Activities.`);

    // 3. Seed Materials
    const seededMaterials = [];
    for (const m of mockDb.mockState.materials) {
      const matDoc = await Material.create({
        name: m.name,
        quantity: m.quantity,
        availableQuantity: m.availableQuantity,
        requiredQuantity: m.requiredQuantity,
        assignedTeacher: m.assignedTeacher
      });
      seededMaterials.push(matDoc);
    }
    console.log(`Seeded ${seededMaterials.length} Materials.`);

    // 4. Seed Curriculum Plans
    const seededCurriculums = [];
    for (const c of mockDb.mockState.curriculumPlans) {
      const newId = new mongoose.Types.ObjectId();
      idMap[c._id] = newId;

      const currDoc = await CurriculumPlan.create({
        _id: newId,
        title: c.title,
        themeName: c.themeName,
        month: c.month,
        academicYear: c.academicYear,
        learningObjectives: c.learningObjectives,
        learningOutcomes: c.learningOutcomes,
        skillsCovered: c.skillsCovered,
        weeklyBreakdown: c.weeklyBreakdown,
        notes: c.notes,
        status: c.status,
        feedback: c.feedback,
        createdBy: idMap[c.createdBy],
        approvedBy: c.approvedBy ? idMap[c.approvedBy] : undefined
      });
      seededCurriculums.push(currDoc);
    }
    console.log(`Seeded ${seededCurriculums.length} Curriculum Plans.`);

    // 5. Seed Lesson Plans
    const seededLessons = [];
    for (const l of mockDb.mockState.lessonPlans) {
      await LessonPlan.create({
        weekNumber: l.weekNumber,
        topic: l.topic,
        learningGoal: l.learningGoal,
        subjectArea: l.subjectArea,
        activities: l.activities.map(aid => idMap[aid]).filter(Boolean),
        storyTime: l.storyTime,
        rhymes: l.rhymes,
        assessmentMethod: l.assessmentMethod,
        duration: l.duration,
        status: l.status,
        feedback: l.feedback,
        teacher: idMap[l.teacher],
        date: l.date
      });
      seededLessons.push(l);
    }
    console.log(`Seeded ${seededLessons.length} Lesson Plans.`);

    // 6. Seed Notifications
    for (const n of mockDb.mockState.notifications) {
      await Notification.create({
        recipient: n.recipient === 'all' ? 'all' : idMap[n.recipient]?.toString() || n.recipient,
        sender: idMap[n.sender],
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: n.isRead
      });
    }
    console.log('Notifications seeded.');

    // 7. Seed Attendance
    for (const a of mockDb.mockState.attendance) {
      await Attendance.create({
        studentName: a.studentName,
        classroom: a.classroom,
        date: a.date,
        status: a.status,
        markedBy: idMap[a.markedBy] || idMap['user_teach_1']
      });
    }
    console.log('Attendance seeded.');

    // 8. Seed Notices
    for (const n of mockDb.mockState.notices) {
      await Notice.create({
        title: n.title,
        content: n.content,
        targetClassroom: n.targetClassroom,
        createdBy: idMap[n.createdBy] || idMap['user_admin_1']
      });
    }
    console.log('Notices seeded.');

    // 9. Seed ChildProgress
    for (const p of mockDb.mockState.childProgress) {
      await ChildProgress.create({
        studentName: p.studentName,
        parent: idMap[p.parent] || idMap['user_parent_1'],
        classroom: p.classroom,
        skills: p.skills,
        teacherFeedback: p.teacherFeedback,
        updatedBy: idMap[p.updatedBy] || idMap['user_teach_1']
      });
    }
    console.log('Child progress charts seeded.');
    console.log('Database Seeding Completed Successfully!');
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};

// Start Server Function
const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Seed if MongoDB is active
  if (!checkIsMock()) {
    await seedDatabase();
  }

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();
