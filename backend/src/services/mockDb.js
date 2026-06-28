const bcrypt = require('bcryptjs');

// Helper to hash passwords sync for mock setup
const hashPassword = (pwd) => bcrypt.hashSync(pwd, 10);

const mockState = {
  users: [
    {
      _id: 'user_admin_1',
      name: 'Admin User',
      email: 'avulurivenkataramana@gmail.com',
      password: hashPassword('venky123'),
      role: 'admin',
      phoneNumber: '+91 98765 43210',
      classroom: 'All Classrooms',
      profileImage: '',
      isVerified: true,
      accountStatus: 'APPROVED',
      performanceScore: 98,
      createdAt: new Date('2026-01-15T08:00:00Z')
    },
    {
      _id: 'user_coord_1',
      name: 'Karan Malhotra',
      email: 'coordinator@intellitots.com',
      password: hashPassword('Coord@123'),
      role: 'coordinator',
      phoneNumber: '+91 98765 43211',
      classroom: 'Curriculum Office',
      profileImage: '',
      isVerified: true,
      accountStatus: 'APPROVED',
      performanceScore: 95,
      createdAt: new Date('2026-01-20T08:00:00Z')
    },
    {
      _id: 'user_teach_1',
      name: 'Priya Patel',
      email: 'teacher@intellitots.com',
      password: hashPassword('Teach@123'),
      role: 'teacher',
      phoneNumber: '+91 98765 43212',
      classroom: 'Nursery-A',
      profileImage: '',
      isVerified: true,
      accountStatus: 'APPROVED',
      performanceScore: 92,
      createdAt: new Date('2026-02-01T08:00:00Z')
    },
    {
      _id: 'user_teach_2',
      name: 'Sneha Reddy',
      email: 'sneha@intellitots.com',
      password: hashPassword('Teach@123'),
      role: 'teacher',
      phoneNumber: '+91 98765 43213',
      classroom: 'Kindergarten-B',
      profileImage: '',
      isVerified: true,
      accountStatus: 'APPROVED',
      performanceScore: 88,
      createdAt: new Date('2026-02-15T08:00:00Z')
    },
    {
      _id: 'user_parent_1',
      name: 'Rajesh Patel',
      email: 'parent@intellitots.com',
      password: hashPassword('Parent@123'),
      role: 'parent',
      childName: 'Aarav Patel',
      classroom: 'Nursery-A',
      phoneNumber: '+91 98765 43214',
      profileImage: '',
      isVerified: true,
      accountStatus: 'APPROVED',
      createdAt: new Date('2026-06-01T08:00:00Z')
    }
  ],

  students: [
    {
      _id: 'stud_1',
      name: 'Aarav Patel',
      admissionNumber: 'ADM-2026-001',
      classroom: 'Nursery-A',
      age: 4,
      gender: 'Male',
      fatherName: 'Rajesh Patel',
      parentName: 'Rajesh Patel',
      parentEmail: 'parent@school.com',
      relationship: 'Father',
      contactNumber: '+91 98765 43214',
      parentId: 'user_parent_1',
      observations: [
        {
          _id: 'obs_1',
          date: new Date('2026-06-16T10:00:00Z'),
          teacherName: 'Priya Patel',
          content: 'Aarav is adapting very well to the new classroom routine and shows keen interest in building blocks.',
          createdBy: 'user_teach_1'
        }
      ],
      createdAt: new Date('2026-06-01T08:30:00Z')
    }
  ],

  roleRequests: [
    {
      _id: 'req_1',
      userId: 'user_teach_2',
      userName: 'Sneha Reddy',
      requestedRole: 'coordinator',
      requestedPermissions: 'Curriculum Approvals, Template Management',
      requestDate: new Date('2026-06-24T09:00:00Z'),
      status: 'Pending',
      rejectionReason: ''
    },
    {
      _id: 'req_2',
      userId: 'user_parent_1',
      userName: 'Rajesh Patel',
      requestedRole: 'coordinator',
      requestedPermissions: 'Syllabus Designer',
      requestDate: new Date('2026-06-23T11:00:00Z'),
      status: 'Rejected',
      rejectionReason: 'Parents are not allowed department coordinator access.'
    },
    {
      _id: 'req_3',
      userId: 'user_teach_1',
      userName: 'Priya Patel',
      requestedRole: 'admin',
      requestedPermissions: 'Audit Logs, Roles & Permissions',
      requestDate: new Date('2026-06-24T14:00:00Z'),
      status: 'Pending',
      rejectionReason: ''
    }
  ],

  curriculumPlans: [
    {
      _id: 'curr_plan_1',
      title: 'Exploring Nature & Seasons',
      themeName: 'Rainy Season & Environment',
      month: 'June',
      academicYear: '2026-27',
      description: 'A comprehensive curriculum plan focusing on environmental themes, puddle-walk explorations, and creative rainy season arts and crafts.',
      learningObjectives: [
        'Understand water cycle in basic terms',
        'Identify items worn/used in the rainy season (umbrella, raincoat)',
        'Develop observation skills through outdoor nature walks'
      ],
      learningOutcomes: [
        'Child can name at least 3 things associated with rain',
        'Child shows interest in weather tracking activities',
        'Child identifies colors of the rainbow'
      ],
      skillsCovered: ['Cognitive Development', 'Gross Motor Skills', 'Sensory Play'],
      weeklyBreakdown: {
        week1: 'Introduction to Clouds and Rain',
        week2: 'Water Animals & Paper Boats',
        week3: 'Rainbow Colors and Art',
        week4: 'Weather Chart & Wrap-up'
      },
      notes: 'Ensure all students bring rain boots for the outdoor puddle activity.',
      activities: ['act_1', 'act_6'],
      status: 'approved',
      feedback: 'Excellent integration of sensory play with weather concepts.',
      createdBy: 'user_teach_1',
      approvedBy: 'user_coord_1',
      createdAt: new Date('2026-06-01T09:00:00Z')
    },
    {
      _id: 'curr_plan_2',
      title: 'Our Helpful Community Helpers',
      themeName: 'Doctors, Firefighters & Teachers',
      month: 'July',
      academicYear: '2026-27',
      description: 'An interactive curriculum designed to build community awareness, fire safety safety rules, and role-playing hospital and safety activities.',
      learningObjectives: [
        'Identify local community helper roles',
        'Understand basic emergency safety numbers',
        'Foster gratitude towards support workers'
      ],
      learningOutcomes: [
        'Child role-plays doctor-patient scenario',
        'Child names firefighter tools correctly',
        'Child demonstrates polite greetings to helpers'
      ],
      skillsCovered: ['Social-Emotional Development', 'Language & Communication', 'Creative Expression'],
      weeklyBreakdown: {
        week1: 'Healthcare Heroes (Doctors & Nurses)',
        week2: 'Safety Officers (Firefighters & Police)',
        week3: 'Neighborhood Builders (Cleaners, Electricians)',
        week4: 'Role Play Exhibition and Parents Visit'
      },
      notes: 'Coordinate with local fire station for a brief virtual/physical visit.',
      activities: [],
      status: 'submitted',
      feedback: '',
      createdBy: 'user_teach_1',
      createdAt: new Date('2026-06-10T11:00:00Z')
    },
    {
      _id: 'curr_plan_3',
      title: 'Introduction to Animals & Habitats',
      themeName: 'Jungle Safaris & Farms',
      month: 'August',
      academicYear: '2026-27',
      description: 'A theme covering wild animals, jungle safaris, marine life, and farm animals, emphasizing identification, sounds, and habitats.',
      learningObjectives: [
        'Differentiate wild animals vs domestic animals',
        'Identify animal sounds and habitats',
        'Develop empathy for living creatures'
      ],
      learningOutcomes: [
        'Child mimics at least 5 animal sounds',
        'Child groups animals by habitat (land/water)',
        'Child understands simple herbivore/carnivore categories'
      ],
      skillsCovered: ['Cognitive Development', 'Scientific Exploration', 'Storytelling'],
      weeklyBreakdown: {
        week1: 'Farm Animals & Barns',
        week2: 'Jungle Safaris (Wild Animals)',
        week3: 'Ocean Wonders (Marine Life)',
        week4: 'Animal Craft Exhibition'
      },
      notes: 'Prepare animal cut-outs and soft toys.',
      activities: [],
      status: 'draft',
      feedback: '',
      createdBy: 'user_teach_2',
      createdAt: new Date('2026-06-12T14:30:00Z')
    }
  ],

  lessonPlans: [
    {
      _id: 'lesson_1',
      weekNumber: 1,
      topic: 'How Rain Forms & Sounds Like',
      learningGoal: 'Recognize rain sounds and basic clouds.',
      subjectArea: 'Science Exploration',
      activities: ['act_2', 'act_6'], // References to activities
      storyTime: 'The Little Raindrop Journey',
      rhymes: 'Rain Rain Go Away, Pitter Patter Raindrops',
      assessmentMethod: 'Observation of group weather chart creation',
      duration: 45,
      status: 'approved',
      teacher: 'user_teach_1',
      feedback: 'Good simple explanation.',
      date: new Date('2026-06-15').toISOString().split('T')[0]
    },
    {
      _id: 'lesson_2',
      weekNumber: 1,
      topic: 'Sensory Mud & Water Play',
      learningGoal: 'Develop fine motor skills through wet textured play.',
      subjectArea: 'Fine Motor Skills',
      activities: ['act_1'],
      storyTime: 'Peppa Pigs Muddy Puddles',
      rhymes: 'Row Row Row Your Boat',
      assessmentMethod: 'Participation in molding clay/mud shapes',
      duration: 60,
      status: 'submitted',
      teacher: 'user_teach_1',
      feedback: '',
      date: new Date('2026-06-17').toISOString().split('T')[0]
    },
    {
      _id: 'lesson_3',
      weekNumber: 2,
      topic: 'Paper Boat Craft and Float/Sink Test',
      learningGoal: 'Understand density and buoyancy (Float or Sink).',
      subjectArea: 'Science Exploration',
      activities: ['act_1', 'act_4'],
      storyTime: 'The Toy Boat Adventures',
      rhymes: 'Five Little Ducks went swimming one day',
      assessmentMethod: 'Quiz asking which items float or sink',
      duration: 50,
      status: 'draft',
      teacher: 'user_teach_2',
      feedback: '',
      date: new Date('2026-06-22').toISOString().split('T')[0]
    }
  ],

  activities: [
    {
      _id: 'act_1',
      name: 'Origami Paper Boats',
      category: 'Art & Craft',
      ageGroup: '3-4 years',
      duration: 30,
      materialsRequired: ['Colored Craft Papers', 'Water Tub', 'Glitter'],
      instructions: [
        'Fold the paper in half horizontally.',
        'Fold corner flaps to the middle to form a triangle.',
        'Open the base and fold into a square diamond.',
        'Pull the side flaps out to reveal the boat shape.',
        'Test floating the boats in the class water tub.'
      ],
      learningOutcome: 'Develops fine motor precision and understanding of folding symmetry.',
      isTemplate: true,
      favoriteBy: ['user_teach_1']
    },
    {
      _id: 'act_2',
      name: 'Rain Sound Makers',
      category: 'Music & Dance',
      ageGroup: '2-3 years',
      duration: 25,
      materialsRequired: ['Plastic Bottles', 'Rice Grains', 'Dried Beans', 'Ribbons'],
      instructions: [
        'Fill plastic bottles halfway with rice or beans.',
        'Seal the bottle caps securely with tape.',
        'Shake the bottle gently to simulate light rain sounds.',
        'Shake hard to simulate a thunderstorm.',
        'Decorate bottles with colorful ribbons.'
      ],
      learningOutcome: 'Sensory awareness of sound frequencies and rhythmic control.',
      isTemplate: true,
      favoriteBy: ['user_teach_1', 'user_teach_2']
    },
    {
      _id: 'act_3',
      name: 'Rainbow Color Sorting',
      category: 'Mathematics',
      ageGroup: '3-4 years',
      duration: 20,
      materialsRequired: ['Colored Pom Poms', 'Matching Bowls', 'Tongs'],
      instructions: [
        'Place mixed pom-poms in a central tray.',
        'Give children tongs to pick up a pom-pom.',
        'Ask them to place it in the bowl with the corresponding color.',
        'Count the number of pom-poms in each bowl.'
      ],
      learningOutcome: 'Color identification, categorization, counting, and hand-eye coordination.',
      isTemplate: true,
      favoriteBy: []
    },
    {
      _id: 'act_4',
      name: 'Float or Sink Experiment',
      category: 'Science Exploration',
      ageGroup: '4-5 years',
      duration: 40,
      materialsRequired: ['Water Tub', 'Stone', 'Leaf', 'Plastic Toy', 'Metal Spoon', 'Wood Block'],
      instructions: [
        'Gather kids around the water tub.',
        'Hold up each object and ask kids to predict if it will float or sink.',
        'Drop the object into the water and observe.',
        'Record findings on a chart paper.'
      ],
      learningOutcome: 'Scientific inquiry, hypothethical thinking, and observation skills.',
      isTemplate: true,
      favoriteBy: ['user_teach_1']
    },
    {
      _id: 'act_5',
      name: 'Jungle Animal Mimics',
      category: 'Storytelling',
      ageGroup: '2-3 years',
      duration: 20,
      materialsRequired: ['Animal Face Masks', 'Jungle Background Sounds'],
      instructions: [
        'Distribute animal masks (lion, monkey, elephant).',
        'Tell a short story about the jungle safari.',
        'When an animal name is called, children with that mask stand up, make the sound, and copy the walk.'
      ],
      learningOutcome: 'Expressive language, auditory memory, and creative movement.',
      isTemplate: true,
      favoriteBy: []
    },
    {
      _id: 'act_6',
      name: 'Sponge Painting Clouds',
      category: 'Art & Craft',
      ageGroup: '3-4 years',
      duration: 30,
      materialsRequired: ['Sponges', 'Blue Chart Paper', 'White Washable Paint'],
      instructions: [
        'Dab sponge into white paint.',
        'Gently press sponge on blue chart paper to create fluffy cloud structures.',
        'Sprinkle silver glitter for a rainy cloud effect.'
      ],
      learningOutcome: 'Tactile sensory stimulation and fine motor development.',
      isTemplate: true,
      favoriteBy: []
    }
  ],

  materials: [
    {
      _id: 'mat_1',
      name: 'Colored Origami Papers',
      quantity: 500,
      availableQuantity: 420,
      requiredQuantity: 200,
      status: 'in-stock',
      assignedTeacher: 'Priya Patel (Nursery-A)'
    },
    {
      _id: 'mat_2',
      name: 'Washable White Paint (Litres)',
      quantity: 5,
      availableQuantity: 1.2,
      requiredQuantity: 2.0,
      status: 'low-stock',
      assignedTeacher: 'Sneha Reddy (Kindergarten-B)'
    },
    {
      _id: 'mat_3',
      name: 'Plastic Water Tubs',
      quantity: 10,
      availableQuantity: 8,
      requiredQuantity: 8,
      status: 'in-stock',
      assignedTeacher: 'Shared Facility'
    },
    {
      _id: 'mat_4',
      name: 'Silver Glitter Tubes',
      quantity: 20,
      availableQuantity: 1,
      requiredQuantity: 10,
      status: 'out-of-stock',
      assignedTeacher: 'Priya Patel (Nursery-A)'
    },
    {
      _id: 'mat_5',
      name: 'Wooden Play Blocks Set',
      quantity: 12,
      availableQuantity: 12,
      requiredQuantity: 10,
      status: 'in-stock',
      assignedTeacher: 'Nursery-B Classroom'
    }
  ],

  notifications: [
    {
      _id: 'notif_parent_feedback',
      recipient: 'user_parent_1',
      sender: 'user_teach_1',
      title: 'Teacher Feedback',
      message: 'Aarav has shown outstanding performance in fine motor skill activities this week!',
      type: 'feedback',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 3)
    },
    {
      _id: 'notif_parent_progress',
      recipient: 'user_parent_1',
      sender: 'user_teach_1',
      title: 'Progress Milestone Met',
      message: 'Aarav has successfully completed the "Sensory Play" curriculum milestone.',
      type: 'progress',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 8)
    },
    {
      _id: 'notif_parent_attendance',
      recipient: 'user_parent_1',
      sender: 'user_teach_1',
      title: 'Attendance Update',
      message: 'Aarav was marked absent on 2026-06-19.',
      type: 'attendance',
      isRead: true,
      createdAt: new Date(Date.now() - 3600000 * 24 * 4)
    },
    {
      _id: 'notif_parent_meeting',
      recipient: 'user_parent_1',
      sender: 'user_teach_1',
      title: 'PTM Schedule Reminder',
      message: 'Reminder: Parent-Teacher Meeting scheduled for Saturday at 10:00 AM.',
      type: 'meeting',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 12)
    },
    {
      _id: 'notif_parent_announcement',
      recipient: 'all',
      sender: 'user_admin_1',
      title: 'Important Class Notice',
      message: 'Please remember to send rain boots with children for upcoming rain activities.',
      type: 'announcement',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 18)
    },
    {
      _id: 'notif_1',
      recipient: 'user_teach_1',
      sender: 'user_coord_1',
      title: 'Curriculum Approved',
      message: 'Your plan "Exploring Nature & Seasons" has been approved.',
      type: 'approval_status',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 2)
    },
    {
      _id: 'notif_2',
      recipient: 'user_teach_1',
      sender: 'user_coord_1',
      title: 'Curriculum Rejected',
      message: 'Revisions requested for August Animals theme. Please add more fine motor tasks.',
      type: 'approval_status',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 24)
    },
    {
      _id: 'notif_3',
      recipient: 'user_teach_1',
      sender: 'user_coord_1',
      title: 'Coordinator Feedback',
      message: 'Karan Malhotra left feedback: "Nice integration of physical play puddles in Week 1!"',
      type: 'feedback',
      isRead: false,
      createdAt: new Date(Date.now() - 3600005)
    },
    {
      _id: 'notif_4',
      recipient: 'user_teach_1',
      sender: 'user_parent_1',
      title: 'New Parent Message',
      message: 'Rajesh Patel: "Aarav will be picked up early at 11:30 AM today for a doctor appointment."',
      type: 'parent_message',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 3)
    },
    {
      _id: 'notif_5',
      recipient: 'user_teach_1',
      sender: 'user_admin_1',
      title: 'Material Request Approved',
      message: 'Request for "Safety Scissors and Colored Construction Papers" has been approved.',
      type: 'material_request',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 48)
    },
    {
      _id: 'notif_6',
      recipient: 'user_teach_1',
      sender: 'user_admin_1',
      title: 'Upcoming Activity Reminder',
      message: 'Reminder: "Origami Paper Boats" activity is scheduled for tomorrow morning.',
      type: 'activity_reminder',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 4)
    },
    {
      _id: 'notif_7',
      recipient: 'user_teach_1',
      sender: 'user_admin_1',
      title: 'Upcoming Submission Deadline',
      message: 'Syllabus drafts for July: "Community Helpers" are due in 3 days.',
      type: 'deadline',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 5)
    }
  ],

  attendance: [
    { _id: 'att_1', studentName: 'Aarav Patel', classroom: 'Nursery-A', date: '2026-06-15', status: 'present', markedBy: 'user_teach_1', createdAt: new Date('2026-06-15T09:00:00Z'), updatedAt: new Date('2026-06-15T09:00:00Z') },
    { _id: 'att_2', studentName: 'Aarav Patel', classroom: 'Nursery-A', date: '2026-06-16', status: 'present', markedBy: 'user_teach_1', createdAt: new Date('2026-06-16T09:00:00Z'), updatedAt: new Date('2026-06-16T09:00:00Z') },
    { _id: 'att_3', studentName: 'Aarav Patel', classroom: 'Nursery-A', date: '2026-06-17', status: 'present', markedBy: 'user_teach_1', createdAt: new Date('2026-06-17T09:00:00Z'), updatedAt: new Date('2026-06-17T09:00:00Z') },
    { _id: 'att_4', studentName: 'Aarav Patel', classroom: 'Nursery-A', date: '2026-06-18', status: 'present', markedBy: 'user_teach_1', createdAt: new Date('2026-06-18T09:00:00Z'), updatedAt: new Date('2026-06-18T09:00:00Z') },
    { _id: 'att_5', studentName: 'Aarav Patel', classroom: 'Nursery-A', date: '2026-06-19', status: 'absent', markedBy: 'user_teach_1', createdAt: new Date('2026-06-19T09:00:00Z'), updatedAt: new Date('2026-06-19T09:00:00Z') }
  ],

  notices: [
    { _id: 'notice_1', title: 'Parent-Teacher Meeting next Saturday', content: 'Dear parents, please attend the PTM to discuss term progress on Saturday morning at 10 AM.', targetClassroom: 'All', createdBy: 'user_admin_1', createdAt: new Date('2026-06-12T10:00:00Z') },
    { _id: 'notice_2', title: 'Rainy Day Alert - Bring Rainboots', content: 'Dear parents of Nursery-A, please ensure kids bring rain boots and raincoats for outdoor puddle play this Friday.', targetClassroom: 'Nursery-A', createdBy: 'user_teach_1', createdAt: new Date('2026-06-14T09:00:00Z') }
  ],

  childProgress: [
    {
      _id: 'prog_1',
      studentName: 'Aarav Patel',
      parent: 'user_parent_1',
      classroom: 'Nursery-A',
      skills: [
        { skillName: 'Cognitive Development', score: 85 },
        { skillName: 'Gross Motor Skills', score: 90 },
        { skillName: 'Sensory Play', score: 95 },
        { skillName: 'Social-Emotional', score: 80 },
        { skillName: 'Language & Communication', score: 88 }
      ],
      teacherFeedback: 'Aarav shows great curiosity during water play and float/sink experiments. Excellent fine motor progress.',
      updatedBy: 'user_teach_1',
      updatedAt: new Date()
    }
  ],
  escalations: [
    {
      _id: 'esc_1',
      caseId: 'ESC-001',
      studentName: 'Aarav Patel',
      parentName: 'Rajesh Patel',
      teacherName: 'Priya Patel',
      classroom: 'Nursery-A',
      issueCategory: 'Medical',
      priority: 'High',
      status: 'Pending',
      createdAt: new Date('2026-06-20T10:00:00Z'),
      teacherNotes: 'Aarav was breathing a bit heavily during outdoor play.',
      parentDescription: 'Aarav has slight dust allergies. Please make sure he does not play in very dusty areas.',
      attachments: ['allergy_note.png'],
      internalNotes: '',
      resolutionHistory: []
    },
    {
      _id: 'esc_2',
      caseId: 'ESC-002',
      studentName: 'Aarav Patel',
      parentName: 'Rajesh Patel',
      teacherName: 'Priya Patel',
      classroom: 'Nursery-A',
      issueCategory: 'Learning Difficulty',
      priority: 'Medium',
      status: 'In Progress',
      createdAt: new Date('2026-06-18T14:30:00Z'),
      teacherNotes: 'Struggles slightly with pronunciation of phonetic sounds.',
      parentDescription: 'We are practicing phonics at home. Wanted to check progress.',
      attachments: [],
      internalNotes: 'Suggested speech-focused exercises.',
      resolutionHistory: [
        { status: 'Pending', note: 'Case registered', date: new Date('2026-06-18T14:30:00Z') },
        { status: 'In Progress', note: 'Sent phonics sheet', date: new Date('2026-06-19T10:00:00Z') }
      ]
    },
    {
      _id: 'esc_3',
      caseId: 'ESC-003',
      studentName: 'Aarav Patel',
      parentName: 'Rajesh Patel',
      teacherName: 'Priya Patel',
      classroom: 'Nursery-A',
      issueCategory: 'Special Needs',
      priority: 'Low',
      status: 'Meeting Scheduled',
      createdAt: new Date('2026-06-15T11:00:00Z'),
      teacherNotes: 'Need scheduling options for next PTM.',
      parentDescription: 'Would like to schedule coordinate support review.',
      attachments: [],
      internalNotes: 'Meeting set for 2026-06-28.',
      resolutionHistory: [
        { status: 'Meeting Scheduled', note: 'Coordinator setup meeting', date: new Date('2026-06-20T16:00:00Z') }
      ]
    }
  ]
};

