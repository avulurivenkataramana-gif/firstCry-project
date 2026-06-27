import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  FileText,
  Calendar,
  Clock,
  Layers,
  Users,
  TrendingUp,
  AlertTriangle,
  Play,
  ArrowRight,
  BookOpen,
  Plus,
  Trash2,
  AlertCircle,
  Megaphone,
  Award,
  CheckCircle2,
  MessageSquare,
  Baby,
  School,
  Check,
  Activity,
  Bell,
  Sparkles,
  UserCheck,
  ListTodo,
  XCircle,
  FileSpreadsheet,
  Wand2,
  HelpCircle,
  X,
  Edit3,
  Send,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
const calMonthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
const now = new Date();
const calMonthIdx = now.getMonth(); // 0 - 11
const calYear = now.getFullYear();
const Dashboard = () => {
  const { user } = useAuth();
  const calMonthIdx = new Date().getMonth();
  const calYear = new Date().getFullYear();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Teacher Quick Action Modal States
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);

  // Attendance Form States
  const [attStudentName, setAttStudentName] = useState('Aarav Patel');
  const [attClassroom, setAttClassroom] = useState('Nursery-A');
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attStatus, setAttStatus] = useState('present');
  const [submittingAttendance, setSubmittingAttendance] = useState(false);

  // Progress Form States
  const [progStudentName, setProgStudentName] = useState('Aarav Patel');
  const [progParentId, setProgParentId] = useState('user_parent_1');
  const [progClassroom, setProgClassroom] = useState('Nursery-A');
  const [progCognitive, setProgCognitive] = useState(85);
  const [progMotor, setProgMotor] = useState(90);
  const [progSensory, setProgSensory] = useState(95);
  const [progSocial, setProgSocial] = useState(80);
  const [progLanguage, setProgLanguage] = useState(88);
  const [progFeedback, setProgFeedback] = useState('Aarav shows great curiosity during water play and float/sink experiments.');
  const [submittingProgress, setSubmittingProgress] = useState(false);

  // Teacher specific states
  const [teacherLessons, setTeacherLessons] = useState([]);
  const [teacherTasks, setTeacherTasks] = useState(() => {
    const saved = localStorage.getItem(`teacher_tasks_${user?._id}`);
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', text: "Draft weekly lesson plans for next week", completed: false },
      { id: '2', text: "Verify classroom activity materials availability", completed: false },
      { id: '3', text: "Submit monthly curriculum drafts for review", completed: false },
      { id: '4', text: "Update parent communication notes and notices", completed: false },
      { id: '5', text: "Review child developmental milestones checklists", completed: false }
    ];
  });
  const [newTask, setNewTask] = useState('');

  const [curriculumActivities, setCurriculumActivities] = useState(() => {
    const saved = localStorage.getItem(`curriculum_activities_${user?._id}`);
    if (saved) return JSON.parse(saved);
    return [
      { id: 'act_c_1', title: 'Curriculum Created', desc: "Drafted syllabus for July Month: 'Community Helpers'", time: 'Today • 10:15 AM', type: 'create' },
      { id: 'act_c_2', title: 'Activity Added', desc: "Inserted 'Flower Sorting' details to lesson plan schedule", time: 'Yesterday • 04:30 PM', type: 'activity' },
      { id: 'act_c_3', title: 'Story Composed', desc: "Created AI Story 'The Happy Daisy' via Curriculum Assistant", time: '2 Days Ago', type: 'story' },
      { id: 'act_c_4', title: 'Plan Submitted', desc: "Submitted Week 2 plans for coordinator validation review", time: '3 Days Ago', type: 'submit' },
      { id: 'act_c_5', title: 'Plan Approved', desc: "Week 1 Curriculum approved by Coordinator Karan Malhotra", time: '4 Days Ago', type: 'approve' }
    ];
  });

  const [viewingActivity, setViewingActivity] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [editActivityText, setEditActivityText] = useState('');

  useEffect(() => {
    if (user?._id) {
      localStorage.setItem(`curriculum_activities_${user._id}`, JSON.stringify(curriculumActivities));
    }
  }, [curriculumActivities, user?._id]);

  // Teacher schedule-specific states & functions
  const [selectedDashboardDate, setSelectedDashboardDate] = useState('2026-06-15');

  const [teacherSchedules, setTeacherSchedules] = useState(() => {
    const saved = localStorage.getItem(`teacher_schedules_${user?._id}`);

    const defaultItems = [
      { id: '1', title: 'Story Time', startTime: '09:00 AM', endTime: '10:00 AM', desc: "Interactive reading of 'The Magic Seed'" },
      { id: '2', title: 'Flower Matching Activity', startTime: '10:00 AM', endTime: '11:00 AM', desc: 'Tactile sensory sorting exploration' },
      { id: '3', title: 'Rhymes Session', startTime: '11:00 AM', endTime: '11:35 AM', desc: 'Sing-along: Pitter Patter Raindrops' },
      { id: '4', title: 'Assessment Activity', startTime: '11:35 AM', endTime: '12:05 PM', desc: 'Observe color matching abilities' },
      { id: '5', title: 'Lunch & Quiet Rest', startTime: '12:05 PM', endTime: '01:05 PM', desc: 'Healthy supervised lunch and quiet transition break' }
    ];

    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed['2026-06-15'] && parsed['2026-06-15'].length !== 5) {
        parsed['2026-06-15'] = defaultItems;
      }
      return parsed;
    }

    return {
      '2026-06-15': defaultItems
    };
  });

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleModalMode, setScheduleModalMode] = useState('add');
  const [editingScheduleItem, setEditingScheduleItem] = useState(null);

  const [formActivityName, setFormActivityName] = useState('');
  const [formStartTime, setFormStartTime] = useState('');
  const [formEndTime, setFormEndTime] = useState('');
  const [formDescription, setFormDescription] = useState('');

  useEffect(() => {
    if (user?._id) {
      localStorage.setItem(`teacher_schedules_${user._id}`, JSON.stringify(teacherSchedules));
    }
  }, [teacherSchedules, user?._id]);

  const handleOpenAddSchedule = () => {
    setScheduleModalMode('add');
    setEditingScheduleItem(null);
    setFormActivityName('');
    setFormStartTime('');
    setFormEndTime('');
    setFormDescription('');
    setIsScheduleModalOpen(true);
  };

  const handleOpenEditSchedule = (item) => {
    setScheduleModalMode('edit');
    setEditingScheduleItem(item);
    setFormActivityName(item.title);
    setFormStartTime(item.startTime);
    setFormEndTime(item.endTime);
    setFormDescription(item.desc);
    setIsScheduleModalOpen(true);
  };

  const handleSaveScheduleItem = (e) => {
    e.preventDefault();
    if (!formActivityName.trim()) return;

    const newItem = {
      id: editingScheduleItem ? editingScheduleItem.id : Date.now().toString(),
      title: formActivityName.trim(),
      startTime: formStartTime.trim() || '09:00 AM',
      endTime: formEndTime.trim() || '10:00 AM',
      desc: formDescription.trim()
    };

    setTeacherSchedules(prev => {
      const dateItems = prev[selectedDashboardDate] || [];
      let updatedItems;

      if (scheduleModalMode === 'edit') {
        updatedItems = dateItems.map(item => item.id === newItem.id ? newItem : item);
      } else {
        updatedItems = [...dateItems, newItem];
      }

      return {
        ...prev,
        [selectedDashboardDate]: updatedItems
      };
    });

    setIsScheduleModalOpen(false);

    // Show success feedback
    setActionMessage({
      type: 'success',
      text: scheduleModalMode === 'edit' ? 'Schedule item updated successfully!' : 'Schedule item added successfully!'
    });
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleDeleteScheduleItem = (itemId) => {
    if (window.confirm('Are you sure you want to delete this schedule item?')) {
      setTeacherSchedules(prev => {
        const dateItems = prev[selectedDashboardDate] || [];
        const updatedItems = dateItems.filter(item => item.id !== itemId);
        return {
          ...prev,
          [selectedDashboardDate]: updatedItems
        };
      });
    }
  };

  // Coordinator/Admin specific states
  const [pendingCurriculums, setPendingCurriculums] = useState([]);
  const [pendingLessons, setPendingLessons] = useState([]);
  const [actionFeedback, setActionFeedback] = useState({});
  const [actionMessage, setActionMessage] = useState(null);
  const [actionHistory, setActionHistory] = useState([]);

  // Parent specific states
  const [parentAttendance, setParentAttendance] = useState([]);
  const [parentNotices, setParentNotices] = useState([]);
  const [parentProgress, setParentProgress] = useState(null);
  const [parentLessons, setParentLessons] = useState([]);
  const [parentEnquiries, setParentEnquiries] = useState([]);
  const [teacherEnquiries, setTeacherEnquiries] = useState([]);
  const [dashboardStudents, setDashboardStudents] = useState([]);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      if (response.success && response.data) {
        setData(response.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherLessons = async () => {
    if (user?.role !== 'teacher') return;
    try {
      const response = await api.get('/lessons');
      if (response.success && response.data) {
        setTeacherLessons(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch teacher lessons:', err.message);
    }
  };

  const fetchTeacherEnquiries = async () => {
    if (user?.role !== 'teacher') return;
    try {
      const response = await api.get('/notifications');
      if (response.success && response.data) {
        // Backend already filters notifications for this teacher's ID.
        // Just filter by type — do NOT compare recipient to user._id
        // because recipient may be an ObjectId object, not a plain string.
        const enquiries = response.data.filter(n =>
          n.type === 'enquiry' || n.type === 'parent_message'
        );
        setTeacherEnquiries(enquiries);
      }
    } catch (err) {
      console.error('Failed to fetch teacher enquiries:', err.message);
    }
  };

  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyContent || !selectedEnquiry) return;
    try {
      const response = await api.post('/notifications', {
        recipient: selectedEnquiry.sender?._id || selectedEnquiry.sender,
        title: `Reply to: ${selectedEnquiry.title}`,
        message: replyContent,
        type: 'parent_message'
      });
      if (response.success) {
        if (!selectedEnquiry.isRead) {
          await api.put(`/notifications/${selectedEnquiry._id}/read`);
        }
        setIsReplyModalOpen(false);
        setReplyContent('');
        setSelectedEnquiry(null);
        fetchTeacherEnquiries();
      }
    } catch (err) {
      console.error('Failed to submit reply:', err.message);
    }
  };

  const handleMarkEnquiryRead = async (id) => {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      if (response.success) {
        fetchTeacherEnquiries();
      }
    } catch (err) {
      console.error('Failed to mark enquiry read:', err.message);
    }
  };

  const handleSaveAttendance = async (e) => {
    e.preventDefault();
    setSubmittingAttendance(true);
    try {
      const response = await api.post('/parent/attendance', {
        studentName: attStudentName,
        classroom: attClassroom,
        date: attDate,
        status: attStatus
      });
      if (response.success) {
        setIsAttendanceModalOpen(false);
        setActionMessage({ type: 'success', text: `Attendance recorded successfully for ${attStudentName}!` });
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingAttendance(false);
    }
  };

  const handleSaveProgress = async (e) => {
    e.preventDefault();
    setSubmittingProgress(true);
    try {
      const response = await api.post('/parent/progress', {
        studentName: progStudentName,
        parentId: progParentId,
        classroom: progClassroom,
        skills: [
          { skillName: 'Cognitive Development', score: Number(progCognitive) },
          { skillName: 'Gross Motor Skills', score: Number(progMotor) },
          { skillName: 'Sensory Play', score: Number(progSensory) },
          { skillName: 'Social-Emotional', score: Number(progSocial) },
          { skillName: 'Language & Communication', score: Number(progLanguage) }
        ],
        teacherFeedback: progFeedback
      });
      if (response.success) {
        setIsProgressModalOpen(false);
        setActionMessage({ type: 'success', text: `Progress updated successfully for ${progStudentName}!` });
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingProgress(false);
    }
  };

  const fetchPendingReviews = async () => {
    if (user?.role !== 'coordinator' && user?.role !== 'admin') return;
    try {
      const [currRes, lessRes] = await Promise.all([
        api.get('/curriculum?status=submitted'),
        api.get('/lessons?status=submitted')
      ]);
      if (currRes.success && currRes.data) {
        setPendingCurriculums(currRes.data);
      }
      if (lessRes.success && lessRes.data) {
        setPendingLessons(lessRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch pending reviews:', err.message);
    }
  };

  const fetchActionHistory = async () => {
    if (user?.role !== 'coordinator' && user?.role !== 'admin') return;
    try {
      const [currApp, currRej, lessApp, lessRej] = await Promise.all([
        api.get('/curriculum?status=approved'),
        api.get('/curriculum?status=rejected'),
        api.get('/lessons?status=approved'),
        api.get('/lessons?status=rejected')
      ]);

      const history = [];
      if (currApp.success && currApp.data) {
        currApp.data.forEach(c => history.push({ ...c, itemType: 'Curriculum', action: 'Approved', actionTime: c.updatedAt || new Date() }));
      }
      if (currRej.success && currRej.data) {
        currRej.data.forEach(c => history.push({ ...c, itemType: 'Curriculum', action: 'Rejected', actionTime: c.updatedAt || new Date() }));
      }
      if (lessApp.success && lessApp.data) {
        lessApp.data.forEach(l => history.push({ ...l, itemType: 'Lesson Plan', action: 'Approved', actionTime: l.updatedAt || new Date() }));
      }
      if (lessRej.success && lessRej.data) {
        lessRej.data.forEach(l => history.push({ ...l, itemType: 'Lesson Plan', action: 'Rejected', actionTime: l.updatedAt || new Date() }));
      }

      history.sort((a, b) => new Date(b.actionTime) - new Date(a.actionTime));
      setActionHistory(history.slice(0, 10));
    } catch (err) {
      console.error('Failed to fetch action history:', err.message);
    }
  };

  const fetchParentDashboardData = async () => {
    if (user?.role !== 'parent') return;
    try {
      const [attRes, noticeRes, progRes, lessonRes, notifRes] = await Promise.all([
        api.get('/parent/attendance'),
        api.get('/parent/notices'),
        api.get('/parent/progress'),
        api.get('/lessons'),
        api.get('/notifications')
      ]);

      if (attRes.success && attRes.data) setParentAttendance(attRes.data);
      if (noticeRes.success && noticeRes.data) setParentNotices(noticeRes.data);
      if (progRes.success && progRes.data && progRes.data.length > 0) {
        setParentProgress(progRes.data[0]);
      }
      if (lessonRes.success && lessonRes.data) {
        const targetClass = user?.classroom || 'Nursery-A';
        const filtered = lessonRes.data.filter(l =>
          l.classroom === targetClass ||
          (l.teacher && l.teacher.classroom === targetClass)
        );
        setParentLessons(filtered);
      }
      if (notifRes.success && notifRes.data) {
        const enquiries = notifRes.data.filter(n => n.type === 'enquiry' && (n.sender === user?._id || n.recipient === user?._id));
        setParentEnquiries(enquiries);
      }
    } catch (err) {
      console.error('Failed to load parent dashboard details:', err.message);
    }
  };

  const fetchDashboardStudents = async () => {
    if (user?.role !== 'teacher') return;
    try {
      const response = await api.get('/parent/students');
      if (response.success && response.data) {
        setDashboardStudents(response.data);
      }
    } catch (err) {
      console.error('Failed to load students for dashboard:', err.message);
    }
  };

  const loadRoleData = () => {
    if (user?.role === 'teacher') {
      fetchTeacherLessons();
      fetchTeacherEnquiries();
      fetchDashboardStudents();
    } else if (user?.role === 'coordinator' || user?.role === 'admin') {
      fetchPendingReviews();
      fetchActionHistory();
    } else if (user?.role === 'parent') {
      fetchParentDashboardData();
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    loadRoleData();
    const interval = setInterval(() => {
      fetchDashboardStats();
      loadRoleData();
    }, 30000);
    return () => clearInterval(interval);
  }, [user?.role]);

  useEffect(() => {
    if (user?._id) {
      localStorage.setItem(`teacher_tasks_${user._id}`, JSON.stringify(teacherTasks));
    }
  }, [teacherTasks, user?._id]);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const taskObj = {
      id: Date.now().toString(),
      text: newTask.trim(),
      completed: false
    };
    setTeacherTasks([...teacherTasks, taskObj]);
    setNewTask('');
  };

  const handleToggleTask = (id) => {
    setTeacherTasks(teacherTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTask = (id) => {
    setTeacherTasks(teacherTasks.filter(t => t.id !== id));
  };

  const handleViewActivityDetails = (activity) => {
    setViewingActivity(activity);
  };

  const handleEditActivity = (activity) => {
    setEditingActivity(activity);
    setEditActivityText(activity.desc);
  };

  const handleSaveActivityEdit = (e) => {
    e.preventDefault();
    if (!editActivityText.trim()) return;
    setCurriculumActivities(prev =>
      prev.map(act => act.id === editingActivity.id ? { ...act, desc: editActivityText.trim() } : act)
    );
    setEditingActivity(null);
    setEditActivityText('');
    setActionMessage({ type: 'success', text: 'Activity log updated successfully!' });
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleDeleteActivity = (id) => {
    if (window.confirm('Are you sure you want to delete this activity log item?')) {
      setCurriculumActivities(prev => prev.filter(act => act.id !== id));
      setActionMessage({ type: 'success', text: 'Activity log item deleted successfully!' });
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleApproveCurriculum = async (id) => {
    try {
      const response = await api.post(`/curriculum/${id}/approve`, { feedback: 'Approved via Priority Panel' });
      if (response.success) {
        setActionMessage({ type: 'success', text: `Curriculum plan approved successfully!` });
        setTimeout(() => setActionMessage(null), 3000);
        fetchPendingReviews();
        fetchActionHistory();
        fetchDashboardStats();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleRejectCurriculum = async (id) => {
    const feedback = actionFeedback[id];
    if (!feedback || !feedback.trim()) {
      alert('Please provide rejection feedback comments.');
      return;
    }
    try {
      const response = await api.post(`/curriculum/${id}/reject`, { feedback });
      if (response.success) {
        setActionMessage({ type: 'success', text: `Curriculum plan rejected with feedback.` });
        setTimeout(() => setActionMessage(null), 3000);
        setActionFeedback({ ...actionFeedback, [id]: '' });
        fetchPendingReviews();
        fetchActionHistory();
        fetchDashboardStats();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleApproveLesson = async (id) => {
    try {
      const response = await api.post(`/lessons/${id}/approve`, { status: 'approved', feedback: 'Approved via Priority Panel' });
      if (response.success) {
        setActionMessage({ type: 'success', text: `Lesson plan approved successfully!` });
        setTimeout(() => setActionMessage(null), 3000);
        fetchPendingReviews();
        fetchActionHistory();
        fetchDashboardStats();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleRejectLesson = async (id) => {
    const feedback = actionFeedback[id];
    if (!feedback || !feedback.trim()) {
      alert('Please provide rejection feedback comments.');
      return;
    }
    try {
      const response = await api.post(`/lessons/${id}/approve`, { status: 'rejected', feedback });
      if (response.success) {
        setActionMessage({ type: 'success', text: `Lesson plan rejected with feedback.` });
        setTimeout(() => setActionMessage(null), 3000);
        setActionFeedback({ ...actionFeedback, [id]: '' });
        fetchPendingReviews();
        fetchActionHistory();
        fetchDashboardStats();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-28 glass-card rounded-2xl animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 glass-card rounded-2xl animate-pulse"></div>
          <div className="h-80 glass-card rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  const renderParentDashboard = () => {
    const totalDays = parentAttendance.length;
    const presentDays = parentAttendance.filter(a => a.status === 'present').length;
    const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 95;

    const milestoneCount = parentProgress?.skills ? parentProgress.skills.filter(s => s.score >= 80).length : 4;
    const resolvedEnquiries = parentEnquiries.filter(e => e.isRead).length;

    const skillsData = parentProgress?.skills
      ? parentProgress.skills.map(s => ({ name: s.skillName.split(' ')[0], value: s.score }))
      : [
        { name: 'Cognitive', value: 85 },
        { name: 'Motor Skills', value: 90 },
        { name: 'Sensory', value: 95 },
        { name: 'Social-Emo', value: 80 },
        { name: 'Language', value: 88 }
      ];

    const COLORS = ['#8d44ff', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    return (
      <div className="space-y-6 pb-12 text-left animate-fade-in font-sans">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white font-sans tracking-tight">
              Hello, {user?.name} 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-sans mt-0.5">
              Keeping track of your child {user?.childName || 'Aarav'}'s early learning journey and reports.
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-brand-500/10 text-brand-600 dark:bg-brand-500/5 dark:text-brand-400 px-4 py-2 rounded-xl border border-brand-500/15 text-xs font-semibold font-sans capitalize">
            Role Access: {user?.role}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-emerald-500">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-405 dark:text-slate-505">
                Attendance Rate
              </span>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">
                {attendanceRate}%
              </h3>
              <span className="text-[10px] text-slate-400 block font-medium">Aarav's weekly attendance</span>
            </div>
            <div className="bg-emerald-500/10 text-emerald-500 p-3 rounded-xl dark:bg-emerald-500/5">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-purple-500">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-405 dark:text-slate-505">
                Milestones Met
              </span>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">
                {milestoneCount} / 5
              </h3>
              <span className="text-[10px] text-slate-400 block font-medium">Skills scored &ge; 80%</span>
            </div>
            <div className="bg-purple-500/10 text-purple-500 p-3 rounded-xl dark:bg-purple-500/5">
              <Award className="h-6 w-6" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-amber-500">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-405 dark:text-slate-505">
                Class Notices
              </span>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">
                {parentNotices.length} Bulletins
              </h3>
              <span className="text-[10px] text-slate-400 block font-medium">Active announcements</span>
            </div>
            <div className="bg-amber-500/10 text-amber-500 p-3 rounded-xl dark:bg-amber-500/5">
              <Megaphone className="h-6 w-6" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-sky-500">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-405 dark:text-slate-505">
                My Enquiries
              </span>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">
                {resolvedEnquiries} Resolved
              </h3>
              <span className="text-[10px] text-slate-400 block font-medium">Out of {parentEnquiries.length} enquiries</span>
            </div>
            <div className="bg-sky-500/10 text-sky-500 p-3 rounded-xl dark:bg-sky-500/5">
              <MessageSquare className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl lg:col-span-2 flex flex-col border border-slate-205/50 dark:border-slate-800/15">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4 tracking-tight">
              Aarav's Weekly Lesson Schedule
            </h3>

            <div className="space-y-4 overflow-y-auto max-h-[350px] flex-1">
              {parentLessons.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs italic">
                  No weekly lessons scheduled by the teacher yet.
                </div>
              ) : (
                parentLessons.map(lesson => (
                  <div key={lesson._id} className="p-4 bg-slate-50 dark:bg-slate-900/25 border border-slate-100 dark:border-slate-800/40 rounded-xl space-y-2.5 text-left">
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 text-[9px] bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded font-black">
                        {lesson.subjectArea}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(lesson.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-white">{lesson.topic}</h4>
                      <p className="text-[11px] text-slate-550 dark:text-slate-400 mt-0.5 leading-snug">
                        <span className="font-bold text-slate-600 dark:text-slate-300">Goal:</span> {lesson.learningGoal}
                      </p>
                    </div>
                    {lesson.storyTime && (
                      <span className="inline-block text-[10px] text-purple-650 bg-purple-500/5 px-2 py-0.5 rounded mr-1">
                        📖 Story: {lesson.storyTime}
                      </span>
                    )}
                    {lesson.rhymes && (
                      <span className="inline-block text-[10px] text-amber-655 bg-amber-500/5 px-2 py-0.5 rounded">
                        🎵 Rhyme: {lesson.rhymes}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl flex flex-col border border-slate-205/50 dark:border-slate-800/15">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4 tracking-tight">
              Milestone Domain Breakdown
            </h3>

            <div className="flex-1 min-h-[200px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={skillsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {skillsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
              {skillsData.map((d, i) => (
                <div key={i} className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                  <span className="truncate">{d.name}: {d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-205/50 dark:border-slate-800/15 text-left">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4 tracking-tight">
            Latest Bulletin Board Notices
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parentNotices.length === 0 ? (
              <div className="p-8 text-center text-slate-405 text-xs italic md:col-span-2">
                No active announcements posted for this classroom branch.
              </div>
            ) : (
              parentNotices.slice(0, 2).map(notice => (
                <div key={notice._id} className="p-4 bg-slate-50 dark:bg-slate-900/25 border border-slate-100 dark:border-slate-800/40 rounded-xl space-y-2">
                  <h4 className="font-bold text-xs text-slate-805 dark:text-white">{notice.title}</h4>
                  <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-relaxed font-medium">
                    {notice.content}
                  </p>
                  <span className="text-[9px] text-slate-400 block font-mono">
                    Posted on: {new Date(notice.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTeacherDashboard = () => {
    const classroomName = user?.classroom || 'Nursery-A';
    const ageGroup = classroomName.includes('Kindergarten') ? '4-5 Years' : '3-4 Years';
    const totalStudents = classroomName.includes('Kindergarten') ? 22 : 28;
    const currentTheme = classroomName.includes('Kindergarten') ? 'Under the Sea' : 'Flowers';

    // Checklist progress calculation
    const completedTasks = teacherTasks.filter(t => t.completed);
    const pendingTasks = teacherTasks.filter(t => !t.completed);
    const checklistProgress = teacherTasks.length > 0 ? Math.round((completedTasks.length / teacherTasks.length) * 100) : 0;

    // Child Progress Summary Data — driven by real student count
    const totalStudentCount = dashboardStudents.length || 0;
    const excellentCount = totalStudentCount > 0 ? Math.round(totalStudentCount * 0.43) : 0;
    const goodCount = totalStudentCount > 0 ? Math.round(totalStudentCount * 0.50) : 0;
    const needsSupportCount = totalStudentCount > 0 ? Math.max(0, totalStudentCount - excellentCount - goodCount) : 0;
    const childProgressData = [
      { name: 'Excellent', value: excellentCount || 1 },
      { name: 'Good', value: goodCount || 1 },
      { name: 'Needs Support', value: needsSupportCount || 1 }
    ];
    const COLORS = ['#22C55E', '#3B82F6', '#F59E0B'];

    // (Mini Academic Calendar calculation logic removed)

    // Local handler for quick action notifications
    const handleQuickAction = (actionName, targetPath) => {
      if (actionName === 'Record Attendance') {
        setIsAttendanceModalOpen(true);
      } else if (actionName === 'Update Progress') {
        setIsProgressModalOpen(true);
      } else {
        setActionMessage({ type: 'success', text: `Redirecting to build: ${actionName}...` });
        setTimeout(() => {
          setActionMessage(null);
          window.location.href = targetPath;
        }, 1000);
      }
    };

    return (
      <>
        <div className="space-y-6 pb-12 text-left animate-fade-in font-sans">

          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/20 shadow-xs">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                Hello, {user?.name || 'Teacher'} 👋
              </h1>
              <p className="text-slate-505 dark:text-slate-400 text-sm mt-1 font-medium">
                Manage your classroom, track student developmental progress, and organize your weekly syllabus.
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-brand-500/10 text-brand-600 dark:bg-brand-500/5 dark:text-brand-400 px-4 py-2 rounded-xl border border-brand-500/15 text-xs font-semibold uppercase tracking-wider">
              Teacher Portal
            </div>
          </div>

          {/* Global Action Message Banner */}
          {actionMessage && (
            <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center space-x-2 border border-emerald-500/15 text-emerald-600 bg-emerald-500/10 dark:bg-emerald-955/20 dark:text-emerald-400 animate-fade-in`}>
              <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
              <span>{actionMessage.text}</span>
            </div>
          )}

          {/* TOP ROW: Classroom, Theme & Schedule Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left Column */}
            <div className="flex flex-col space-y-6">
              {/* Widget 1: My Classroom Card */}
              <div className="glass-card p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/20 shadow-xs bg-white dark:bg-slate-900 flex flex-col justify-between relative overflow-hidden group h-fit">
                <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-purple-500/5 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-purple-650 dark:text-purple-400 uppercase tracking-widest">
                      Class Profile
                    </span>
                    <div className="p-2.5 bg-purple-500/10 text-purple-600 rounded-2xl dark:bg-purple-500/5">
                      <School className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-2">
                    {classroomName}
                  </h3>

                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 mt-6 text-xs border-t border-slate-100 dark:border-slate-800/40 pt-4">
                    <div>
                      <span className="text-slate-400 dark:text-slate-550 block">Age Group</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200 mt-0.5 block">{ageGroup}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-550 block">Total Students</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200 mt-0.5 block">{totalStudents} Active</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-405 dark:text-slate-550 block">Active Theme</span>
                      <span className="font-bold text-brand-600 dark:text-brand-400 mt-0.5 block flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 animate-pulse-subtle" /> {currentTheme}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Widget 2: Current Theme Card */}
              <div className="glass-card p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/20 shadow-xs bg-white dark:bg-slate-900 flex flex-col justify-between relative overflow-hidden group h-fit">
                <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-brand-500/5 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-brand-650 dark:text-brand-400 uppercase tracking-widest">
                      Theme Coverage
                    </span>
                    <div className="p-2.5 bg-brand-500/10 text-brand-500 rounded-2xl dark:bg-brand-500/5">
                      <Layers className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-slate-850 dark:text-white mt-2">
                    Theme: {currentTheme}
                  </h3>

                  <div className="mt-6 border-t border-slate-100 dark:border-slate-800/40 pt-4 space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="text-slate-400 dark:text-slate-550 block">Current Syllabus Timeline</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200 mt-0.5 block">Week 2 of 4</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-405 dark:text-slate-550 block">Completion Rate</span>
                        <span className="font-extrabold text-brand-600 dark:text-brand-400 mt-0.5 block">50%</span>
                      </div>
                    </div>
                    <div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-brand-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `50%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col h-full">
              {/* Widget 3: Today's Schedule Section */}
              <div className="glass-card p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/20 shadow-xs bg-white dark:bg-slate-900 flex flex-col justify-between h-full flex-1">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-white tracking-tight flex items-center gap-1.5">
                    <Clock className="h-4.5 w-4.5 text-brand-500" /> Teaching Schedule ({new Date(selectedDashboardDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })})
                  </h3>
                  <button
                    type="button"
                    onClick={handleOpenAddSchedule}
                    className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-1.5 px-3 rounded-xl text-xs flex items-center shadow-md shadow-brand-500/10 transition-all font-sans"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Schedule
                  </button>
                </div>

                <div className="space-y-3.5 flex-1">
                  {(teacherSchedules[selectedDashboardDate] || []).length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs italic font-sans">
                      No activities scheduled for this date. Click "+ Add Schedule" to schedule this day.
                    </div>
                  ) : (
                    (teacherSchedules[selectedDashboardDate] || []).map((sch) => (
                      <div key={sch.id} className="p-3.5 bg-slate-50 dark:bg-slate-900/20 border border-slate-100/50 dark:border-slate-800/50 rounded-2xl flex items-start justify-between space-x-4 hover:bg-slate-100/30 dark:hover:bg-slate-800/20 transition-colors text-left">
                        <div className="flex items-start space-x-4 min-w-0 flex-1">
                          <div className="p-2.5 rounded-xl flex-shrink-0 bg-brand-500/10 text-brand-500 dark:bg-brand-500/5">
                            <Activity className="h-4.5 w-4.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 flex-wrap">
                              <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{sch.title}</h4>
                              <span className="text-[10px] text-slate-450 dark:text-slate-500 font-mono font-semibold">({sch.startTime} - {sch.endTime})</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1 leading-normal break-words">{sch.desc}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEditSchedule(sch)}
                            className="p-1 text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-sans"
                            title="Edit Schedule Item"
                          >
                            <span className="text-xs">✏️</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteScheduleItem(sch.id)}
                            className="p-1 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Delete Schedule Item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* ROW 2: Curriculum Checklist & Activity Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Widget 5: Improved Curriculum Checklist */}
            <div className="glass-card p-6 rounded-3xl border border-slate-205/50 dark:border-slate-800/20 shadow-xs bg-white dark:bg-slate-900 flex flex-col h-full">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white tracking-tight flex items-center gap-1.5">
                  <ListTodo className="h-4.5 w-4.5 text-brand-500" /> Curriculum Checklist
                </h3>
                <span className="text-[10px] bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 px-2.5 py-0.5 rounded-lg font-black font-mono">
                  {checklistProgress}% Done
                </span>
              </div>

              {/* Checklist Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
                <div
                  className="bg-brand-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${checklistProgress}%` }}
                ></div>
              </div>

              <form onSubmit={handleAddTask} className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Add new preparation task..."
                  className="flex-1 px-3.5 py-2.5 text-xs rounded-xl glass-input font-sans text-slate-850 dark:text-white"
                />
                <button
                  type="submit"
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold p-2.5 rounded-xl text-xs flex items-center justify-center transition-all shadow-md shadow-brand-500/10 hover:shadow-brand-500/20"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </form>

              <div className="space-y-4 flex-1 max-h-[300px] overflow-y-auto pr-1">
                {/* Pending Tasks */}
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Pending Tasks ({pendingTasks.length})
                  </h4>
                  {pendingTasks.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic py-2 pl-2">No pending tasks! All complete.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {pendingTasks.map(t => (
                        <div key={t.id} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/30 rounded-xl hover:bg-slate-105/20 transition-colors">
                          <label className="flex items-center space-x-2.5 cursor-pointer flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={t.completed}
                              onChange={() => handleToggleTask(t.id)}
                              className="rounded border-slate-305 text-brand-500 focus:ring-brand-505 h-3.5 w-3.5"
                            />
                            <span className="text-xs font-semibold truncate text-slate-700 dark:text-slate-300">
                              {t.text}
                            </span>
                          </label>
                          <button
                            onClick={() => handleDeleteTask(t.id)}
                            className="text-slate-400 hover:text-red-500 p-1 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Completed Tasks */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/40">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Completed Tasks ({completedTasks.length})
                  </h4>
                  {completedTasks.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic py-2 pl-2">No completed tasks yet.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {completedTasks.map(t => (
                        <div key={t.id} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/30 rounded-xl hover:bg-slate-105/20 transition-colors opacity-70">
                          <label className="flex items-center space-x-2.5 cursor-pointer flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={t.completed}
                              onChange={() => handleToggleTask(t.id)}
                              className="rounded border-slate-305 text-brand-500 focus:ring-brand-505 h-3.5 w-3.5"
                            />
                            <span className="text-xs font-semibold truncate line-through text-slate-400 dark:text-slate-500">
                              {t.text}
                            </span>
                          </label>
                          <button
                            onClick={() => handleDeleteTask(t.id)}
                            className="text-slate-400 hover:text-red-500 p-1 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Widget 6: Recent Curriculum Activity Timeline */}
            <div className="glass-card p-6 rounded-3xl border border-slate-205/50 dark:border-slate-800/20 shadow-xs bg-white dark:bg-slate-900 flex flex-col justify-between h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white tracking-tight flex items-center gap-1.5">
                  <TrendingUp className="h-4.5 w-4.5 text-brand-500" /> Recent Curriculum Activity
                </h3>
                <span className="text-[10px] bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 px-2.5 py-0.5 rounded-lg font-black font-sans">
                  Activity Log
                </span>
              </div>

              {/* Activity Statistics Header */}
              <div className="grid grid-cols-4 gap-2 mb-6 border-b border-slate-105 dark:border-slate-800/40 pb-4">
                <div className="text-center p-2.5 bg-slate-50 dark:bg-slate-905/30 border border-slate-105/40 dark:border-slate-800/20 rounded-2xl">
                  <span className="text-[8px] uppercase font-extrabold text-slate-400 block leading-none">Total</span>
                  <span className="text-base font-black text-slate-850 dark:text-white block mt-1.5">{curriculumActivities.length}</span>
                </div>
                <div className="text-center p-2.5 bg-slate-50 dark:bg-slate-905/30 border border-slate-105/40 dark:border-slate-800/20 rounded-2xl">
                  <span className="text-[8px] uppercase font-extrabold text-slate-400 block leading-none">Today</span>
                  <span className="text-base font-black text-slate-850 dark:text-white block mt-1.5">
                    {curriculumActivities.filter(a => a.time.includes('Today')).length}
                  </span>
                </div>
                <div className="text-center p-2.5 bg-slate-50 dark:bg-slate-905/30 border border-slate-105/40 dark:border-slate-800/20 rounded-2xl">
                  <span className="text-[8px] uppercase font-extrabold text-slate-400 block leading-none">Pending</span>
                  <span className="text-base font-black text-amber-550 block mt-1.5">1</span>
                </div>
                <div className="text-center p-2.5 bg-slate-50 dark:bg-slate-905/30 border border-slate-105/40 dark:border-slate-800/20 rounded-2xl">
                  <span className="text-[8px] uppercase font-extrabold text-slate-400 block leading-none">Approved</span>
                  <span className="text-base font-black text-emerald-500 block mt-1.5">
                    {curriculumActivities.filter(a => a.type === 'approve').length}
                  </span>
                </div>
              </div>

              {/* Timeline Container */}
              <div className="relative flex-1 pr-1 overflow-y-auto max-h-[350px] space-y-6 scrollbar-thin">
                {/* Vertical line running down the center-left */}
                <div className="absolute left-[21px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-purple-400 via-orange-400 to-emerald-400 dark:from-purple-900/60 dark:via-orange-900/60 dark:to-emerald-900/60 z-0"></div>

                {curriculumActivities.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs italic font-sans pl-12">
                    No curriculum activities logged.
                  </div>
                ) : (
                  curriculumActivities.map((act) => {
                    let iconBg = '';
                    let iconColor = '';
                    let cardBgTint = '';
                    let badgeBgTint = '';
                    let IconComponent = Plus;

                    switch (act.type) {
                      case 'create':
                        iconBg = 'bg-gradient-to-tr from-purple-500 to-indigo-500 text-white';
                        iconColor = 'text-purple-600 dark:text-purple-400';
                        cardBgTint = 'bg-purple-500/[0.03] dark:bg-purple-500/[0.08] hover:bg-purple-500/[0.06] dark:hover:bg-purple-500/[0.12] border-purple-500/15';
                        badgeBgTint = 'bg-purple-500/10 text-purple-750 dark:bg-purple-500/20 dark:text-purple-300';
                        IconComponent = FileText;
                        break;
                      case 'activity':
                        iconBg = 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white';
                        iconColor = 'text-orange-600 dark:text-orange-400';
                        cardBgTint = 'bg-orange-500/[0.03] dark:bg-orange-500/[0.08] hover:bg-orange-500/[0.06] dark:hover:bg-orange-500/[0.12] border-orange-500/15';
                        badgeBgTint = 'bg-orange-500/10 text-orange-750 dark:bg-orange-500/20 dark:text-orange-300';
                        IconComponent = Activity;
                        break;
                      case 'story':
                        iconBg = 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-white';
                        iconColor = 'text-amber-600 dark:text-amber-400';
                        cardBgTint = 'bg-amber-500/[0.03] dark:bg-amber-500/[0.08] hover:bg-amber-500/[0.06] dark:hover:bg-amber-500/[0.12] border-amber-500/15';
                        badgeBgTint = 'bg-amber-500/10 text-amber-750 dark:bg-amber-500/20 dark:text-amber-300';
                        IconComponent = Wand2;
                        break;
                      case 'submit':
                        iconBg = 'bg-gradient-to-tr from-blue-500 to-sky-500 text-white';
                        iconColor = 'text-blue-600 dark:text-blue-400';
                        cardBgTint = 'bg-blue-550/[0.03] dark:bg-blue-500/[0.08] hover:bg-blue-500/[0.06] dark:hover:bg-blue-500/[0.12] border-blue-500/15';
                        badgeBgTint = 'bg-blue-500/10 text-blue-750 dark:bg-blue-500/20 dark:text-blue-300';
                        IconComponent = Send;
                        break;
                      case 'approve':
                        iconBg = 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-white';
                        iconColor = 'text-emerald-600 dark:text-emerald-400';
                        cardBgTint = 'bg-emerald-500/[0.03] dark:bg-emerald-500/[0.08] hover:bg-emerald-500/[0.06] dark:hover:bg-emerald-500/[0.12] border-emerald-500/15';
                        badgeBgTint = 'bg-emerald-500/10 text-emerald-750 dark:bg-emerald-500/20 dark:text-emerald-300';
                        IconComponent = Check;
                        break;
                      default:
                        iconBg = 'bg-slate-500 text-white';
                        iconColor = 'text-slate-600 dark:text-slate-400';
                        cardBgTint = 'bg-slate-50 dark:bg-slate-900 border-slate-200';
                        badgeBgTint = 'bg-slate-100 text-slate-600';
                        IconComponent = Plus;
                    }

                    return (
                      <div key={act.id} className="relative flex items-start space-x-4 pl-0.5 animate-fade-in group">
                        
                        {/* Timeline Icon */}
                        <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full shadow-md ${iconBg} transition-all duration-300 group-hover:scale-110 flex-shrink-0`}>
                          <IconComponent className="h-4.5 w-4.5" />
                        </div>

                        {/* Activity Card */}
                        <div className={`flex-1 ${cardBgTint} p-4 rounded-2xl border shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5`}>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5 text-left">
                            <h4 className="font-extrabold text-sm text-slate-850 dark:text-white leading-tight">
                              {act.title}
                            </h4>
                            {/* Timestamp Badge */}
                            <span className={`self-start sm:self-auto inline-block text-[9px] font-bold ${badgeBgTint} px-2.5 py-0.5 rounded-full font-sans tracking-wide`}>
                              {act.time}
                            </span>
                          </div>

                          <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-sans text-left font-medium">
                            {act.desc}
                          </p>

                          {/* Quick Actions Footer */}
                          <div className="flex items-center justify-end space-x-4 mt-3 pt-2.5 border-t border-slate-205/50 dark:border-slate-800/35">
                            <button
                              type="button"
                              onClick={() => handleViewActivityDetails(act)}
                              className={`text-[10px] font-bold ${iconColor} hover:underline transition-colors font-sans`}
                            >
                              View Details
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditActivity(act)}
                              className="text-[10px] font-bold text-slate-500 hover:text-slate-850 dark:hover:text-slate-200 transition-colors font-sans"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteActivity(act.id)}
                              className="text-[10px] font-bold text-slate-405 hover:text-red-500 transition-colors font-sans"
                            >
                              Delete
                            </button>
                          </div>

                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* Widget 4: Active Learning Outcomes - Full Width Grid Layout */}
          <div className="glass-card p-6 rounded-3xl border border-slate-205/50 dark:border-slate-800/20 shadow-xs bg-white dark:bg-slate-900 flex flex-col">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white mb-4 tracking-tight flex items-center gap-1.5">
              <UserCheck className="h-4.5 w-4.5 text-brand-500" /> Active Learning Outcomes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: `Identify ${currentTheme === 'Flowers' ? 'Flowers' : 'Sea Creatures'}`, desc: 'Recognize at least 5 different varieties' },
                { title: `Recognize ${currentTheme === 'Flowers' ? 'Colors' : 'Water States'}`, desc: 'Match objects correctly' },
                { title: 'Improve Vocabulary', desc: 'Learn 8 new context words' },
                { title: 'Improve Fine Motor Skills', desc: 'Correct scissor-cut/tracing grip' },
                { title: 'Cognitive Development', desc: currentTheme === 'Flowers' ? 'Arrange plant growth stages in correct chronological order' : 'Sort marine life by depth zones' },
                { title: 'Sensory Exploration', desc: currentTheme === 'Flowers' ? 'Describe textures and scents of botanical specimens' : 'Explore tactile sand and water elements' },
                { title: 'Social-Emotional Learning', desc: 'Cooperate during shared classroom theme-building activities' }
              ].map((outcome, idx) => (
                <div key={idx} className="p-3.5 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-2xl flex items-start space-x-2.5 hover:bg-emerald-500/[0.04] transition-all duration-200 text-left">
                  <div className="p-1 bg-emerald-500/15 text-emerald-600 rounded-lg mt-0.5 font-sans flex-shrink-0">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-left min-w-0">
                    <h4 className="text-xs font-bold text-slate-850 dark:text-white truncate font-sans">{outcome.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal font-sans">{outcome.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 7: Improved Lesson Delivery Status */}
          <div className="glass-card p-6 rounded-3xl border border-slate-205/50 dark:border-slate-800/20 shadow-xs bg-white dark:bg-slate-900 flex flex-col justify-between">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white mb-4 tracking-tight flex items-center gap-1.5">
              <Calendar className="h-4.5 w-4.5 text-brand-500" /> Lesson Delivery Status
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { label: 'Draft Plans', count: teacherLessons.filter(l => l.status === 'draft').length, color: 'border-l-slate-400 bg-slate-50 text-slate-500 dark:bg-slate-800/30', desc: 'Saved locally' },
                { label: 'Submitted Plans', count: teacherLessons.filter(l => l.status === 'submitted').length, color: 'border-l-blue-500 bg-blue-500/5 text-blue-600 dark:bg-blue-955/10', desc: 'Awaiting review' },
                { label: 'Approved Plans', count: teacherLessons.filter(l => l.status === 'approved').length, color: 'border-l-emerald-500 bg-emerald-500/5 text-emerald-600 dark:bg-emerald-955/10', desc: 'Ready for classroom' },
                { label: 'Needs Revision', count: teacherLessons.filter(l => l.status === 'rejected').length, color: 'border-l-red-500 bg-red-500/5 text-red-600 dark:bg-red-955/10', desc: 'Feedback logged' },
                { label: 'Completed Plans', count: teacherLessons.filter(l => l.status === 'approved').length + 3, color: 'border-l-purple-500 bg-purple-500/5 text-purple-600 dark:bg-purple-955/10', desc: 'Delivered in class' }
              ].map((s, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border-l-4 ${s.color} flex flex-col justify-between text-left transition-all hover:-translate-y-0.5 duration-200 border border-slate-100 dark:border-slate-800/50 shadow-2xs`}>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">{s.label}</span>
                    <span className="text-2xl font-black block mt-1.5">{s.count}</span>
                  </div>
                  <span className="text-[9px] opacity-75 font-sans font-semibold mt-2.5 block leading-tight">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ROW 4: Quick Actions & Notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Widget 8: Quick Actions Panel */}
            <div className="glass-card p-6 rounded-3xl border border-slate-205/50 dark:border-slate-800/20 shadow-xs bg-white dark:bg-slate-900 flex flex-col justify-between">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white mb-4 tracking-tight flex items-center gap-1.5">
                <Plus className="h-4.5 w-4.5 text-brand-500" /> Quick Assistant Actions
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1 justify-center items-center">
                {[
                  { label: 'Create Curriculum', path: '/curriculum', bg: 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm' },
                  { label: 'Add Weekly Lesson', path: '/weekly-planner', bg: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-955/30 dark:text-indigo-400' },
                  { label: 'Add Activity', path: '/activities', bg: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-955/30 dark:text-emerald-400' },
                  { label: 'Add Story', path: '/ai-assistant', bg: 'bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-955/30 dark:text-purple-400' },
                  { label: 'Add Rhyme', path: '/ai-assistant', bg: 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-955/30 dark:text-amber-400' },
                  { label: 'Add Worksheet', path: '/ai-assistant', bg: 'bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-955/30 dark:text-sky-400' },
                  { label: 'Record Attendance', path: '#', bg: 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-955/30 dark:text-blue-400' },
                  { label: 'Update Progress', path: '#', bg: 'bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-955/30 dark:text-teal-400' },
                  { label: 'Request Materials', path: '/materials', bg: 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-955/30 dark:text-rose-400' }
                ].map((act, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAction(act.label, act.path)}
                    className={`px-3 py-2.5 rounded-2xl text-[11px] font-bold text-center transition-all ${act.bg}`}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Widget 9: Notifications Widget */}
            <div className="glass-card p-6 rounded-3xl border border-slate-205/50 dark:border-slate-800/20 shadow-xs bg-white dark:bg-slate-900 flex flex-col justify-between">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white mb-4 tracking-tight flex items-center gap-1.5">
                <Bell className="h-4.5 w-4.5 text-brand-500 animate-pulse-subtle" /> Updates & Feedback Notifications
              </h3>

              <div className="space-y-3 flex-1 max-h-[250px] overflow-y-auto pr-1">
                {[
                  { title: 'Theme Approved', desc: `Theme 'Flowers' approved by Coordinator Karan Malhotra.`, time: '2 hours ago', type: 'approve' },
                  { title: 'Revision Requested', desc: `Coordinator requested: Add more physical motor details to Week 3's schedule.`, time: '1 day ago', type: 'revision' },
                  { title: 'Material Approved', desc: `Request for 'Safety Scissors and Colored Paper' approved by Admin.`, time: '2 days ago', type: 'material' },
                  { title: 'Upcoming: Outdoor Play', desc: `Weather forecast looks clear for Friday's outdoor garden sorting walk.`, time: '3 days ago', type: 'activity' }
                ].map((notif, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/35 rounded-2xl flex items-start space-x-3 text-left">
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.type === 'approve' ? 'bg-emerald-500' :
                      notif.type === 'revision' ? 'bg-red-505' :
                        notif.type === 'material' ? 'bg-purple-500' : 'bg-amber-500'
                      }`}></span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-extrabold text-slate-800 dark:text-white">{notif.title}</span>
                        <span className="text-slate-400 font-mono font-medium">{notif.time}</span>
                      </div>
                      <p className="text-[10px] text-slate-505 mt-0.5 leading-snug">{notif.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ROW 5: Child Progress Chart & Parent Communication */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Widget 10: Child Progress Summary with Recharts Pie */}
            <div className="glass-card p-6 rounded-3xl border border-slate-205/50 dark:border-slate-800/20 shadow-xs bg-white dark:bg-slate-900 lg:col-span-2 flex flex-col justify-between">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white mb-2 tracking-tight flex items-center gap-1.5">
                <Users className="h-4.5 w-4.5 text-brand-500" /> Child Development Progress
              </h3>

              <div className="flex flex-col sm:flex-row items-center justify-around flex-1 py-2">

                {/* Left Legend Indicators */}
                <div className="space-y-3 w-full sm:w-1/2 text-left">
                  {[
                    { label: 'Excellent', count: excellentCount, desc: 'Met all milestones ahead of schedule' },
                    { label: 'Good', count: goodCount, desc: 'Consistently meeting daily objectives' },
                    { label: 'Needs Support', count: needsSupportCount, desc: 'Requires extra motor coordination guidance' }
                  ].map((pg, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/40 rounded-2xl flex items-start space-x-3 hover:bg-slate-100/40 transition-colors">
                      <div className="px-2 py-0.5 rounded-lg text-xs font-black text-white h-fit mt-0.5 flex-shrink-0" style={{ backgroundColor: COLORS[idx] }}>
                        {pg.count}
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-white block">{pg.label}</span>
                        <p className="text-[10px] text-slate-400 leading-snug mt-0.5 font-medium">{pg.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Recharts Donut Pie */}
                <div className="relative w-44 h-44 flex items-center justify-center mt-4 sm:mt-0 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={childProgressData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {childProgressData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Center text bubble */}
                  <div className="absolute text-center">
                    <span className="text-xl font-black text-slate-800 dark:text-white">{totalStudentCount}</span>
                    <span className="text-[9px] text-slate-405 block font-bold uppercase tracking-wider">Students</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Widget 11: Parent Communication Summary */}
            <div className="glass-card p-6 rounded-3xl border border-slate-205/50 dark:border-slate-800/20 shadow-xs bg-white dark:bg-slate-900 flex flex-col h-[400px]">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white mb-4 tracking-tight flex items-center gap-1.5 flex-shrink-0">
                <MessageSquare className="h-4.5 w-4.5 text-brand-500" /> Parent Communication Desk
              </h3>

              {teacherEnquiries.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-6 text-center text-slate-400 dark:text-slate-505 font-sans text-xs italic">
                  <MessageSquare className="h-8 w-8 text-slate-300 dark:text-slate-700 mb-2" />
                  No parent messages received.
                </div>
              ) : (
                <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
                  {teacherEnquiries.map((item) => (
                    <div key={item._id} className={`p-3.5 rounded-2xl border text-left flex flex-col space-y-1.5 transition-all duration-150 ${
                      item.isRead 
                        ? 'bg-slate-50/50 dark:bg-slate-900/10 border-slate-100 dark:border-slate-850 opacity-70' 
                        : 'bg-amber-500/[0.03] border-amber-500/15 border-l-4 border-l-amber-500'
                    }`}>
                      <div className="flex justify-between items-start gap-1">
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-white block">
                            {item.sender?.name || 'Parent'}{item.sender?.childName ? ` (Parent of ${item.sender.childName})` : ''}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex space-x-1.5">
                          {!item.isRead && (
                            <button
                              onClick={() => handleMarkEnquiryRead(item._id)}
                              className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-450 hover:bg-emerald-500/25 rounded-lg transition-colors"
                            >
                              Mark Read
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedEnquiry(item);
                              setIsReplyModalOpen(true);
                            }}
                            className="px-2 py-0.5 text-[10px] font-bold bg-brand-500/15 text-brand-600 dark:text-brand-400 hover:bg-brand-500/25 rounded-lg transition-colors"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                          {item.title}
                        </h4>
                        <p className="text-[10.5px] text-slate-550 dark:text-slate-400 leading-snug mt-1 font-medium">
                          {item.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Parent Enquiry Reply Modal */}
        {isReplyModalOpen && selectedEnquiry && createPortal(
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] overflow-y-auto">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-150 dark:border-slate-800 p-6 flex flex-col space-y-4 animate-scale-up text-left">
              <div className="flex justify-between items-center pb-2 border-b border-slate-105 dark:border-slate-800/40">
                <h3 className="font-extrabold text-sm text-slate-850 dark:text-white font-sans">
                  Reply to Parent Message
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsReplyModalOpen(false);
                    setSelectedEnquiry(null);
                    setReplyContent('');
                  }}
                  className="text-slate-400 hover:text-slate-655 dark:hover:text-white font-bold"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-1.5 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
                <span className="text-[9px] uppercase font-bold text-slate-400">Message from {selectedEnquiry.sender?.name || 'Parent'}</span>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{selectedEnquiry.title}</h4>
                <p className="text-xs text-slate-655 dark:text-slate-400 leading-relaxed font-medium">{selectedEnquiry.message}</p>
              </div>

              <form onSubmit={handleSendReply} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-sans">
                    Your Response
                  </label>
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Enter your reply message here..."
                    rows={4}
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 font-sans text-slate-800 dark:text-white focus:outline-none"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsReplyModalOpen(false);
                      setSelectedEnquiry(null);
                      setReplyContent('');
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-655 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-brand-500/10"
                  >
                    Send Reply
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* Schedule Management Modal */}
        {isScheduleModalOpen && createPortal(
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] overflow-y-auto">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-150 dark:border-slate-800 p-6 flex flex-col space-y-4 animate-scale-up text-left">
              <div className="flex justify-between items-center pb-2 border-b border-slate-105 dark:border-slate-800/40">
                <h3 className="font-extrabold text-sm text-slate-850 dark:text-white font-sans">
                  {scheduleModalMode === 'edit' ? 'Edit Schedule Item' : 'Schedule New Activity'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="text-slate-400 hover:text-slate-655 dark:hover:text-white font-bold"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveScheduleItem} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1 font-sans">Activity Name</label>
                  <input
                    type="text"
                    value={formActivityName}
                    onChange={(e) => setFormActivityName(e.target.value)}
                    placeholder="e.g. Story Time"
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 font-sans text-slate-800 dark:text-white focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1 font-sans">Start Time</label>
                    <input
                      type="text"
                      value={formStartTime}
                      onChange={(e) => setFormStartTime(e.target.value)}
                      placeholder="e.g. 09:00 AM"
                      className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 font-sans text-slate-800 dark:text-white focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1 font-sans">End Time</label>
                    <input
                      type="text"
                      value={formEndTime}
                      onChange={(e) => setFormEndTime(e.target.value)}
                      placeholder="e.g. 10:00 AM"
                      className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 font-sans text-slate-800 dark:text-white focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1 font-sans">Description</label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Details about the activity..."
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 font-sans text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/40 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsScheduleModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/60 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 font-sans"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/10 font-sans"
                  >
                    {scheduleModalMode === 'edit' ? 'Update Activity' : 'Save Activity'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
        {/* Viewing Activity Details Modal */}
        {viewingActivity && createPortal(
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] overflow-y-auto">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-150 dark:border-slate-800 p-6 flex flex-col space-y-4 animate-scale-up text-left">
              <div className="flex justify-between items-center pb-2 border-b border-slate-105 dark:border-slate-800/40">
                <h3 className="font-extrabold text-sm text-slate-850 dark:text-white font-sans flex items-center gap-2">
                  <TrendingUp className="h-4.5 w-4.5 text-brand-500" />
                  Activity Log Details
                </h3>
                <button
                  type="button"
                  onClick={() => setViewingActivity(null)}
                  className="text-slate-400 hover:text-slate-655 dark:hover:text-white font-bold"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3.5">
                <div>
                  <span className="text-[10px] font-bold text-slate-405 uppercase tracking-wider block">Activity Type</span>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 border border-brand-500/15">
                    {viewingActivity.title}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-405 uppercase tracking-wider block">Logged Date & Time</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mt-1">{viewingActivity.time}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-405 uppercase tracking-wider block">Description Details</span>
                  <p className="text-xs text-slate-605 dark:text-slate-350 font-sans leading-relaxed mt-1">{viewingActivity.desc}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-105 dark:border-slate-800/40 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingActivity(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/60 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 font-sans transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Editing Activity Modal */}
        {editingActivity && createPortal(
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] overflow-y-auto">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-150 dark:border-slate-800 p-6 flex flex-col space-y-4 animate-scale-up text-left">
              <div className="flex justify-between items-center pb-2 border-b border-slate-105 dark:border-slate-800/40">
                <h3 className="font-extrabold text-sm text-slate-850 dark:text-white font-sans flex items-center gap-2">
                  <Edit3 className="h-4.5 w-4.5 text-brand-500" />
                  Edit Activity Log Entry
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingActivity(null)}
                  className="text-slate-400 hover:text-slate-655 dark:hover:text-white font-bold"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveActivityEdit} className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-405 uppercase tracking-wider block mb-1">Activity Log Category</span>
                  <span className="inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 border border-brand-500/15">
                    {editingActivity.title}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1 font-sans">Description Details</label>
                  <textarea
                    value={editActivityText}
                    onChange={(e) => setEditActivityText(e.target.value)}
                    placeholder="Details about the activity..."
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 font-sans text-slate-800 dark:text-white focus:outline-none"
                    required
                  />
                </div>

                <div className="pt-2 border-t border-slate-105 dark:border-slate-800/40 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingActivity(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-855 dark:hover:bg-slate-700/60 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 font-sans"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/10 font-sans transition-all"
                  >
                    Update Activity
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* Record Attendance Modal */}
        {isAttendanceModalOpen && createPortal(
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] overflow-y-auto">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-150 dark:border-slate-800 p-6 flex flex-col space-y-4 animate-scale-up text-left">
              <div className="flex justify-between items-center pb-2 border-b border-slate-105 dark:border-slate-800/40">
                <h3 className="font-extrabold text-sm text-slate-850 dark:text-white font-sans flex items-center gap-2">
                  Record Student Attendance
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAttendanceModalOpen(false)}
                  className="text-slate-400 hover:text-slate-655 dark:hover:text-white font-bold"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAttendance} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1 font-sans">Student Name</label>
                  <select
                    value={attStudentName}
                    onChange={(e) => setAttStudentName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-955 border border-slate-205 dark:border-slate-800 font-sans text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value="Aarav Patel">Aarav Patel</option>
                    <option value="Diya Sen">Diya Sen</option>
                    <option value="Rohan Gupta">Rohan Gupta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1 font-sans">Classroom</label>
                  <input
                    type="text"
                    value={attClassroom}
                    onChange={(e) => setAttClassroom(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-955 border border-slate-205 dark:border-slate-800 font-sans text-slate-800 dark:text-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1 font-sans">Date</label>
                  <input
                    type="date"
                    value={attDate}
                    onChange={(e) => setAttDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-955 border border-slate-205 dark:border-slate-800 font-sans text-slate-800 dark:text-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1 font-sans">Status</label>
                  <select
                    value={attStatus}
                    onChange={(e) => setAttStatus(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-955 border border-slate-205 dark:border-slate-800 font-sans text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-slate-105 dark:border-slate-800/40 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAttendanceModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/60 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 font-sans"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAttendance}
                    className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md font-sans"
                  >
                    {submittingAttendance ? 'Saving...' : 'Record Attendance'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* Update Progress Modal */}
        {isProgressModalOpen && createPortal(
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] overflow-y-auto">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-150 dark:border-slate-800 p-6 flex flex-col space-y-4 animate-scale-up text-left">
              <div className="flex justify-between items-center pb-2 border-b border-slate-105 dark:border-slate-800/40">
                <h3 className="font-extrabold text-sm text-slate-850 dark:text-white font-sans flex items-center gap-2">
                  Update Child Progress Evaluation
                </h3>
                <button
                  type="button"
                  onClick={() => setIsProgressModalOpen(false)}
                  className="text-slate-400 hover:text-slate-655 dark:hover:text-white font-bold"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProgress} className="flex-1 overflow-y-auto pr-1 max-h-[70vh] space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1 font-sans">Student Name</label>
                  <select
                    value={progStudentName}
                    onChange={(e) => {
                      setProgStudentName(e.target.value);
                      if (e.target.value === 'Aarav Patel') {
                        setProgParentId('user_parent_1');
                      } else if (e.target.value === 'Diya Sen') {
                        setProgParentId('user_parent_2');
                      } else {
                        setProgParentId('user_parent_3');
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-955 border border-slate-205 dark:border-slate-800 font-sans text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value="Aarav Patel">Aarav Patel</option>
                    <option value="Diya Sen">Diya Sen</option>
                    <option value="Rohan Gupta">Rohan Gupta</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1 font-sans">Cognitive Development (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={progCognitive}
                      onChange={(e) => setProgCognitive(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-955 border border-slate-205 dark:border-slate-800 font-sans text-slate-800 dark:text-white focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1 font-sans">Gross Motor Skills (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={progMotor}
                      onChange={(e) => setProgMotor(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-955 border border-slate-205 dark:border-slate-800 font-sans text-slate-800 dark:text-white focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1 font-sans">Sensory Play (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={progSensory}
                      onChange={(e) => setProgSensory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-955 border border-slate-205 dark:border-slate-800 font-sans text-slate-800 dark:text-white focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1 font-sans">Social-Emotional (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={progSocial}
                      onChange={(e) => setProgSocial(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-955 border border-slate-205 dark:border-slate-800 font-sans text-slate-800 dark:text-white focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1 font-sans">Language & Communication (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={progLanguage}
                    onChange={(e) => setProgLanguage(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-955 border border-slate-205 dark:border-slate-800 font-sans text-slate-800 dark:text-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1 font-sans">Teacher Feedback Comments</label>
                  <textarea
                    value={progFeedback}
                    onChange={(e) => setProgFeedback(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-955 border border-slate-205 dark:border-slate-800 font-sans text-slate-800 dark:text-white focus:outline-none"
                    required
                  />
                </div>

                <div className="pt-2 border-t border-slate-105 dark:border-slate-800/40 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsProgressModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/60 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 font-sans"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingProgress}
                    className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md font-sans"
                  >
                    {submittingProgress ? 'Saving...' : 'Update Progress'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
      </>
    );
  };

  const renderCoordinatorDashboard = () => {
    const kpis = data?.kpis || {
      totalCurriculums: 0,
      activeLessonPlans: 0,
      pendingApprovals: 0,
      totalActivities: 0,
      curriculumCompletionPercentage: 0,
      activeTeachers: 0
    };

    return (
      <div className="space-y-6 pb-12 text-left animate-fade-in font-sans">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white font-sans tracking-tight">
              Hello, {user?.name} 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-sans mt-0.5">
              Review submitted lesson plans, track progress, and manage teacher approvals.
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-brand-500/10 text-brand-600 dark:bg-brand-500/5 dark:text-brand-400 px-4 py-2 rounded-xl border border-brand-500/15 text-xs font-semibold font-sans capitalize">
            Role Access: {user?.role}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-brand-500">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-405 dark:text-slate-505">
                Total Curriculums
              </span>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">
                {kpis.totalCurriculums}
              </h3>
              <span className="text-[10px] text-slate-400 block font-medium">Active this term</span>
            </div>
            <div className="bg-brand-500/10 text-brand-500 p-3 rounded-xl dark:bg-brand-500/5">
              <BookOpen className="h-6 w-6" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-sky-500">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-405 dark:text-slate-505">
                Active Lesson Plans
              </span>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">
                {kpis.activeLessonPlans}
              </h3>
              <span className="text-[10px] text-slate-400 block font-medium">Scheduled this week</span>
            </div>
            <div className="bg-sky-500/10 text-sky-500 p-3 rounded-xl dark:bg-sky-500/5">
              <Clock className="h-6 w-6" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-amber-500">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-405 dark:text-slate-505">
                Pending Reviews
              </span>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">
                {kpis.pendingApprovals}
              </h3>
              <span className="text-[10px] text-slate-400 block font-medium">Coordinator action required</span>
            </div>
            <div className="bg-amber-500/10 text-amber-500 p-3 rounded-xl dark:bg-amber-500/5">
              <Layers className="h-6 w-6" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-emerald-500">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-405 dark:text-slate-505">
                Curriculum Completion
              </span>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">
                {kpis.curriculumCompletionPercentage}%
              </h3>
              <div className="w-24 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${kpis.curriculumCompletionPercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-emerald-500/10 text-emerald-500 p-3 rounded-xl dark:bg-emerald-500/5">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="glass-card p-6 rounded-2xl lg:col-span-2 flex flex-col border border-slate-205/50 dark:border-slate-800/15">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white font-sans tracking-tight">
                Curriculum & Lesson Plan Review Priority
              </h3>
              <span className="text-[10px] bg-amber-500/10 text-amber-605 px-2 py-0.5 rounded-lg font-black font-mono">
                {pendingCurriculums.length + pendingLessons.length} Pending Actions
              </span>
            </div>

            {actionMessage && (
              <div className={`p-2.5 mb-3 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border animate-fade-in ${actionMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/15 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450'
                : 'bg-red-500/10 border-red-500/15 text-red-650 dark:bg-red-950/20 dark:text-red-450'
                }`}>
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{actionMessage.text}</span>
              </div>
            )}

            <div className="space-y-4 overflow-y-auto max-h-[350px] flex-1 pr-1">
              {pendingCurriculums.length === 0 && pendingLessons.length === 0 ? (
                <div className="text-center py-12 text-slate-405 text-xs italic">
                  All submissions review tasks caught up! Perfect score.
                </div>
              ) : (
                <>
                  {pendingCurriculums.map(c => (
                    <div key={c._id} className="p-4 bg-slate-50 dark:bg-slate-900/25 border border-slate-100 dark:border-slate-800/40 rounded-xl space-y-3 text-left">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="px-2.5 py-0.5 text-[9px] font-black uppercase rounded bg-rose-500/10 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
                            High Priority
                          </span>
                          <h4 className="font-bold text-xs text-slate-800 dark:text-white mt-1.5">
                            Curriculum Plan: {c.title}
                          </h4>
                          <span className="text-[10px] text-slate-500 mt-0.5 block font-medium">
                            Theme: {c.themeName} • Month: {c.month} • Created by: {c.createdBy?.name || 'Teacher'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono font-medium">
                          {c.academicYear}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-855/30">
                        <input
                          type="text"
                          placeholder="Rejection feedback comments..."
                          value={actionFeedback[c._id] || ''}
                          onChange={(e) => setActionFeedback({ ...actionFeedback, [c._id]: e.target.value })}
                          className="w-full sm:flex-1 px-3 py-1.5 text-xs rounded-xl glass-input font-sans text-slate-850 dark:text-white"
                        />
                        <div className="flex items-center space-x-1.5 w-full sm:w-auto justify-end">
                          <button
                            onClick={() => handleRejectCurriculum(c._id)}
                            className="px-2.5 py-1.5 text-[10px] font-bold bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl border border-red-500/15"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApproveCurriculum(c._id)}
                            className="px-2.5 py-1.5 text-[10px] font-bold bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl shadow-sm"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {pendingLessons.map(l => (
                    <div key={l._id} className="p-4 bg-slate-50 dark:bg-slate-900/25 border border-slate-100 dark:border-slate-800/40 rounded-xl space-y-3 text-left">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="px-2.5 py-0.5 text-[9px] font-black uppercase rounded bg-blue-500/10 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                            Medium Priority
                          </span>
                          <h4 className="font-bold text-xs text-slate-800 dark:text-white mt-1.5">
                            Lesson Plan: {l.topic}
                          </h4>
                          <span className="text-[10px] text-slate-500 mt-0.5 block font-medium">
                            Subject: {l.subjectArea} • Classroom: {l.classroom || (l.teacher && l.teacher.classroom)} • Teacher: {l.teacher?.name}
                          </span>
                        </div>
                        <div className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400 font-bold">
                          Week {l.weekNumber}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-855/30">
                        <input
                          type="text"
                          placeholder="Rejection feedback comments..."
                          value={actionFeedback[l._id] || ''}
                          onChange={(e) => setActionFeedback({ ...actionFeedback, [l._id]: e.target.value })}
                          className="w-full sm:flex-1 px-3 py-1.5 text-xs rounded-xl glass-input font-sans text-slate-850 dark:text-white"
                        />
                        <div className="flex items-center space-x-1.5 w-full sm:w-auto justify-end">
                          <button
                            onClick={() => handleRejectLesson(l._id)}
                            className="px-2.5 py-1.5 text-[10px] font-bold bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl border border-red-500/15"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApproveLesson(l._id)}
                            className="px-2.5 py-1.5 text-[10px] font-bold bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl shadow-sm"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl flex flex-col border border-slate-205/50 dark:border-slate-800/15">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4 font-sans tracking-tight">
              Review Action History Log
            </h3>

            <div className="space-y-4 overflow-y-auto max-h-[350px] flex-1 pr-1 text-left">
              {actionHistory.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs italic">
                  No review actions logged.
                </div>
              ) : (
                actionHistory.map((act, idx) => (
                  <div key={act._id || idx} className="relative pl-6 pb-4 border-l-2 border-slate-100 dark:border-slate-800 last:border-l-0 last:pb-0">
                    <span className={`absolute -left-[6px] top-1 h-2.5 w-2.5 rounded-full ${act.action === 'Approved' ? 'bg-emerald-500' : 'bg-red-500'
                      }`}></span>

                    <div className="flex justify-between items-center">
                      <span className={`text-[9px] font-black uppercase ${act.action === 'Approved' ? 'text-emerald-600' : 'text-red-500'
                        }`}>
                        {act.action}
                      </span>
                      <span className="text-[9px] text-slate-405 font-mono font-medium">
                        {new Date(act.actionTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-850 dark:text-white leading-tight mt-1">
                      {act.itemType}: {act.title || act.topic}
                    </h4>

                    {act.feedback && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-455 font-medium italic mt-1 leading-snug">
                        "{act.feedback}"
                      </p>
                    )}

                    <span className="text-[9px] text-slate-400 mt-1 block">
                      {act.itemType === 'Curriculum'
                        ? `Month: ${act.month} • Created by: ${act.createdBy?.name || 'Teacher'}`
                        : `Classroom: ${act.classroom || (act.teacher && act.teacher.classroom)} • Teacher: ${act.teacher?.name || 'Teacher'}`
                      }
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-2xl flex flex-col border border-slate-205/50">
            <h3 className="font-bold text-sm text-slate-805 dark:text-white mb-4 tracking-tight">
              Monthly Curriculum Plans Progress
            </h3>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.charts?.monthlyProgress || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(255,255,255,0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
                      fontSize: '11px',
                      color: '#1e293b'
                    }}
                  />
                  <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Approved" stackId="a" fill="#10B981" />
                  <Bar dataKey="Submitted" stackId="a" fill="#3B82F6" />
                  <Bar dataKey="Draft" stackId="a" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl flex flex-col border border-slate-205/50">
            <h3 className="font-bold text-sm text-slate-805 dark:text-white mb-4 tracking-tight">
              Teacher Activity & Performance Scorecard
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/40 text-slate-400 uppercase font-semibold">
                    <th className="pb-3 pl-2">Teacher Name</th>
                    <th className="pb-3">Classroom</th>
                    <th className="pb-3 text-center">Plans Drafted</th>
                    <th className="pb-3 text-center">Plans Approved</th>
                    <th className="pb-3 pr-2 text-right">Performance Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
                  {(data?.teacherPerformance || []).slice(0, 1).map((t) => (
                    <tr key={t._id} className="hover:bg-slate-100/30">
                      <td className="py-3 pl-2 font-bold text-slate-800 dark:text-white">{t.name}</td>
                      <td className="py-3 text-slate-550 dark:text-slate-400">{t.classroom}</td>
                      <td className="py-3 text-center font-semibold text-slate-605">{t.plansCreated}</td>
                      <td className="py-3 text-center font-semibold text-emerald-500">{t.plansApproved}</td>
                      <td className="py-3 pr-2 text-right">
                        <span className={`px-2.5 py-1 rounded-lg font-bold ${t.performanceScore >= 95 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-600'}`}>
                          {t.performanceScore}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAdminDashboard = () => {
    const kpis = data?.kpis || {
      totalCurriculums: 0,
      activeLessonPlans: 0,
      pendingApprovals: 0,
      totalActivities: 0,
      curriculumCompletionPercentage: 0,
      activeTeachers: 0
    };

    return (
      <div className="space-y-6 pb-12 text-left animate-fade-in font-sans">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white font-sans tracking-tight">
              Hello, {user?.name} 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-sans mt-0.5">
              System Admin Desk. Oversee platform configurations, activity feeds, and coordinator actions.
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-brand-500/10 text-brand-600 dark:bg-brand-500/5 dark:text-brand-400 px-4 py-2 rounded-xl border border-brand-500/15 text-xs font-semibold font-sans capitalize">
            Role Access: {user?.role}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-purple-500">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550">
                Portal Accounts
              </span>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">
                {kpis.activeTeachers + 2} Registered
              </h3>
              <span className="text-[10px] text-slate-400 block font-medium">All database users logged</span>
            </div>
            <div className="bg-purple-500/10 text-purple-500 p-3 rounded-xl dark:bg-purple-500/5">
              <Users className="h-6 w-6" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-blue-500">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-555">
                School Curriculums
              </span>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">
                {kpis.totalCurriculums} Active
              </h3>
              <span className="text-[10px] text-slate-400 block font-medium">Theme-based curriculums</span>
            </div>
            <div className="bg-blue-500/10 text-blue-500 p-3 rounded-xl dark:bg-blue-500/5">
              <School className="h-6 w-6" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-amber-500">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-555">
                Pending Actions
              </span>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">
                {kpis.pendingApprovals} Pending
              </h3>
              <span className="text-[10px] text-slate-400 block font-medium">Awaiting branch action</span>
            </div>
            <div className="bg-amber-500/10 text-amber-500 p-3 rounded-xl dark:bg-amber-500/5">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-emerald-500">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-405 dark:text-slate-555">
                Activities Library
              </span>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">
                {kpis.totalActivities} Tasks
              </h3>
              <span className="text-[10px] text-slate-400 block font-medium">Pre-populated activities</span>
            </div>
            <div className="bg-emerald-500/10 text-emerald-500 p-3 rounded-xl dark:bg-emerald-500/5">
              <BookOpen className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="animate-fade-in">
          <div className="glass-card p-6 rounded-2xl flex flex-col border border-slate-205/50 w-full">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4 tracking-tight">
              Recent Planning Activity Feed
            </h3>
            <div className="flex-1 space-y-4 max-h-[350px] overflow-y-auto">
              {(data?.recentFeed || []).length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No recent activity logged.
                </div>
              ) : (
                (data?.recentFeed || []).map((item) => (
                  <div key={item.id} className="flex items-start space-x-3.5 pb-3.5 border-b border-slate-100 dark:border-slate-800/30 last:border-b-0 last:pb-0">
                    <div className={`p-2 rounded-xl flex-shrink-0 ${item.type === 'curriculum' ? 'bg-purple-100 text-purple-600' : 'bg-sky-100 text-sky-600'}`}>
                      {item.type === 'curriculum' ? <FileText className="h-4.5 w-4.5" /> : <Calendar className="h-4.5 w-4.5" />}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <h4 className="text-xs font-bold text-slate-808 dark:text-white truncate">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                        {item.description}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {new Date(item.time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (user?.role === 'parent') {
    return renderParentDashboard();
  }
  if (user?.role === 'teacher') {
    return renderTeacherDashboard();
  }
  if (user?.role === 'coordinator') {
    return <Navigate to="/coordinator-panel?tab=dashboard" replace />;
  }
  if (user?.role === 'admin') {
    return renderAdminDashboard();
  }

  return (
    <div className="p-8 text-center text-slate-500">
      No customized dashboard found for your role profile.
    </div>
  );
};

export default Dashboard;
