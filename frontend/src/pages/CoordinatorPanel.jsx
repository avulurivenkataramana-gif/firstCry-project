import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Layers, 
  BookOpen, 
  MessageSquare, 
  Megaphone, 
  Check, 
  X, 
  AlertCircle, 
  Clock, 
  ShieldAlert,
  Users,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Calendar,
  CalendarDays,
  Plus,
  Trash2,
  Award,
  Phone,
  Shield,
  BarChart3,
  Settings,
  Play,
  Send,
  ListTodo,
  HelpCircle,
  FileText,
  ChevronLeft,
  Volume2,
  PhoneOff,
  User,
  Info,
  Calendar as LucideCalendar
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
  AreaChart,
  Area
} from 'recharts';

const CoordinatorPanel = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';

  // Data states
  const [plans, setPlans] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [escalations, setEscalations] = useState([]);
  const [notices, setNotices] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active items states
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Notice composer states
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [targetClass, setTargetClass] = useState('All');
  const [noticeCategory, setNoticeCategory] = useState('general');
  const [submittingNotice, setSubmittingNotice] = useState(false);
  const [noticeFeedback, setNoticeFeedback] = useState(null);

  // Call simulator states
  const [simulatingCall, setSimulatingCall] = useState(false);
  const [callingEscalation, setCallingEscalation] = useState(null);
  const [callStatus, setCallStatus] = useState('Connecting...'); // Connecting, Connected, Ended
  const [callTimer, setCallTimer] = useState(0);

  // Meeting scheduler states
  const [schedulingMeeting, setSchedulingMeeting] = useState(false);
  const [meetingEscalation, setMeetingEscalation] = useState(null);
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingAgenda, setMeetingAgenda] = useState('');

  // Internal notes states
  const [editingNotesEscalation, setEditingNotesEscalation] = useState(null);
  const [internalNotesText, setInternalNotesText] = useState('');

  // Teacher modal details state
  const [viewingTeacher, setViewingTeacher] = useState(null);

  // Calendar states
  const [calendarDate, setCalendarDate] = useState(new Date(2026, 5, 15)); // Default June 2026
  const [calendarClassroomFilter, setCalendarClassroomFilter] = useState('All');
  const [creatingCalendarEvent, setCreatingCalendarEvent] = useState(false);
  const [calendarEventTitle, setCalendarEventTitle] = useState('');
  const [calendarEventType, setCalendarEventType] = useState('PTM'); // PTM, Meeting, Holiday, Coordination
  const [calendarEventDate, setCalendarEventDate] = useState('');
  const [calendarEventTime, setCalendarEventTime] = useState('');
  const [calendarEventDesc, setCalendarEventDesc] = useState('');

  // Selected event for detail modal
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState(null);

  // Local storage calendar events
  const [customEvents, setCustomEvents] = useState(() => {
    const saved = localStorage.getItem('coordinator_calendar_events');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'ev_1', title: 'PTM - Term Preparation Review', type: 'PTM', date: '2026-06-12', time: '10:00 AM', desc: 'Syllabus and safety review with parents' },
      { id: 'ev_2', title: 'Coordinator Department Meeting', type: 'Meeting', date: '2026-06-20', time: '02:00 PM', desc: 'Weekly check-in on teacher compliance rates' },
      { id: 'ev_3', title: 'School-Wide Holiday: Monsoon break', type: 'Holiday', date: '2026-06-25', time: 'All Day', desc: 'Closed for monsoon holidays' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('coordinator_calendar_events', JSON.stringify(customEvents));
  }, [customEvents]);

  // Fetch all database context
  const fetchData = async () => {
    try {
      setLoading(true);
      const [curriculumsRes, lessonsRes, escalationsRes, analyticsRes, noticesRes] = await Promise.all([
        api.get('/curriculum'),
        api.get('/lessons'),
        api.get('/parent/escalations'),
        api.get('/analytics/dashboard'),
        api.get('/parent/notices')
      ]);

      if (curriculumsRes.success) setPlans(curriculumsRes.data);
      if (lessonsRes.success) setLessons(lessonsRes.data);
      if (escalationsRes.success) setEscalations(escalationsRes.data);
      if (noticesRes.success) setNotices(noticesRes.data);
      if (analyticsRes.success) setDashboardStats(analyticsRes.data);
    } catch (err) {
      console.error('Error fetching coordinator statistics:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'coordinator') {
      fetchData();
    }
  }, [user]);

  // Call simulator timer hook
  useEffect(() => {
    let interval;
    if (simulatingCall && callStatus === 'Connected') {
      interval = setInterval(() => {
        setCallTimer(prev => prev + 1);
      }, 1000);
    } else {
      setCallTimer(0);
    }
    return () => clearInterval(interval);
  }, [simulatingCall, callStatus]);

  if (user?.role !== 'coordinator') {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400 font-sans">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-205/50 dark:border-slate-800/15 rounded-2xl p-8 shadow-sm">
          <ShieldAlert className="h-10 w-10 text-red-500 mx-auto mb-2 animate-pulse" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">Access Denied</h3>
          <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">You do not have coordinator permissions to view this panel.</p>
        </div>
      </div>
    );
  }

  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'resolved':
        return 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/5 dark:text-emerald-400 border border-emerald-500/15';
      case 'submitted':
      case 'in progress':
      case 'under_review':
        return 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/5 dark:text-blue-400 border border-blue-500/15';
      case 'meeting scheduled':
        return 'bg-purple-500/10 text-purple-650 dark:bg-purple-500/5 dark:text-purple-400 border border-purple-500/15';
      case 'needs_revision':
      case 'pending':
        return 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/5 dark:text-amber-400 border border-amber-500/15';
      case 'rejected':
      case 'closed':
        return 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/5 dark:text-rose-400 border border-rose-500/15';
      default:
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-700/15';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'bg-red-650 text-white dark:bg-red-950/45 dark:text-red-400 font-bold border border-red-500/30';
      case 'high':
        return 'bg-rose-500/10 text-rose-600 dark:bg-rose-955/20 dark:text-rose-400 font-bold border border-rose-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-600 dark:bg-amber-955/20 dark:text-amber-400 border border-amber-500/15';
      default:
        return 'bg-slate-100 text-slate-650 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  // Handler for curriculum review action
  const handleReviewAction = async (planId, action) => {
    if (!reviewFeedback && action !== 'approve' && action !== 'review') {
      alert('Please enter feedback comments explaining your request.');
      return;
    }

    setSubmittingReview(true);
    try {
      let response;
      if (action === 'approve') {
        response = await api.post(`/curriculum/${planId}/approve`, { feedback: reviewFeedback || 'Curriculum approved.' });
      } else if (action === 'review') {
        response = await api.post(`/curriculum/${planId}/review`);
      } else {
        response = await api.post(`/curriculum/${planId}/reject`, { 
          feedback: reviewFeedback, 
          status: action === 'reject' ? 'rejected' : 'needs_revision' 
        });
      }

      if (response.success) {
        setReviewFeedback('');
        // Reload plans details
        const updatedPlans = await api.get('/curriculum');
        if (updatedPlans.success) setPlans(updatedPlans.data);
        
        // Refresh detail view
        const updatedPlanDetail = await api.get(`/curriculum/${planId}`);
        if (updatedPlanDetail.success) {
          // Keep active view populated
          setSelectedPlanId(planId);
        }
        
        // Refresh metrics
        const updatedAnalytics = await api.get('/analytics/dashboard');
        if (updatedAnalytics.success) setDashboardStats(updatedAnalytics.data);

        if (action === 'review') {
          alert('Curriculum plan is now marked as Under Review.');
        } else {
          alert(`Curriculum plan has been updated successfully!`);
        }
      }
    } catch (err) {
      alert(err.message || 'Operation failed.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handler for Broadcast Announcement
  const handlePostNotice = async (e) => {
    e.preventDefault();
    if (!noticeTitle || !noticeContent) return;

    setSubmittingNotice(true);
    setNoticeFeedback(null);
    try {
      const response = await api.post('/parent/notices', {
        title: noticeTitle,
        content: `[Category: ${noticeCategory}] ${noticeContent}`,
        targetClassroom: targetClass
      });

      if (response.success) {
        setNoticeFeedback({ type: 'success', text: 'Announcement broadcasted successfully to all target feeds!' });
        setNoticeTitle('');
        setNoticeContent('');
        setTargetClass('All');
        setNoticeCategory('general');
        // Reload notices
        const noticesRes = await api.get('/parent/notices');
        if (noticesRes.success) setNotices(noticesRes.data);
      }
    } catch (err) {
      setNoticeFeedback({ type: 'error', text: err.message || 'Failed to post announcement.' });
    } finally {
      setSubmittingNotice(false);
    }
  };

  // Handler for Escalation Desk operations
  const handleUpdateEscalationStatus = async (escId, updates, alertMessage) => {
    try {
      const response = await api.put(`/parent/escalations/${escId}`, updates);
      if (response.success) {
        const escalationsRes = await api.get('/parent/escalations');
        if (escalationsRes.success) setEscalations(escalationsRes.data);
        if (alertMessage) alert(alertMessage);
      }
    } catch (err) {
      alert(err.message || 'Update failed.');
    }
  };

  // Call simulator trigger
  const triggerCallSimulation = (escalation) => {
    setCallingEscalation(escalation);
    setCallStatus('Connecting...');
    setSimulatingCall(true);
    
    // Simulate ring and pick up
    setTimeout(() => {
      setCallStatus('Connected');
    }, 2000);
  };

  const handleEndCallSimulation = async () => {
    setCallStatus('Ended');
    setTimeout(async () => {
      setSimulatingCall(false);
      // Log the call in escalation resolution history
      const durationFormatted = `${Math.floor(callTimer / 60)}m ${callTimer % 60}s`;
      await handleUpdateEscalationStatus(callingEscalation._id || callingEscalation.caseId, {
        status: 'In Progress',
        noteText: `Coordinator call to parent completed. Duration: ${durationFormatted}. Discussion: Reviewed specific case points.`
      });
      setCallingEscalation(null);
    }, 1500);
  };

  // Meeting scheduler execution
  const executeMeetingSchedule = async (e) => {
    e.preventDefault();
    if (!meetingDate || !meetingTime || !meetingAgenda) return;

    const formattedMeetingString = `Meeting scheduled for ${meetingDate} at ${meetingTime}. Agenda: ${meetingAgenda}`;
    
    // Add meeting to calendar events
    const newEvent = {
      id: `ev_m_${Date.now()}`,
      title: `PTM: ${meetingEscalation.studentName} Case Review`,
      type: 'PTM',
      date: meetingDate,
      time: meetingTime,
      desc: meetingAgenda
    };
    setCustomEvents(prev => [...prev, newEvent]);

    // Update case status
    await handleUpdateEscalationStatus(meetingEscalation._id || meetingEscalation.caseId, {
      status: 'Meeting Scheduled',
      noteText: formattedMeetingString
    });

    setSchedulingMeeting(false);
    setMeetingEscalation(null);
    setMeetingDate('');
    setMeetingTime('');
    setMeetingAgenda('');
  };

  // Save escalation internal notes
  const saveInternalNotes = async () => {
    await handleUpdateEscalationStatus(editingNotesEscalation._id || editingNotesEscalation.caseId, {
      internalNotes: internalNotesText,
      noteText: 'Internal operational notes updated by Coordinator.'
    });
    setEditingNotesEscalation(null);
    setInternalNotesText('');
  };

  // Save coordinator calendar event
  const handleSaveCalendarEvent = (e) => {
    e.preventDefault();
    if (!calendarEventTitle || !calendarEventDate) return;

    const newEvent = {
      id: `ev_c_${Date.now()}`,
      title: calendarEventTitle,
      type: calendarEventType,
      date: calendarEventDate,
      time: calendarEventTime || 'All Day',
      desc: calendarEventDesc
    };

    setCustomEvents(prev => [...prev, newEvent]);
    setCreatingCalendarEvent(false);
    setCalendarEventTitle('');
    setCalendarEventDate('');
    setCalendarEventTime('');
    setCalendarEventDesc('');
  };

  // Dynamic values computation
  const submittedPlansCount = plans.filter(p => p.status === 'submitted' || p.status === 'under_review').length;
  const approvedPlansCount = plans.filter(p => p.status === 'approved').length;
  const revisionPlansCount = plans.filter(p => p.status === 'needs_revision').length;
  const activeEscalationsCount = escalations.filter(e => e.status !== 'Resolved' && e.status !== 'Closed').length;

  const currentSelectedPlan = plans.find(p => p._id === selectedPlanId);

  // Month Calendar Grid computations
  const calendarYear = calendarDate.getFullYear();
  const calendarMonthIdx = calendarDate.getMonth();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const daysInMonthCount = new Date(calendarYear, calendarMonthIdx + 1, 0).getDate();
  const startDayOffset = new Date(calendarYear, calendarMonthIdx, 1).getDay();

  const calendarDays = useMemo(() => {
    const list = [];
    // Previous month days to fill offset padding
    const prevMonthDaysCount = new Date(calendarYear, calendarMonthIdx, 0).getDate();
    for (let i = startDayOffset - 1; i >= 0; i--) {
      list.push({
        dayNum: prevMonthDaysCount - i,
        isCurrentMonth: false,
        dateString: new Date(calendarYear, calendarMonthIdx - 1, prevMonthDaysCount - i).toISOString().split('T')[0]
      });
    }
    // Current month days
    for (let i = 1; i <= daysInMonthCount; i++) {
      list.push({
        dayNum: i,
        isCurrentMonth: true,
        dateString: new Date(calendarYear, calendarMonthIdx, i).toISOString().split('T')[0]
      });
    }
    return list;
  }, [calendarYear, calendarMonthIdx, daysInMonthCount, startDayOffset]);

  // Calendar filter lookup
  const getDayItems = (dateStr) => {
    const list = [];

    // Filtered lesson plans
    lessons.forEach(l => {
      if (l.date && l.date.split('T')[0] === dateStr) {
        const classStr = l.classroom || l.teacher?.classroom || 'Nursery-A';
        if (calendarClassroomFilter === 'All' || classStr === calendarClassroomFilter) {
          list.push({
            type: 'lesson',
            id: l._id,
            title: `Plan: ${l.topic}`,
            status: l.status,
            raw: l
          });
        }
      }
    });

    // Custom coordination events
    customEvents.forEach(e => {
      if (e.date === dateStr) {
        list.push({
          type: 'event',
          id: e.id,
          title: `[${e.type}] ${e.title}`,
          desc: e.desc,
          time: e.time,
          raw: e
        });
      }
    });

    return list;
  };

  // Recharts Analytics datasets helper
  const analyticsBarData = useMemo(() => {
    if (dashboardStats?.charts?.monthlyProgress) return dashboardStats.charts.monthlyProgress;
    return [
      { name: 'Jan', Approved: 2, Submitted: 1, Draft: 1 },
      { name: 'Feb', Approved: 3, Submitted: 2, Draft: 0 },
      { name: 'Mar', Approved: 5, Submitted: 1, Draft: 2 },
      { name: 'Apr', Approved: 4, Submitted: 3, Draft: 1 },
      { name: 'May', Approved: 6, Submitted: 2, Draft: 2 },
      { name: 'June', Approved: approvedPlansCount, Submitted: submittedPlansCount, Draft: plans.filter(p => p.status === 'draft').length },
    ];
  }, [dashboardStats, approvedPlansCount, submittedPlansCount, plans]);

  const analyticsPieData = useMemo(() => {
    // Group escalations by category
    const counts = {};
    escalations.forEach(e => {
      counts[e.issueCategory] = (counts[e.issueCategory] || 0) + 1;
    });

    const dataset = Object.keys(counts).map(cat => ({
      name: cat,
      value: counts[cat]
    }));

    if (dataset.length === 0) {
      return [
        { name: 'Medical', value: 2 },
        { name: 'Learning Difficulty', value: 1 },
        { name: 'Safety Concern', value: 1 }
      ];
    }
    return dataset;
  }, [escalations]);

  const PIE_COLORS = ['#8d44ff', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#14b8a6'];

  const complianceTrendData = [
    { week: 'Wk 1', compliance: 95 },
    { week: 'Wk 2', compliance: 92 },
    { week: 'Wk 3', compliance: 94 },
    { week: 'Wk 4', compliance: 96 },
    { week: 'Wk 5', compliance: 98 }
  ];

  return (
    <div className="space-y-4 pb-4 font-sans text-left">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
            <Layers className="h-6 w-6 mr-2 text-brand-500 animate-pulse-subtle" />
            Academic Operations Center
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 font-medium">
            Syllabus reviews, performance scorecards, coordination schedules, notices broadcasts, and case files.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-brand-500/10 text-brand-600 dark:bg-brand-500/5 dark:text-brand-400 px-4 py-2 rounded-xl border border-brand-500/15 text-xs font-bold uppercase tracking-wider">
          Coordinator Mode
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-28 glass-card rounded-2xl animate-pulse"></div>
            ))}
          </div>
          <div className="h-96 glass-card rounded-2xl animate-pulse"></div>
        </div>
      ) : (
        <>
          {/* TAB 1: OPERATIONS DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div 
                  onClick={() => setActiveTab('reviews')}
                  className="glass-card p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-amber-500 cursor-pointer hover:-translate-y-0.5 transition-all shadow-xs"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-405 dark:text-slate-505">
                      Pending Reviews
                    </span>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">
                      {submittedPlansCount}
                    </h3>
                    <span className="text-[10px] text-slate-400 block font-medium">Curriculums submitted</span>
                  </div>
                  <div className="bg-amber-500/10 text-amber-500 p-3 rounded-xl dark:bg-amber-500/5">
                    <Clock className="h-6 w-6" />
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('reviews')}
                  className="glass-card p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-emerald-500 cursor-pointer hover:-translate-y-0.5 transition-all shadow-xs"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-405 dark:text-slate-505">
                      Approved Curriculums
                    </span>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">
                      {approvedPlansCount}
                    </h3>
                    <span className="text-[10px] text-slate-400 block font-medium">Approved this term</span>
                  </div>
                  <div className="bg-emerald-500/10 text-emerald-500 p-3 rounded-xl dark:bg-emerald-500/5">
                    <Check className="h-6 w-6" />
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('reviews')}
                  className="glass-card p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-rose-500 cursor-pointer hover:-translate-y-0.5 transition-all shadow-xs"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-405 dark:text-slate-505">
                      Revision Requests
                    </span>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">
                      {revisionPlansCount}
                    </h3>
                    <span className="text-[10px] text-slate-400 block font-medium">Under active correction</span>
                  </div>
                  <div className="bg-rose-500/10 text-rose-500 p-3 rounded-xl dark:bg-rose-500/5">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                </div>
              </div>

              {/* Second Row KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div 
                  onClick={() => setActiveTab('reports')}
                  className="glass-card p-5 rounded-2xl flex items-center justify-between cursor-pointer hover:-translate-y-0.5 transition-all"
                >
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Curriculum Completion</span>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white mt-1">
                      {dashboardStats?.kpis?.curriculumCompletionPercentage || 0}%
                    </h3>
                    <div className="w-24 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${dashboardStats?.kpis?.curriculumCompletionPercentage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-sky-500/10 text-sky-500 p-3 rounded-xl">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('performance')}
                  className="glass-card p-5 rounded-2xl flex items-center justify-between cursor-pointer hover:-translate-y-0.5 transition-all"
                >
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Teacher Compliance</span>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white mt-1">
                      92% Rate
                    </h3>
                    <span className="text-[10px] text-slate-405 mt-1 block">Active teachers in boundary</span>
                  </div>
                  <div className="bg-emerald-500/10 text-emerald-500 p-3 rounded-xl">
                    <UserCheck className="h-6 w-6" />
                  </div>
                </div>
              </div>

              {/* Two columns: recent logs and quick statistics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-2xl lg:col-span-2 border border-slate-205/50 dark:border-slate-800/15">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4 tracking-tight flex items-center gap-2">
                    <LucideCalendar className="h-4.5 w-4.5 text-brand-500" />
                    Operations Priority Timeline
                  </h3>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {submittedPlansCount === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-12">No high priority pending items today.</p>
                    ) : (
                      <>
                        {plans.filter(p => p.status === 'submitted' || p.status === 'under_review').map(p => (
                          <div key={p._id} className="p-3.5 bg-slate-50 dark:bg-slate-900/25 border border-slate-100 dark:border-slate-800/40 rounded-xl flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-slate-800 dark:text-white">Curriculum Plan: {p.title}</span>
                              <p className="text-[10px] text-slate-400 mt-1">Month: {p.month} • Created by teacher: {p.createdBy?.name || 'Staff'}</p>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedPlanId(p._id);
                                setActiveTab('reviews');
                              }}
                              className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-bold transition-colors"
                            >
                              Review Plan
                            </button>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                <div className="glass-card p-6 rounded-2xl flex flex-col border border-slate-205/50 dark:border-slate-800/15">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4 tracking-tight">
                    Review Actions Log
                  </h3>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 text-left flex-1">
                    {plans.filter(p => p.reviewHistory && p.reviewHistory.length > 0).length === 0 ? (
                      <p className="text-xs text-slate-405 italic py-12 text-center">No review logs compiled yet.</p>
                    ) : (
                      plans.filter(p => p.reviewHistory && p.reviewHistory.length > 0).map((p, idx) => (
                        <div key={idx} className="border-l-2 border-slate-100 dark:border-slate-800 pl-4 pb-3 last:pb-0 relative text-xs">
                          <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-brand-500"></span>
                          <span className="text-[9px] text-slate-400 block font-mono">
                            {new Date(p.reviewHistory[p.reviewHistory.length-1].createdAt).toLocaleDateString()}
                          </span>
                          <p className="font-bold text-slate-800 dark:text-white mt-0.5 truncate">{p.title}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                            "{p.reviewHistory[p.reviewHistory.length-1].feedback || 'No comments'}"
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CURRICULUM REVIEW CENTER */}
          {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-left">
              {/* Pipeline List Panel */}
              <div className={`glass-card p-5 rounded-2xl border border-slate-205/50 dark:border-slate-800/15 flex flex-col max-h-[75vh] ${currentSelectedPlan ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4 tracking-tight flex items-center">
                  <BookOpen className="h-4.5 w-4.5 text-brand-500 mr-2" />
                  Curriculum Plans Review Pipeline
                </h3>

                <div className="space-y-4 overflow-y-auto flex-1 pr-1">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Pending Coordinator Review</h4>
                    {plans.filter(p => p.status === 'submitted' || p.status === 'under_review').length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">No pending items.</p>
                    ) : (
                      <div className="space-y-2">
                        {plans.filter(p => p.status === 'submitted' || p.status === 'under_review').map(p => (
                          <div 
                            key={p._id}
                            onClick={() => setSelectedPlanId(p._id)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                              selectedPlanId === p._id 
                                ? 'bg-brand-500/5 border-brand-500/30' 
                                : 'bg-slate-50 dark:bg-slate-900/25 border-transparent hover:bg-slate-100/50 dark:hover:bg-slate-800/20'
                            }`}
                          >
                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-500/10 text-blue-600 rounded">Submitted</span>
                            <h5 className="font-bold text-xs mt-1.5 text-slate-800 dark:text-white">{p.title}</h5>
                            <p className="text-[10px] text-slate-500 mt-1 truncate">Teacher: {p.createdBy?.name || 'Staff'}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/40">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Reviewed History</h4>
                    {plans.filter(p => p.status !== 'submitted' && p.status !== 'under_review' && p.status !== 'draft').length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">No history.</p>
                    ) : (
                      <div className="space-y-2">
                        {plans.filter(p => p.status !== 'submitted' && p.status !== 'under_review' && p.status !== 'draft').map(p => (
                          <div 
                            key={p._id}
                            onClick={() => setSelectedPlanId(p._id)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                              selectedPlanId === p._id 
                                ? 'bg-brand-500/5 border-brand-500/30' 
                                : 'bg-slate-50 dark:bg-slate-900/25 border-transparent hover:bg-slate-100/50'
                            }`}
                          >
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${getStatusBadgeClass(p.status)}`}>
                              {p.status}
                            </span>
                            <h5 className="font-bold text-xs mt-1.5 text-slate-800 dark:text-white truncate">{p.title}</h5>
                            <p className="text-[10px] text-slate-500 mt-1 truncate">Month: {p.month} • By: {p.createdBy?.name || 'Staff'}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Detailed Plan Inspection Panel */}
              {currentSelectedPlan && (
              <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-205/50 dark:border-slate-800/15 flex flex-col max-h-[75vh]">
                  <div className="flex flex-col h-full overflow-y-auto space-y-5 pr-1">
                    <div className="flex justify-between items-start border-b border-slate-105 dark:border-slate-800/30 pb-3 flex-wrap gap-2">
                      <div>
                        <span className={`text-[10px] font-black uppercase rounded-lg px-2.5 py-0.5 ${getStatusBadgeClass(currentSelectedPlan.status)}`}>
                          Status: {currentSelectedPlan.status ? currentSelectedPlan.status.replace('_', ' ') : ''}
                        </span>
                        <h2 className="text-lg font-black text-slate-800 dark:text-white mt-2">{currentSelectedPlan.title}</h2>
                        <p className="text-xs text-slate-500 mt-1">
                          Theme: {currentSelectedPlan.themeName} • Target Month: {currentSelectedPlan.month} ({currentSelectedPlan.academicYear})
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Submitted by Teacher: <span className="font-bold text-slate-700 dark:text-slate-300">{currentSelectedPlan.createdBy?.name || 'Teacher'}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedPlanId(null)}
                        className="text-slate-400 hover:text-slate-655"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div>
                        <h4 className="font-bold text-slate-450 uppercase tracking-wider mb-1">Learning Objectives</h4>
                        <ul className="list-disc list-inside space-y-1 text-slate-655 dark:text-slate-350">
                          {currentSelectedPlan.learningObjectives?.map((obj, i) => (
                            <li key={i}>{obj}</li>
                          )) || <li>No objectives logged</li>}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-450 uppercase tracking-wider mb-1.5">Weekly Outline</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {Object.keys(currentSelectedPlan.weeklyBreakdown || {}).map((weekKey, i) => (
                            <div key={i} className="p-3 bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/40 rounded-xl">
                              <span className="font-bold text-brand-500 capitalize">{weekKey.replace('week', 'Week ')}</span>
                              <p className="mt-1 text-slate-600 dark:text-slate-350 leading-relaxed">
                                {currentSelectedPlan.weeklyBreakdown[weekKey] || 'No timeline details entered'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {currentSelectedPlan.notes && (
                        <div>
                          <h4 className="font-bold text-slate-450 uppercase tracking-wider mb-1">Preparational Notes</h4>
                          <p className="text-slate-605 dark:text-slate-350 leading-relaxed bg-slate-50 dark:bg-slate-900/20 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40">
                            {currentSelectedPlan.notes}
                          </p>
                        </div>
                      )}

                      {/* AI Copilot Suggestions Widget */}
                      <div className="p-4 bg-brand-500/[0.02] border border-brand-500/10 rounded-2xl space-y-2">
                        <h4 className="font-bold text-brand-600 flex items-center gap-1.5">
                          <AlertCircle className="h-4 w-4" /> AI Copilot Review Insights
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                          This plan covers <span className="font-bold text-slate-700 dark:text-slate-300">Cognitive development</span> and sensory arts effectively. Suggest adding one LKG gross motor outdoor game to week 3 to balance play objectives.
                        </p>
                      </div>

                      {/* Review Logs Timeline */}
                      {currentSelectedPlan.reviewHistory && currentSelectedPlan.reviewHistory.length > 0 && (
                        <div className="border-t border-slate-100 dark:border-slate-800/40 pt-4 space-y-3">
                          <h4 className="font-bold text-slate-450 uppercase tracking-wider mb-1">Review Comments Logs</h4>
                          <div className="space-y-2.5">
                            {currentSelectedPlan.reviewHistory.map((hist, i) => (
                              <div key={i} className="p-3 bg-slate-100/40 dark:bg-slate-905/30 border border-slate-150/40 dark:border-slate-800/25 rounded-xl text-[11px]">
                                <div className="flex justify-between items-center text-[10px] text-slate-450 font-bold mb-1">
                                  <span>Reviewer: {hist.reviewer?.name || 'Coordinator Office'} ({hist.status})</span>
                                  <span>{new Date(hist.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="italic text-slate-600 dark:text-slate-400">"{hist.feedback || 'No commentary entered'}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Drawer Actions */}
                    <div className="border-t border-slate-105 dark:border-slate-800/35 pt-4 space-y-3 flex-shrink-0">
                      {currentSelectedPlan.status === 'submitted' ? (
                        <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block mb-0.5">Curriculum Review Required</span>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              Before you can approve, reject, or request revisions on this plan, you need to transition it to "Under Review".
                            </p>
                          </div>
                          <button
                            onClick={() => handleReviewAction(currentSelectedPlan._id, 'review')}
                            disabled={submittingReview}
                            className="px-5 py-2.5 text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-md shadow-brand-500/15 flex items-center justify-center whitespace-nowrap self-start md:self-auto transition-all"
                          >
                            {submittingReview ? 'Starting Review...' : 'Start Review'}
                          </button>
                        </div>
                      ) : (
                        <>
                          <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider">Review Comments & Feedback</label>
                          <textarea
                            value={reviewFeedback}
                            onChange={(e) => setReviewFeedback(e.target.value)}
                            placeholder="Type review notes, required revisions comments, or validation summary here..."
                            rows={3}
                            className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 font-sans text-slate-800 dark:text-white focus:outline-none"
                          />
                          <div className="flex justify-end items-center space-x-2">
                            <button
                              onClick={() => handleReviewAction(currentSelectedPlan._id, 'reject')}
                              disabled={submittingReview}
                              className="px-3.5 py-2 text-xs font-bold bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-xl border border-rose-500/15"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleReviewAction(currentSelectedPlan._id, 'revision')}
                              disabled={submittingReview}
                              className="px-3.5 py-2 text-xs font-bold bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 rounded-xl border border-amber-500/15"
                            >
                              Request Changes
                            </button>
                            <button
                              onClick={() => handleReviewAction(currentSelectedPlan._id, 'approve')}
                              disabled={submittingReview}
                              className="px-5 py-2 text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-md shadow-brand-500/15"
                            >
                              Approve Plan
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
              </div>
              )}
            </div>
          )}
          {/* TAB 3: ACADEMIC CALENDAR */}
          {activeTab === 'calendar' && (
            <div className="space-y-6 animate-fade-in text-left">
              {/* Header and Classroom Filter */}
              <div className="glass-card p-5 rounded-2xl border border-slate-205/50 dark:border-slate-800/15 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => setCalendarDate(new Date(calendarYear, calendarMonthIdx - 1, 15))}
                    className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 text-slate-700 dark:text-white" />
                  </button>
                  <h3 className="font-extrabold text-sm text-slate-850 dark:text-white font-sans min-w-32 text-center">
                    {monthNames[calendarMonthIdx]} {calendarYear}
                  </h3>
                  <button 
                    onClick={() => setCalendarDate(new Date(calendarYear, calendarMonthIdx + 1, 15))}
                    className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    <ChevronRight className="h-4 w-4 text-slate-700 dark:text-white" />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500 font-bold">Filter Classroom:</span>
                  <select
                    value={calendarClassroomFilter}
                    onChange={(e) => setCalendarClassroomFilter(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value="All">All Classrooms</option>
                    <option value="Nursery-A">Nursery-A</option>
                    <option value="Kindergarten-B">Kindergarten-B</option>
                    <option value="Toddlers">Toddlers</option>
                  </select>

                  <button
                    onClick={() => setCreatingCalendarEvent(true)}
                    className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-1.5 px-3 rounded-xl text-xs flex items-center shadow-md transition-all font-sans"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Event
                  </button>
                </div>
              </div>

              {/* Month calendar grid */}
              <div className="grid grid-cols-7 gap-2">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                  <div key={day} className="text-center font-bold text-[10px] text-slate-400 uppercase py-1 tracking-wider">
                    {day.slice(0, 3)}
                  </div>
                ))}

                {calendarDays.map((cDay, idx) => {
                  const dayItems = getDayItems(cDay.dateString);
                  return (
                    <div 
                      key={idx} 
                      className={`min-h-28 p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                        cDay.isCurrentMonth
                          ? 'bg-white dark:bg-slate-900 border-slate-150/40 dark:border-slate-800/40'
                          : 'bg-slate-50/50 dark:bg-slate-950/20 border-transparent opacity-45'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`text-[11px] font-bold font-sans ${cDay.isCurrentMonth ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
                          {cDay.dayNum}
                        </span>
                        {dayItems.length > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                        )}
                      </div>

                      {/* Items lists inside calendar day cell */}
                      <div className="flex-1 mt-1.5 space-y-1 overflow-y-auto max-h-20 no-scrollbar">
                        {dayItems.map((item, key) => (
                          <div 
                            key={key}
                          onClick={() => {
                              if (item.type === 'lesson') {
                                setSelectedPlanId(item.raw.curriculumRef || item.id);
                                setActiveTab('reviews');
                              } else {
                                setSelectedCalendarEvent(item);
                              }
                            }}
                            className={`p-1 text-[9px] font-bold rounded-lg truncate text-left border cursor-pointer ${
                              item.type === 'lesson'
                                ? item.status === 'approved'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/5 dark:text-emerald-400 border-emerald-500/15'
                                  : 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/5 dark:text-blue-400 border-blue-500/15'
                                : 'bg-purple-500/10 text-purple-650 dark:bg-purple-500/5 dark:text-purple-400 border-purple-500/15'
                            }`}
                          >
                            {item.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: TEACHER PERFORMANCE */}
          {activeTab === 'performance' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="glass-card p-6 rounded-2xl border border-slate-205/50 dark:border-slate-800/15">
                <h3 className="font-bold text-base text-slate-850 dark:text-white flex items-center mb-2">
                  <UserCheck className="h-5 w-5 mr-2 text-brand-500" /> Teacher Operations Scorecards
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 mb-6">
                  Verify compliance scores, lesson planner timelines submissions, attendance logs completion, and parent feedbacks.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(dashboardStats?.teacherPerformance || [
                    { _id: 'user_teach_1', name: 'Priya Patel', classroom: 'Nursery-A', plansCreated: 5, plansApproved: 4, performanceScore: 92 },
                    { _id: 'user_teach_2', name: 'Sneha Reddy', classroom: 'Kindergarten-B', plansCreated: 3, plansApproved: 2, performanceScore: 88 }
                  ]).map((t) => {
                    const complianceStatus = t.performanceScore >= 90 ? 'Compliant' : 'Needs Review';
                    const statusColor = t.performanceScore >= 90 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600';
                    return (
                      <div 
                        key={t._id}
                        onClick={() => setViewingTeacher(t)}
                        className="p-5 rounded-2xl border border-slate-150/40 dark:border-slate-800/40 bg-white dark:bg-slate-900 cursor-pointer hover:shadow-md transform hover:-translate-y-0.5 transition-all space-y-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">{t.name}</h4>
                            <p className="text-xs text-slate-400 mt-0.5">Assigned Class: {t.classroom}</p>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                            {complianceStatus}
                          </span>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center text-slate-500">
                            <span>Syllabus Submissions</span>
                            <span className="font-bold text-slate-850 dark:text-slate-200">{t.plansApproved} Approved / {t.plansCreated} Total</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-500">
                            <span>Daily Attendance Logs</span>
                            <span className="font-bold text-slate-855 dark:text-slate-200">100% Rate</span>
                          </div>
                          
                          <div className="pt-2">
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase mb-1">
                              <span>Overall Compliance Index</span>
                              <span className="text-brand-500 font-extrabold">{t.performanceScore}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div className="bg-brand-500 h-full rounded-full" style={{ width: `${t.performanceScore}%` }}></div>
                            </div>
                          </div>
                        </div>

                        <div className="text-[10px] text-brand-500 font-bold hover:underline flex items-center justify-end">
                          View Performance Details <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CLASSROOM NOTICES */}
          {activeTab === 'notices' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Composer Form */}
                <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-205/50 dark:border-slate-800/15">
                  <h3 className="font-bold text-base text-slate-850 dark:text-white flex items-center mb-2">
                    <Megaphone className="h-5 w-5 mr-2 text-brand-500" /> Classroom Notices Broadcaster
                  </h3>
                  <p className="text-slate-505 dark:text-slate-400 text-xs mt-0.5 mb-6">
                    Compose announcements to broadcast to specific class parents, teachers, or the whole school branch.
                  </p>

                  {noticeFeedback && (
                    <div className={`p-4 rounded-xl text-xs font-semibold mb-4 border ${
                      noticeFeedback.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/15 text-emerald-600 dark:bg-emerald-950/20'
                        : 'bg-red-500/10 border-red-500/15 text-red-650 dark:bg-red-950/20'
                    }`}>
                      {noticeFeedback.text}
                    </div>
                  )}

                  <form onSubmit={handlePostNotice} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Notice Title</label>
                      <input
                        type="text"
                        required
                        value={noticeTitle}
                        onChange={(e) => setNoticeTitle(e.target.value)}
                        placeholder="e.g. Term end assessments schedule"
                        className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans text-slate-800 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Target Audience</label>
                        <select
                          value={targetClass}
                          onChange={(e) => setTargetClass(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl text-xs glass-input font-sans text-slate-800 dark:text-white focus:outline-none"
                        >
                          <option value="All">All Parents & Teachers</option>
                          <option value="Nursery-A">Nursery-A parents</option>
                          <option value="Kindergarten-B">Kindergarten-B parents</option>
                          <option value="Toddlers">Toddlers parents</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Notice Category</label>
                        <select
                          value={noticeCategory}
                          onChange={(e) => setNoticeCategory(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl text-xs glass-input font-sans text-slate-800 dark:text-white focus:outline-none"
                        >
                          <option value="general">General Announcement</option>
                          <option value="holiday">Holiday/Closure alert</option>
                          <option value="event">Event announcement (PTM/Excursion)</option>
                          <option value="emergency">Emergency updates</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Announcement Content Details</label>
                      <textarea
                        required
                        value={noticeContent}
                        onChange={(e) => setNoticeContent(e.target.value)}
                        placeholder="Compose details regarding syllabus targets, activities logistics, supplies changes, or meeting coordination notes..."
                        rows={5}
                        className="w-full px-4 py-2.5 rounded-xl text-xs glass-input font-sans text-slate-800 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={submittingNotice}
                        className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/25 transition-all"
                      >
                        {submittingNotice ? 'Broadcasting...' : 'Broadcast Notice Now'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Archive List Panel */}
                <div className="glass-card p-6 rounded-2xl border border-slate-205/50 dark:border-slate-800/15 flex flex-col max-h-[75vh]">
                  <h3 className="font-extrabold text-sm text-slate-850 dark:text-white mb-4">Broadcast History</h3>
                  <div className="space-y-4 overflow-y-auto flex-1 pr-1">
                    {notices.length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-12">No notices archived.</p>
                    ) : (
                      notices.map((n) => (
                        <div key={n._id} className="p-3 bg-slate-50 dark:bg-slate-900/25 border border-slate-100 dark:border-slate-800/40 rounded-xl space-y-1.5 text-xs text-left">
                          <h5 className="font-bold text-slate-800 dark:text-white truncate">{n.title}</h5>
                          <p className="text-[11px] text-slate-500 leading-normal">{n.content}</p>
                          <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono font-medium pt-1">
                            <span>Audience: {n.targetClassroom}</span>
                            <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: REPORTS & ANALYTICS */}
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-fade-in text-left">
              {/* Filters bar */}
              <div className="glass-card p-5 rounded-2xl border border-slate-205/50 dark:border-slate-800/15 flex flex-wrap items-center gap-4">
                <span className="text-xs font-bold text-slate-455">Filter Analytics:</span>
                <select className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-xs rounded-xl text-slate-800 dark:text-white focus:outline-none">
                  <option value="all">All Grades</option>
                  <option value="nursery">Nursery Only</option>
                  <option value="lkg">LKG (Junior)</option>
                  <option value="ukg">UKG (Senior)</option>
                </select>
                <select className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-xs rounded-xl text-slate-800 dark:text-white focus:outline-none">
                  <option value="june">June 2026</option>
                  <option value="july">July 2026</option>
                  <option value="aug">August 2026</option>
                </select>
              </div>

              {/* Chart panels grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-2xl border border-slate-205/50 dark:border-slate-800/15 flex flex-col">
                  <h3 className="font-bold text-sm text-slate-850 dark:text-white mb-4">Curriculum Plans Review Throughput</h3>
                  <div className="flex-1 min-h-[250px]">
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={analyticsBarData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <Tooltip />
                        <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                        <Bar dataKey="Approved" stackId="a" fill="#10B981" />
                        <Bar dataKey="Submitted" stackId="a" fill="#3B82F6" />
                        <Bar dataKey="Draft" stackId="a" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-slate-205/50 dark:border-slate-800/15 flex flex-col">
                  <h3 className="font-bold text-sm text-slate-850 dark:text-white mb-4">Parent Escalations Category Breakdown</h3>
                  <div className="flex-1 min-h-[250px] flex flex-col sm:flex-row items-center justify-around">
                    <div className="w-full sm:w-1/2 min-h-[200px]">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={analyticsPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {analyticsPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="text-xs space-y-1.5 flex-1 w-full text-left pl-4">
                      {analyticsPieData.map((entry, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></span>
                          <span className="truncate text-slate-655 dark:text-slate-350">{entry.name}: {entry.value} Cases</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-slate-205/50 dark:border-slate-800/15 flex flex-col lg:col-span-2">
                  <h3 className="font-bold text-sm text-slate-850 dark:text-white mb-4">Average Compliance Index Trend</h3>
                  <div className="flex-1 min-h-[250px]">
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={complianceTrendData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                        <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[80, 100]} />
                        <Tooltip />
                        <Area type="monotone" dataKey="compliance" stroke="#8d44ff" fill="rgba(141, 68, 255, 0.08)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: PORTAL SETTINGS */}
          {activeTab === 'settings' && (
            <div className="flex items-center justify-center py-24 animate-fade-in">
              <div className="text-center space-y-3">
                <Settings className="h-10 w-10 text-brand-500 mx-auto" />
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">Account & Settings</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                  Manage your profile, change your password, and configure notification preferences.
                </p>
                <a
                  href="/settings"
                  onClick={(e) => { e.preventDefault(); window.location.href = '/settings'; }}
                  className="inline-block mt-2 bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md transition-all"
                >
                  Open Settings
                </a>
              </div>
            </div>
          )}
        </>
      )}

      {/* POPUP MODAL: Call Simulator */}
      {simulatingCall && callingEscalation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-850 rounded-3xl shadow-2xl p-6 text-center space-y-6 animate-scale-up text-white">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-black text-brand-400 tracking-widest block">Coordinator Call Desk</span>
              <h3 className="text-lg font-black">{callingEscalation.parentName}</h3>
              <span className="text-xs text-slate-400 block mt-0.5">Calling Parent for Student: {callingEscalation.studentName}</span>
              <span className="text-xs text-slate-500 font-mono block mt-0.5">{callingEscalation.contactNumber || '+91 98765 43214'}</span>
            </div>

            <div className="flex justify-center items-center py-4">
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/30">
                <Phone className={`h-8 w-8 ${callStatus === 'Connecting...' ? 'animate-bounce' : 'animate-pulse'}`} />
                {callStatus === 'Connected' && (
                  <span className="absolute inset-0 rounded-full border border-brand-500 animate-ping"></span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <span className={`text-xs font-bold ${callStatus === 'Connected' ? 'text-emerald-400' : 'text-amber-450'}`}>
                {callStatus}
              </span>
              {callStatus === 'Connected' && (
                <span className="text-xs text-slate-400 block font-mono">
                  Duration: {Math.floor(callTimer / 60)}:{(callTimer % 60).toString().padStart(2, '0')}
                </span>
              )}
            </div>

            {callStatus === 'Connected' && (
              <div className="p-3.5 bg-slate-850/60 rounded-2xl border border-slate-800 text-[10px] text-slate-400 font-sans text-left space-y-1">
                <span className="font-bold text-white uppercase block">Call Simulator Active</span>
                <span>Connecting coordinator audio line to parental channel... Discussion points logged dynamically.</span>
              </div>
            )}

            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={handleEndCallSimulation}
                className="w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-all shadow-md"
              >
                <PhoneOff className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Meeting Scheduler */}
      {schedulingMeeting && meetingEscalation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl shadow-2xl p-6 text-left space-y-4 animate-scale-up text-slate-800 dark:text-white">
            <div className="flex justify-between items-center pb-2 border-b border-slate-105 dark:border-slate-800/40">
              <h3 className="font-extrabold text-sm font-sans">
                Schedule Parent-Teacher Conference (Case: {meetingEscalation.caseId})
              </h3>
              <button
                type="button"
                onClick={() => {
                  setSchedulingMeeting(false);
                  setMeetingEscalation(null);
                }}
                className="text-slate-405 hover:text-slate-655"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={executeMeetingSchedule} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Meeting Date</label>
                  <input
                    type="date"
                    required
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-sans focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Meeting Time</label>
                  <input
                    type="text"
                    required
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    placeholder="e.g. 10:00 AM"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-sans focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Conference Agenda & Target</label>
                <textarea
                  required
                  value={meetingAgenda}
                  onChange={(e) => setMeetingAgenda(e.target.value)}
                  placeholder="e.g. Discuss speech evaluation timeline and specialist referrals options..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-sans focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-105 dark:border-slate-800/40 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setSchedulingMeeting(false);
                    setMeetingEscalation(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/60 rounded-xl font-bold font-sans text-slate-600 dark:text-slate-350"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold shadow-md shadow-brand-500/10 font-sans"
                >
                  Confirm & Send Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Editing Internal Notes */}
      {editingNotesEscalation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl shadow-2xl p-6 text-left space-y-4 animate-scale-up text-slate-800 dark:text-white">
            <div className="flex justify-between items-center pb-2 border-b border-slate-105 dark:border-slate-800/40">
              <h3 className="font-extrabold text-sm font-sans">
                Internal Case Notes (Case: {editingNotesEscalation.caseId})
              </h3>
              <button
                type="button"
                onClick={() => setEditingNotesEscalation(null)}
                className="text-slate-405 hover:text-slate-655"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Coordinator Private Commentary</label>
                <textarea
                  value={internalNotesText}
                  onChange={(e) => setInternalNotesText(e.target.value)}
                  placeholder="Notes visible exclusively to school coordinators and admin staff. Detail parent context, allergy severity details, or speech referral statuses..."
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 font-sans focus:outline-none text-slate-800 dark:text-white"
                />
              </div>

              <div className="pt-2 border-t border-slate-105 dark:border-slate-800/40 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingNotesEscalation(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/60 rounded-xl font-bold font-sans text-slate-655"
                >
                  Cancel
                </button>
                <button
                  onClick={saveInternalNotes}
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold shadow-md shadow-brand-500/10 font-sans"
                >
                  Save Internal Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Calendar Event Detail */}
      {selectedCalendarEvent && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedCalendarEvent(null); }}
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden">
            {/* Colored header strip */}
            <div className={`px-6 py-5 flex items-center justify-between ${
              (selectedCalendarEvent.raw?.type || selectedCalendarEvent.type) === 'PTM' ? 'bg-blue-500' :
              (selectedCalendarEvent.raw?.type || selectedCalendarEvent.type) === 'Meeting' ? 'bg-violet-500' :
              (selectedCalendarEvent.raw?.type || selectedCalendarEvent.type) === 'Holiday' ? 'bg-emerald-500' :
              'bg-brand-500'
            }`}>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-xl p-2">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-xs font-medium uppercase tracking-widest">
                    {selectedCalendarEvent.raw?.type || selectedCalendarEvent.type || 'Event'}
                  </p>
                  <h2 className="text-white font-extrabold text-sm leading-tight mt-0.5">
                    {selectedCalendarEvent.raw?.title || selectedCalendarEvent.title}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setSelectedCalendarEvent(null)}
                className="bg-white/20 hover:bg-white/30 rounded-full p-1.5 text-white transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                  <p className="text-slate-800 dark:text-white font-bold text-sm">
                    {selectedCalendarEvent.raw?.date || '—'}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Time</p>
                  <p className="text-slate-800 dark:text-white font-bold text-sm">
                    {selectedCalendarEvent.raw?.time || selectedCalendarEvent.time || 'All Day'}
                  </p>
                </div>
              </div>

              {(selectedCalendarEvent.raw?.desc || selectedCalendarEvent.desc) && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Details</p>
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                    {selectedCalendarEvent.raw?.desc || selectedCalendarEvent.desc}
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 pb-5">
              <button
                onClick={() => setSelectedCalendarEvent(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-xl font-bold text-sm transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Calendar Event Detail */}
      {selectedCalendarEvent && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedCalendarEvent(null)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl shadow-2xl p-6 text-left space-y-4 animate-scale-up text-slate-800 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start pb-3 border-b border-slate-105 dark:border-slate-800/40">
              <div>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg inline-block mb-2 ${
                  selectedCalendarEvent.type === 'Holiday' ? 'bg-rose-500/10 text-rose-500' :
                  selectedCalendarEvent.type === 'PTM' ? 'bg-blue-500/10 text-blue-600' :
                  selectedCalendarEvent.type === 'Meeting' ? 'bg-amber-500/10 text-amber-600' :
                  'bg-brand-500/10 text-brand-600'
                }`}>
                  {selectedCalendarEvent.type}
                </span>
                <h3 className="font-extrabold text-base font-sans leading-snug">{selectedCalendarEvent.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCalendarEvent(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 ml-3 mt-1 flex-shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Event Info */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <CalendarDays className="h-4 w-4 text-brand-500" />
                  <span className="font-semibold">{selectedCalendarEvent.date}</span>
                </div>
                {selectedCalendarEvent.time && (
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Clock className="h-4 w-4 text-brand-500" />
                    <span className="font-semibold">{selectedCalendarEvent.time}</span>
                  </div>
                )}
              </div>

              {selectedCalendarEvent.desc && (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/40 rounded-2xl text-slate-600 dark:text-slate-350 leading-relaxed">
                  {selectedCalendarEvent.desc}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-slate-105 dark:border-slate-800/40 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setCustomEvents(prev => prev.filter(ev => ev.id !== selectedCalendarEvent.id));
                  setSelectedCalendarEvent(null);
                }}
                className="px-3.5 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-xl font-bold text-xs transition-all border border-rose-500/15 flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Event
              </button>
              <button
                type="button"
                onClick={() => setSelectedCalendarEvent(null)}
                className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold text-xs shadow-md shadow-brand-500/10 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Calendar Event Composer */}

      {creatingCalendarEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl shadow-2xl p-6 text-left space-y-4 animate-scale-up text-slate-800 dark:text-white">
            <div className="flex justify-between items-center pb-2 border-b border-slate-105 dark:border-slate-800/40">
              <h3 className="font-extrabold text-sm font-sans flex items-center gap-1.5">
                <LucideCalendar className="h-4.5 w-4.5 text-brand-500" /> Add Coordination Event
              </h3>
              <button
                type="button"
                onClick={() => setCreatingCalendarEvent(false)}
                className="text-slate-405 hover:text-slate-655"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCalendarEvent} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={calendarEventTitle}
                  onChange={(e) => setCalendarEventTitle(e.target.value)}
                  placeholder="e.g. Nursery-A Parent Classroom visit"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-205 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Event Type</label>
                  <select
                    value={calendarEventType}
                    onChange={(e) => setCalendarEventType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-205 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value="PTM">PTM Conference</option>
                    <option value="Meeting">Coordinator Meeting</option>
                    <option value="Holiday">School Holiday</option>
                    <option value="Coordination">Curriculum Review Deadline</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={calendarEventDate}
                    onChange={(e) => setCalendarEventDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-205 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Time Schedule</label>
                <input
                  type="text"
                  value={calendarEventTime}
                  onChange={(e) => setCalendarEventTime(e.target.value)}
                  placeholder="e.g. 10:00 AM - 12:00 PM, or All Day"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-205 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  value={calendarEventDesc}
                  onChange={(e) => setCalendarEventDesc(e.target.value)}
                  placeholder="Provide schedule details or logistics instructions..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-205 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-105 dark:border-slate-800/40 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCreatingCalendarEvent(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/60 rounded-xl font-bold font-sans text-slate-655"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold shadow-md shadow-brand-500/10 font-sans"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Teacher Performance Details */}
      {viewingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl shadow-2xl p-6 text-left space-y-5 animate-scale-up text-slate-800 dark:text-white">
            <div className="flex justify-between items-center pb-2 border-b border-slate-105 dark:border-slate-800/40">
              <h3 className="font-extrabold text-sm font-sans flex items-center gap-1.5">
                <Shield className="h-4.5 w-4.5 text-brand-500" /> Detailed Compliance Scorecard: {viewingTeacher.name}
              </h3>
              <button
                type="button"
                onClick={() => setViewingTeacher(null)}
                className="text-slate-405 hover:text-slate-655"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs leading-normal">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-905/30 border border-slate-105/30 dark:border-slate-800/20 rounded-2xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Classroom</span>
                  <span className="text-sm font-black text-slate-800 dark:text-white block mt-1">{viewingTeacher.classroom}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-905/30 border border-slate-105/30 dark:border-slate-800/20 rounded-2xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Overall Compliance Index</span>
                  <span className="text-sm font-black text-brand-500 block mt-1">{viewingTeacher.performanceScore}%</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Administrative Metrics Audits</span>
                
                <div className="space-y-2 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/30">
                  <div className="flex justify-between items-center text-[11px] text-slate-600 dark:text-slate-300">
                    <span>Curriculum Plan Submissions Timeline</span>
                    <span className="font-bold text-slate-850 dark:text-white">On-Time (100%)</span>
                  </div>
                  <div className="w-full bg-slate-150 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }}></div>
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-600 dark:text-slate-300 pt-1.5">
                    <span>Daily Attendance Completion Rate</span>
                    <span className="font-bold text-slate-850 dark:text-white">Compliant (100%)</span>
                  </div>
                  <div className="w-full bg-slate-150 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }}></div>
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-600 dark:text-slate-300 pt-1.5">
                    <span>Parent Milestones Update Frequency</span>
                    <span className="font-bold text-slate-850 dark:text-white">Good ({viewingTeacher.performanceScore}%)</span>
                  </div>
                  <div className="w-full bg-slate-150 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-brand-500 h-full rounded-full" style={{ width: `${viewingTeacher.performanceScore}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Coordinator Handover Reviews</span>
                <p className="p-3.5 bg-brand-500/[0.02] border border-brand-500/10 rounded-2xl text-[11px] leading-relaxed text-slate-605 dark:text-slate-350 italic">
                  "Teacher {viewingTeacher.name} demonstrates excellent curriculum alignment. Weekly lesson objectives are detailed, and parent milestones are updated within 24 hours of activities completion. Attendance reports are submitted daily without omission."
                </p>
              </div>

              <div className="pt-2 border-t border-slate-105 dark:border-slate-800/40 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingTeacher(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/60 rounded-xl font-bold font-sans text-slate-600 dark:text-slate-350 transition-all"
                >
                  Close Audit Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CoordinatorPanel;