// Generate next dynamic id
const nextId = (collectionName, prefix) => {
  const count = mockState[collectionName].length + 1;
  return `${prefix}_${count}_${Date.now().toString().slice(-4)}`;
};

module.exports = {
  mockState,
  
  // Auth Helpers
  findUserByEmail: async (email) => {
    return mockState.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  findUserById: async (id) => {
    return mockState.users.find(u => u._id === id);
  },
  createUser: async (userData) => {
    const user = {
      _id: nextId('users', 'user'),
      performanceScore: 90,
      createdAt: new Date(),
      ...userData
    };
    if (user.password) {
      user.password = hashPassword(user.password);
    }
    mockState.users.push(user);
    return user;
  },
  getTeachers: async () => {
    return mockState.users.filter(u => u.role === 'teacher');
  },
  updateTeacherPerformance: async (id, score) => {
    const user = mockState.users.find(u => u._id === id);
    if (user) {
      user.performanceScore = score;
    }
    return user;
  },
  updateUserRole: async (id, role) => {
    const user = mockState.users.find(u => u._id === id);
    if (user) {
      user.role = role;
    }
    return user;
  },
  updateUserPassword: async (id, hashedPassword) => {
    const user = mockState.users.find(u => u._id === id);
    if (user) {
      user.password = hashedPassword;
    }
    return user;
  },
  updateUser: async (id, updates) => {
    const user = mockState.users.find(u => u._id === id);
    if (user) {
      Object.assign(user, updates);
    }
    return user;
  },
  getPendingUsers: async () => {
    return mockState.users.filter(u => u.accountStatus === 'PENDING' && u.role !== 'admin');
  },
  updateUserStatus: async (id, status) => {
    const user = mockState.users.find(u => u._id === id);
    if (user) {
      user.accountStatus = status;
    }
    return user;
  },

  // Curriculum Helpers
  getCurriculums: async () => {
    return [...mockState.curriculumPlans];
  },
  getCurriculumById: async (id) => {
    return mockState.curriculumPlans.find(c => c._id === id);
  },
  createCurriculum: async (data, userId) => {
    const plan = {
      _id: nextId('curriculumPlans', 'curr_plan'),
      createdBy: userId,
      status: 'draft',
      feedback: '',
      createdAt: new Date(),
      ...data
    };
    mockState.curriculumPlans.push(plan);
    return plan;
  },
  updateCurriculum: async (id, data) => {
    const idx = mockState.curriculumPlans.findIndex(c => c._id === id);
    if (idx !== -1) {
      mockState.curriculumPlans[idx] = { ...mockState.curriculumPlans[idx], ...data };
      return mockState.curriculumPlans[idx];
    }
    return null;
  },
  deleteCurriculum: async (id) => {
    const idx = mockState.curriculumPlans.findIndex(c => c._id === id);
    if (idx !== -1) {
      const deleted = mockState.curriculumPlans[idx];
      mockState.curriculumPlans.splice(idx, 1);
      return deleted;
    }
    return null;
  },

  // Lesson Helpers
  getLessons: async () => {
    return [...mockState.lessonPlans];
  },
  getLessonById: async (id) => {
    return mockState.lessonPlans.find(l => l._id === id);
  },
  createLesson: async (data, userId) => {
    const lesson = {
      _id: nextId('lessonPlans', 'lesson'),
      teacher: userId,
      status: 'draft',
      feedback: '',
      createdAt: new Date(),
      ...data
    };
    mockState.lessonPlans.push(lesson);
    return lesson;
  },
  updateLesson: async (id, data) => {
    const idx = mockState.lessonPlans.findIndex(l => l._id === id);
    if (idx !== -1) {
      mockState.lessonPlans[idx] = { ...mockState.lessonPlans[idx], ...data };
      return mockState.lessonPlans[idx];
    }
    return null;
  },
  deleteLesson: async (id) => {
    const idx = mockState.lessonPlans.findIndex(l => l._id === id);
    if (idx !== -1) {
      const deleted = mockState.lessonPlans[idx];
      mockState.lessonPlans.splice(idx, 1);
      return deleted;
    }
    return null;
  },

  // Activities Helpers
  getActivities: async () => {
    return [...mockState.activities];
  },
  createActivity: async (data) => {
    const activity = {
      _id: nextId('activities', 'act'),
      isTemplate: false,
      favoriteBy: [],
      ...data
    };
    mockState.activities.push(activity);
    return activity;
  },
  updateActivity: async (id, data) => {
    const idx = mockState.activities.findIndex(a => a._id === id);
    if (idx !== -1) {
      mockState.activities[idx] = { ...mockState.activities[idx], ...data };
      return mockState.activities[idx];
    }
    return null;
  },
  deleteActivity: async (id) => {
    const idx = mockState.activities.findIndex(a => a._id === id);
    if (idx !== -1) {
      const deleted = mockState.activities[idx];
      mockState.activities.splice(idx, 1);
      return deleted;
    }
    return null;
  },
  toggleFavoriteActivity: async (id, userId) => {
    const activity = mockState.activities.find(a => a._id === id);
    if (activity) {
      if (!activity.favoriteBy) activity.favoriteBy = [];
      const userIdx = activity.favoriteBy.indexOf(userId);
      if (userIdx === -1) {
        activity.favoriteBy.push(userId);
      } else {
        activity.favoriteBy.splice(userIdx, 1);
      }
      return activity;
    }
    return null;
  },

  // Materials Helpers
  getMaterials: async () => {
    return [...mockState.materials];
  },
  createMaterial: async (data) => {
    const qty = parseInt(data.quantity || 0, 10);
    const avail = parseInt(data.availableQuantity || 0, 10);
    const req = parseInt(data.requiredQuantity || 0, 10);
    
    let status = 'in-stock';
    if (avail === 0) status = 'out-of-stock';
    else if (avail < req) status = 'low-stock';

    const material = {
      _id: nextId('materials', 'mat'),
      status,
      ...data,
      quantity: qty,
      availableQuantity: avail,
      requiredQuantity: req
    };
    mockState.materials.push(material);
    return material;
  },
  updateMaterial: async (id, data) => {
    const idx = mockState.materials.findIndex(m => m._id === id);
    if (idx !== -1) {
      const updated = { ...mockState.materials[idx], ...data };
      
      const avail = parseInt(updated.availableQuantity, 10);
      const req = parseInt(updated.requiredQuantity, 10);
      
      if (avail === 0) updated.status = 'out-of-stock';
      else if (avail < req) updated.status = 'low-stock';
      else updated.status = 'in-stock';

      mockState.materials[idx] = updated;
      return updated;
    }
    return null;
  },
  deleteMaterial: async (id) => {
    const idx = mockState.materials.findIndex(m => m._id === id);
    if (idx !== -1) {
      const deleted = mockState.materials[idx];
      mockState.materials.splice(idx, 1);
      return deleted;
    }
    return null;
  },

  // Notifications Helpers
  getNotifications: async (userId, role) => {
    let list = mockState.notifications.filter(n => n.recipient === userId || n.recipient === 'all' || userId === 'user_admin_1');
    if (role === 'parent') {
      const allowedTypes = ['feedback', 'progress', 'attendance', 'meeting', 'report', 'announcement', 'parent_message', 'enquiry'];
      list = list.filter(n => allowedTypes.includes(n.type));
    }
    return list.map(n => {
      const senderUser = mockState.users.find(u => u._id === n.sender);
      return {
        ...n,
        sender: senderUser ? { 
          _id: senderUser._id, 
          name: senderUser.name, 
          role: senderUser.role,
          childName: senderUser.childName,
          classroom: senderUser.classroom 
        } : n.sender
      };
    });
  },
  createNotification: async (data) => {
    const notif = {
      _id: nextId('notifications', 'notif'),
      isRead: false,
      createdAt: new Date(),
      ...data
    };
    mockState.notifications.unshift(notif); // Put newest first
    return notif;
  },
  markNotificationRead: async (id) => {
    const notif = mockState.notifications.find(n => n._id === id);
    if (notif) {
      notif.isRead = true;
      const senderUser = mockState.users.find(u => u._id === notif.sender);
      return {
        ...notif,
        sender: senderUser ? { 
          _id: senderUser._id, 
          name: senderUser.name, 
          role: senderUser.role,
          childName: senderUser.childName,
          classroom: senderUser.classroom 
        } : notif.sender
      };
    }
    return null;
  },
  markAllNotificationsRead: async (userId) => {
    mockState.notifications.forEach(n => {
      if (n.recipient === userId || n.recipient === 'all') {
        n.isRead = true;
      }
    });
    return true;
  },
  deleteNotification: async (id) => {
    const idx = mockState.notifications.findIndex(n => n._id === id);
    if (idx !== -1) {
      return mockState.notifications.splice(idx, 1)[0];
    }
    return null;
  },

  // Attendance Helpers
  getAttendance: async (classroom, studentName) => {
    let list = [...mockState.attendance];
    if (classroom) list = list.filter(a => a.classroom === classroom);
    if (studentName) list = list.filter(a => a.studentName.toLowerCase().includes(studentName.toLowerCase()));
    return list;
  },
  markAttendance: async (data, userId) => {
    const record = {
      _id: nextId('attendance', 'att'),
      markedBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    };
    mockState.attendance.push(record);
    return record;
  },
  updateAttendance: async (id, data) => {
    const idx = mockState.attendance.findIndex(a => a._id === id);
    if (idx !== -1) {
      mockState.attendance[idx] = { 
        ...mockState.attendance[idx], 
        ...data, 
        updatedAt: new Date() 
      };
      return mockState.attendance[idx];
    }
    return null;
  },

  // Notices Helpers
  getNotices: async (classroom) => {
    let list = [...mockState.notices];
    if (classroom && classroom !== 'All') {
      list = list.filter(n => n.targetClassroom === 'All' || n.targetClassroom === classroom);
    }
    return list;
  },
  createNotice: async (data, userId) => {
    const notice = {
      _id: nextId('notices', 'notice'),
      createdBy: userId,
      createdAt: new Date(),
      ...data
    };
    mockState.notices.unshift(notice); // Newest first
    return notice;
  },

  // Child Progress Helpers
  getChildProgress: async (parentId) => {
    if (parentId) {
      return mockState.childProgress.find(p => p.parent === parentId);
    }
    return [...mockState.childProgress];
  },
  updateChildProgress: async (data, userId) => {
    const studentName = data.studentName;
    let record = mockState.childProgress.find(p => p.studentName === studentName);
    
    if (record) {
      Object.assign(record, data);
      record.updatedBy = userId;
      record.updatedAt = new Date();
    } else {
      record = {
        _id: nextId('childProgress', 'prog'),
        updatedBy: userId,
        updatedAt: new Date(),
        ...data
      };
      mockState.childProgress.push(record);
    }
    return record;
  },

  // Admin User Helpers
  getUsers: async () => {
    return mockState.users.map(u => {
      const { password, ...safeUser } = u;
      return safeUser;
    });
  },
  updateUser: async (id, data) => {
    const idx = mockState.users.findIndex(u => u._id === id);
    if (idx !== -1) {
      mockState.users[idx] = { ...mockState.users[idx], ...data };
      const { password, ...safeUser } = mockState.users[idx];
      return safeUser;
    }
    return null;
  },
  deleteUser: async (id) => {
    const idx = mockState.users.findIndex(u => u._id === id);
    if (idx !== -1) {
      const deleted = mockState.users[idx];
      mockState.users.splice(idx, 1);
      return deleted;
    }
    return null;
  },

  // Student Helpers
  getStudents: async (classroom) => {
    let list = [...mockState.students];
    if (classroom && classroom !== 'All Classrooms') {
      list = list.filter(s => s.classroom === classroom);
    }
    return list;
  },
  getStudentById: async (id) => {
    return mockState.students.find(s => s._id === id);
  },
  createStudent: async (data) => {
    // 1. Create a parent user in mockState.users if not exists
    let parent = mockState.users.find(u => u.email.toLowerCase() === data.parentEmail.toLowerCase());
    if (!parent) {
      const parentData = {
        _id: `user_${mockState.users.length + 1}_${Date.now().toString().slice(-4)}`,
        name: data.parentName,
        email: data.parentEmail.toLowerCase(),
        password: hashPassword('parent123'),
        role: 'parent',
        childName: data.name,
        classroom: data.classroom,
        phoneNumber: data.contactNumber,
        accountStatus: 'APPROVED',
        createdAt: new Date()
      };
      mockState.users.push(parentData);
      parent = parentData;
    } else {
      // Update parent data
      parent.childName = data.name;
      parent.classroom = data.classroom;
      parent.phoneNumber = data.contactNumber;
      parent.name = data.parentName;
    }

    const student = {
      _id: `stud_${mockState.students.length + 1}_${Date.now().toString().slice(-4)}`,
      observations: [],
      createdAt: new Date(),
      ...data,
      parentId: parent._id
    };
    mockState.students.push(student);
    return student;
  },
  updateStudent: async (id, data) => {
    const idx = mockState.students.findIndex(s => s._id === id);
    if (idx !== -1) {
      const student = mockState.students[idx];
      const updated = { ...student, ...data };
      
      let parent = mockState.users.find(u => u._id === updated.parentId);
      if (parent) {
        parent.name = updated.parentName;
        parent.email = updated.parentEmail.toLowerCase();
        parent.childName = updated.name;
        parent.classroom = updated.classroom;
        parent.phoneNumber = updated.contactNumber;
      }
      
      mockState.students[idx] = updated;
      return updated;
    }
    return null;
  },
  addObservation: async (studentId, obData, teacherId) => {
    const student = mockState.students.find(s => s._id === studentId);
    if (student) {
      const teacher = mockState.users.find(u => u._id === teacherId);
      const obs = {
        _id: `obs_${student.observations.length + 1}_${Date.now().toString().slice(-4)}`,
        date: new Date(),
        teacherName: teacher ? teacher.name : 'Teacher',
        content: obData.content,
        createdBy: teacherId
      };
      student.observations.push(obs);
      return obs;
    }
    return null;
  },
  updateObservation: async (studentId, obsId, content) => {
    const student = mockState.students.find(s => s._id === studentId);
    if (student) {
      const obs = student.observations.find(o => o._id === obsId);
      if (obs) {
        obs.content = content;
        obs.date = new Date();
        return obs;
      }
    }
    return null;
  },

  // Role Request Helpers
  getRoleRequests: async () => {
    return [...mockState.roleRequests];
  },
  updateRoleRequest: async (id, data) => {
    const idx = mockState.roleRequests.findIndex(r => r._id === id);
    if (idx !== -1) {
      const request = mockState.roleRequests[idx];
      const updated = { ...request, ...data };
      mockState.roleRequests[idx] = updated;

      // If status is Approved, update user role
      if (updated.status === 'Approved') {
        const user = mockState.users.find(u => u._id === updated.userId);
        if (user) {
          user.role = updated.requestedRole;
        }
      }
      return updated;
    }
    return null;
  },
  
  // Escalations Helpers
  getEscalations: async () => {
    return [...mockState.escalations];
  },
  getEscalationById: async (id) => {
    return mockState.escalations.find(e => e._id === id || e.caseId === id);
  },
  createEscalation: async (data) => {
    const escalation = {
      _id: nextId('escalations', 'esc'),
      caseId: `ESC-${String(mockState.escalations.length + 1).padStart(3, '0')}`,
      createdAt: new Date(),
      attachments: [],
      resolutionHistory: [],
      status: 'Pending',
      internalNotes: '',
      ...data
    };
    mockState.escalations.push(escalation);
    return escalation;
  },
  updateEscalation: async (id, data) => {
    const idx = mockState.escalations.findIndex(e => e._id === id || e.caseId === id);
    if (idx !== -1) {
      mockState.escalations[idx] = { ...mockState.escalations[idx], ...data };
      return mockState.escalations[idx];
    }
    return null;
  }
};
