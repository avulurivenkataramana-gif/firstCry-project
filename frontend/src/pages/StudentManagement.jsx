import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Baby, 
  Search, 
  ArrowLeft, 
  Phone, 
  MessageSquare, 
  Calendar, 
  Award, 
  Eye, 
  Plus, 
  Edit3, 
  Save, 
  Check, 
  X, 
  AlertCircle,
  FileText,
  Send,
  Loader2,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const StudentManagement = () => {
  const { user } = useAuth();
  
  // Guard access
  if (user?.role !== 'teacher' && user?.role !== 'admin') {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400 font-sans">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm text-left">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4 animate-pulse" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white text-center">Access Denied</h3>
          <p className="text-xs mt-1 text-slate-505 dark:text-slate-400 text-center">You do not have permissions to access the Student Management module.</p>
        </div>
      </div>
    );
  }

  // Lists state
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');

  // Selection & Details state
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [student, setStudent] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Tab 2 (Parent Info) - Message simulation
  const [parentMessage, setParentMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Tab 3 (Attendance) state
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [todayStatus, setTodayStatus] = useState('present');
  const [notifyParent, setNotifyParent] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedCalendarDateDetails, setSelectedCalendarDateDetails] = useState(null);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [editingStatus, setEditingStatus] = useState('present');

  const getLocalDateString = (d = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Tab 4 (Milestones) state
  const [milestones, setMilestones] = useState({
    'Cognitive Development': 80,
    'Gross Motor Skills': 80,
    'Sensory Play': 80,
    'Social-Emotional': 80,
    'Language & Communication': 80
  });
  const [teacherFeedback, setTeacherFeedback] = useState('');
  const [savingMilestones, setSavingMilestones] = useState(false);

  // Tab 5 (Observations) state
  const [newObs, setNewObs] = useState('');
  const [addingObs, setAddingObs] = useState(false);
  const [editingObsId, setEditingObsId] = useState(null);
  const [editObsContent, setEditObsContent] = useState('');

  // Tab 6 (Feedback History) state
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [newFeedbackText, setNewFeedbackText] = useState('');
  const [sendingFeedback, setSendingFeedback] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/parent/students');
      if (response.success && response.data) {
        setStudents(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudentDetail = async (id) => {
    setLoadingDetail(true);
    try {
      const response = await api.get(`/parent/students/${id}`);
      if (response.success && response.data) {
        const studData = response.data;
        setStudent(studData);
        
        // Fetch developmental milestone record if it exists
        const progressRes = await api.get('/parent/progress');
        if (progressRes.success && progressRes.data) {
          const record = progressRes.data.find(p => p.studentName === studData.name);
          if (record && record.skills) {
            const skillMap = {};
            record.skills.forEach(s => {
              skillMap[s.skillName] = s.score;
            });
            setMilestones({
              'Cognitive Development': skillMap['Cognitive Development'] || 80,
              'Gross Motor Skills': skillMap['Gross Motor Skills'] || 80,
              'Sensory Play': skillMap['Sensory Play'] || 80,
              'Social-Emotional': skillMap['Social-Emotional'] || 80,
              'Language & Communication': skillMap['Language & Communication'] || 80
            });
            setTeacherFeedback(record.teacherFeedback || '');
          }
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (selectedStudentId) {
      fetchStudentDetail(selectedStudentId);
      setActiveTab('overview');
    } else {
      setStudent(null);
    }
  }, [selectedStudentId]);

  // Fetch contextual tab data
  useEffect(() => {
    if (!student) return;

    if (activeTab === 'attendance') {
      fetchAttendance();
    } else if (activeTab === 'feedback') {
      fetchFeedbackHistory();
    }
  }, [activeTab, student]);

  const fetchAttendance = async () => {
    setLoadingAttendance(true);
    try {
      const response = await api.get(`/parent/attendance?studentName=${student.name}`);
      if (response.success && response.data) {
        setAttendanceRecords(response.data);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleSaveTodayAttendance = async (e) => {
    e.preventDefault();
    if (!student) return;
    setSavingAttendance(true);
    try {
      const response = await api.post('/parent/attendance', {
        studentName: student.name,
        classroom: student.classroom,
        date: getLocalDateString(),
        status: todayStatus,
        notifyParent: notifyParent
      });
      if (response.success) {
        showToast("Today's attendance saved successfully!", "success");
        setNotifyParent(false);
        fetchAttendance();
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleUpdateAttendance = async (id) => {
    try {
      const response = await api.put(`/parent/attendance/${id}`, {
        status: editingStatus
      });
      if (response.success) {
        showToast("Attendance record updated successfully!", "success");
        setEditingRecordId(null);
        fetchAttendance();
      }
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const getExtendedAttendanceStats = () => {
    if (attendanceRecords.length === 0) {
      return {
        rate: 100,
        present: 0,
        absent: 0,
        streak: 0,
        lastAbsentDate: 'None',
        workingDays: 0
      };
    }
    const present = attendanceRecords.filter(r => r.status === 'present').length;
    const absent = attendanceRecords.filter(r => r.status === 'absent').length;
    const rate = Math.round((present / attendanceRecords.length) * 100);
    
    const sorted = [...attendanceRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
    let streak = 0;
    for (const rec of sorted) {
      if (rec.status === 'present') {
        streak++;
      } else {
        break;
      }
    }
    
    const absents = attendanceRecords.filter(r => r.status === 'absent');
    const lastAbsent = absents.length > 0
      ? [...absents].sort((a, b) => new Date(b.date) - new Date(a.date))[0].date
      : 'None';

    return {
      rate,
      present,
      absent,
      streak,
      lastAbsentDate: lastAbsent,
      workingDays: attendanceRecords.length
    };
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(calendarMonth, calendarYear);
    const firstDay = getFirstDayOfMonth(calendarMonth, calendarYear);
    const days = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push({ key: `empty-${i}`, dayNum: null, dateStr: null });
    }
    
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ key: `day-${d}`, dayNum: d, dateStr });
    }
    
    return days;
  };

  const handlePrevMonth = () => {
    setCalendarMonth(prev => {
      if (prev === 0) {
        setCalendarYear(y => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setCalendarMonth(prev => {
      if (prev === 11) {
        setCalendarYear(y => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const getFilteredRecords = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return attendanceRecords.filter(rec => {
      const recDate = new Date(rec.date);
      recDate.setHours(0, 0, 0, 0);
      
      if (historyFilter === 'today') {
        return rec.date === getLocalDateString();
      } else if (historyFilter === 'week') {
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);
        return recDate >= oneWeekAgo;
      } else if (historyFilter === 'month') {
        const oneMonthAgo = new Date(today);
        oneMonthAgo.setDate(today.getDate() - 30);
        return recDate >= oneMonthAgo;
      } else if (historyFilter === 'custom') {
        if (!customStart && !customEnd) return true;
        let match = true;
        if (customStart) {
          match = match && rec.date >= customStart;
        }
        if (customEnd) {
          match = match && rec.date <= customEnd;
        }
        return match;
      }
      return true;
    });
  };

  const fetchFeedbackHistory = async () => {
    setLoadingHistory(true);
    try {
      // Parents receive feedback notifications. We fetch all notifications that are directed to this parent user
      const response = await api.get('/notifications');
      if (response.success && response.data) {
        const parentIdStr = student.parentId?._id || student.parentId;
        const list = response.data.filter(n => 
          n.type === 'feedback' && 
          (n.recipient === parentIdStr || (n.recipient && n.recipient._id === parentIdStr))
        );
        setFeedbackHistory(list);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

// Call parent functionality removed – only messaging remains


  // Tab Actions: Message Parent
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!parentMessage.trim()) return;

    setSendingMsg(true);
    try {
      const parentIdStr = student.parentId?._id || student.parentId;
      const response = await api.post('/notifications', {
        recipient: parentIdStr,
        title: `Message from Teacher: ${user.name}`,
        message: parentMessage,
        type: 'parent_message'
      });

      if (response.success) {
        showToast('Message sent to parent successfully!', 'success');
        setParentMessage('');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSendingMsg(false);
    }
  };

  // Tab Actions: Update Milestones
  const handleSaveMilestones = async (e) => {
    e.preventDefault();
    setSavingMilestones(true);
    try {
      const parentIdStr = student.parentId?._id || student.parentId;
      const payload = {
        studentName: student.name,
        parentId: parentIdStr,
        classroom: student.classroom,
        skills: Object.keys(milestones).map(key => ({
          skillName: key,
          score: milestones[key]
        })),
        teacherFeedback
      };

      const response = await api.post('/parent/progress', payload);
      if (response.success) {
        // Also trigger progress update notification
        await api.post('/notifications', {
          recipient: parentIdStr,
          title: 'Student Progress Updated',
          message: `Teacher ${user.name} has updated ${student.name}'s developmental milestones. Check the parent portal for details!`,
          type: 'progress'
        });

        showToast('Milestones and progress updated successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingMilestones(false);
    }
  };

  // Tab Actions: Add Observation
  const handleAddObservation = async (e) => {
    e.preventDefault();
    if (!newObs.trim()) return;

    setAddingObs(true);
    try {
      const response = await api.post(`/parent/students/${student._id}/observations`, {
        content: newObs
      });

      if (response.success) {
        showToast('Observation log added!', 'success');
        setNewObs('');
        fetchStudentDetail(student._id); // Refresh student observations
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setAddingObs(false);
    }
  };

  // Tab Actions: Update Observation
  const handleSaveEditObservation = async (obsId) => {
    if (!editObsContent.trim()) return;

    try {
      const response = await api.put(`/parent/students/${student._id}/observations/${obsId}`, {
        content: editObsContent
      });

      if (response.success) {
        showToast('Observation log updated!', 'success');
        setEditingObsId(null);
        setEditObsContent('');
        fetchStudentDetail(student._id); // Refresh
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Tab Actions: Send Feedback
  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!newFeedbackText.trim()) return;

    setSendingFeedback(true);
    try {
      const parentIdStr = student.parentId?._id || student.parentId;
      const response = await api.post('/notifications', {
        recipient: parentIdStr,
        title: 'New Feedback Report',
        message: newFeedbackText,
        type: 'feedback'
      });

      if (response.success) {
        showToast('Feedback submitted. Parent notified!', 'success');
        setNewFeedbackText('');
        fetchFeedbackHistory(); // Refresh list
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSendingFeedback(false);
    }
  };

  // Filters
  const classrooms = ['all', 'Nursery', 'LKG', 'UKG', 'Nursery-A', 'Kindergarten-B'];
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.admissionNumber.toLowerCase().includes(search.toLowerCase());
    
    // Normalize filters
    let matchesClass = true;
    if (classFilter !== 'all') {
      matchesClass = s.classroom.toLowerCase().startsWith(classFilter.toLowerCase());
    }
    return matchesSearch && matchesClass;
  });

  // Calculate attendance rate helper
  const getAttendanceStats = () => {
    if (attendanceRecords.length === 0) return { rate: 100, present: 0, absent: 0 };
    const present = attendanceRecords.filter(r => r.status === 'present').length;
    const absent = attendanceRecords.filter(r => r.status === 'absent').length;
    const rate = Math.round((present / attendanceRecords.length) * 100);
    return { rate, present, absent };
  };

  const attStats = getAttendanceStats();

  // Radar chart data preparation
  const chartData = Object.keys(milestones).map(key => ({
    subject: key.replace(' Development', '').replace(' Skills', '').replace(' & Communication', ''),
    score: milestones[key],
    fullMark: 100,
  }));

  return (
    <div className="space-y-6 pb-12 text-left">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-xl flex items-center space-x-3 border animate-slide-in ${
          toast.type === 'success' 
            ? 'bg-emerald-500 text-white border-emerald-600' 
            : 'bg-red-500 text-white border-red-600'
        }`}>
          <Check className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-bold font-sans">{toast.message}</span>
        </div>
      )}

      {/* 1. STUDENT DIRECTORY LIST VIEW */}
      {!student && (
        <div className="space-y-6 animate-fade-in font-sans">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white font-sans">Student Management</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-sans mt-0.5">
                Monitor student records, update development milestones, write observations, and manage parent communication.
              </p>
            </div>
          </div>

          {/* Search & Filter bar */}
          <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4 max-w-2xl">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or admission number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm glass-input font-sans"
              />
            </div>
            
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <label className="text-xs font-bold text-slate-400 uppercase whitespace-nowrap">Class:</label>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="rounded-xl py-2 px-3 text-xs glass-input font-sans bg-transparent dark:text-white capitalize"
              >
                {classrooms.map(c => (
                  <option key={c} value={c} className="dark:bg-slate-900">{c === 'all' ? 'All Classes' : c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Student Grid cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-44 glass-card rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="glass-card rounded-3xl p-16 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Baby className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">No students found</h3>
              <p className="text-slate-400 text-xs mt-1">
                Verify search filters or contact administrative office if a student is missing.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredStudents.map((stud) => (
                <div 
                  key={stud._id}
                  onClick={() => setSelectedStudentId(stud._id)}
                  className="glass-card p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/10 hover:border-brand-500/30 dark:hover:border-brand-500/20 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-11 h-11 rounded-full bg-brand-50 dark:bg-brand-950/40 border border-brand-200/50 dark:border-brand-900/30 flex items-center justify-center font-bold text-brand-600 dark:text-brand-400 text-base">
                        {stud.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800 dark:text-white leading-snug">{stud.name}</h4>
                        <span className="text-[10px] text-slate-450 dark:text-slate-400 block font-semibold">Adm: {stud.admissionNumber}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase bg-brand-500/10 text-brand-500 dark:text-brand-400">
                      {stud.classroom}
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/30 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-500 dark:text-slate-450">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Age & Gender</span>
                      <span className="text-slate-700 dark:text-slate-350">{stud.age} yrs • {stud.gender}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Parent Contact</span>
                      <span className="text-slate-700 dark:text-slate-350 truncate block">{stud.parentName}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 flex justify-end">
                    <button className="flex items-center space-x-1 text-xs font-bold text-brand-500 hover:text-brand-600">
                      <Eye className="h-4 w-4" /> <span>View Profile</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* 2. STUDENT DETAILED PROFILE VIEW */}
      {student && (
        <div className="space-y-6 animate-fade-in font-sans">
          
          {/* Back Action Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/30 pb-4">
            <button
              onClick={() => setSelectedStudentId(null)}
              className="flex items-center text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4.5 w-4.5 mr-2" /> Back to Student Directory
            </button>
            <div className="flex items-center space-x-3">
              <span className="text-xs font-semibold text-slate-400">Viewing student:</span>
              <span className="px-3 py-1 bg-brand-500 text-white font-extrabold text-xs rounded-xl shadow-sm">
                {student.name} ({student.classroom})
              </span>
            </div>
          </div>

          {/* Student Banner Stats */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-brand-500/20">
                {student.name.split(' ').map(n=>n[0]).join('')}
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-850 dark:text-white leading-tight">{student.name}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-505 dark:text-slate-400 font-semibold">
                  <span>Admission: {student.admissionNumber}</span>
                  <span>•</span>
                  <span>Class: {student.classroom}</span>
                  <span>•</span>
                  <span>Age: {student.age} Years</span>
                  <span>•</span>
                  <span>Gender: {student.gender}</span>
                </div>
              </div>
            </div>

            {/* Quick communication tools */}
            <div className="flex items-center space-x-2.5 w-full md:w-auto">
              <button 
                onClick={() => setActiveTab('parent')}
                className="flex-1 md:flex-none flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm transition-all"
              >
                <MessageSquare className="h-4 w-4 mr-1.5 text-brand-500" /> Send Message
              </button>
            </div>
          </div>

          {/* Profile Content Tabs list */}
          <div className="flex items-center space-x-1.5 border-b border-slate-200/60 dark:border-slate-800/40 pb-1.5 overflow-x-auto select-none">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'parent', label: 'Parent Information', icon: UserCheck },
              { id: 'attendance', label: 'Attendance logs', icon: Calendar },
              { id: 'milestones', label: 'Milestones Tracker', icon: Award },
              { id: 'observations', label: 'Teacher Observations', icon: FileText },
              { id: 'feedback', label: 'Feedback History', icon: MessageSquare }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold font-sans whitespace-nowrap transition-all flex items-center space-x-2 border ${
                    activeTab === tab.id
                      ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/10'
                      : 'bg-slate-105/50 hover:bg-slate-200/70 border-transparent dark:bg-slate-900/60 dark:hover:bg-slate-800/80 text-slate-550 dark:text-slate-400'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB DETAILED PANELS */}
          {loadingDetail ? (
            <div className="h-64 glass-card rounded-3xl animate-pulse flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-left">
                  
                  {/* Left Column: Key Stats */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Welcome overview */}
                    <div className="glass-card p-6 rounded-2xl border border-slate-205/50 dark:border-slate-800/15">
                      <h3 className="font-bold text-base text-slate-850 dark:text-white flex items-center">
                        Development Summary
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                        Review overall developmental score, current milestones achievement, and school behavior observation updates.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 rounded-2xl">
                          <span className="text-[10px] font-black text-slate-450 block uppercase">Attendance Rate</span>
                          <span className="text-xl font-black text-slate-800 dark:text-white mt-1 block">
                            {attendanceRecords.length > 0 ? `${attStats.rate}%` : '100%'}
                          </span>
                          <span className="text-[10px] text-slate-450 block mt-0.5">({attStats.present} present of {attendanceRecords.length || 0})</span>
                        </div>
                        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 rounded-2xl">
                          <span className="text-[10px] font-black text-slate-450 block uppercase">Milestones Avg</span>
                          <span className="text-xl font-black text-slate-800 dark:text-white mt-1 block">
                            {Math.round(Object.values(milestones).reduce((a, b) => a + b, 0) / 5)}%
                          </span>
                          <span className="text-[10px] text-slate-450 block mt-0.5">Across 5 learning domains</span>
                        </div>
                        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 rounded-2xl">
                          <span className="text-[10px] font-black text-slate-450 block uppercase">Observations Logged</span>
                          <span className="text-xl font-black text-slate-800 dark:text-white mt-1 block">
                            {student.observations?.length || 0}
                          </span>
                          <span className="text-[10px] text-slate-450 block mt-0.5">Recent: {student.observations?.length > 0 ? new Date(student.observations[student.observations.length - 1].date).toLocaleDateString() : 'None'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Developmental chart */}
                    <div className="glass-card p-6 rounded-2xl border border-slate-205/50 dark:border-slate-800/15">
                      <h3 className="font-bold text-base text-slate-850 dark:text-white flex items-center mb-4">
                        <Award className="h-5 w-5 mr-2 text-brand-500" /> Developmental Milestone Breakdown
                      </h3>
                      
                      <div className="h-64 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                            <XAxis dataKey="subject" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis domain={[0, 100]} stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip formatter={(value) => [`${value}%`, 'Score']} contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                            <Bar dataKey="score" fill="#6366f1" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Latest Observation & Summary */}
                  <div className="space-y-6">
                    
                    {/* Student Info Card */}
                    <div className="glass-card p-5 rounded-2xl border border-slate-205/50 dark:border-slate-800/15 space-y-4">
                      <h3 className="font-bold text-sm text-slate-850 dark:text-white uppercase tracking-wider">
                        Quick Details
                      </h3>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800/30 text-xs font-semibold space-y-3">
                        <div className="flex justify-between py-2">
                          <span className="text-slate-400">Father's Name</span>
                          <span className="text-slate-800 dark:text-white">{student.fatherName || 'Not Listed'}</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-slate-400">Primary Parent</span>
                          <span className="text-slate-800 dark:text-white">{student.parentName}</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-slate-400">Relationship</span>
                          <span className="text-slate-800 dark:text-white capitalize">{student.relationship}</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-slate-400">Email Address</span>
                          <span className="text-slate-800 dark:text-white font-mono">{student.parentEmail}</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-slate-400">Contact Number</span>
                          <span className="text-slate-800 dark:text-white">{student.contactNumber}</span>
                        </div>
                      </div>
                    </div>

                    {/* Latest observation snippet */}
                    <div className="glass-card p-5 rounded-2xl border border-slate-205/50 dark:border-slate-800/15">
                      <h3 className="font-bold text-sm text-slate-850 dark:text-white uppercase tracking-wider mb-3">
                        Latest Observation
                      </h3>
                      {student.observations && student.observations.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-xs text-slate-600 dark:text-slate-350 italic">
                            "{student.observations[student.observations.length - 1].content}"
                          </p>
                          <div className="text-[10px] text-slate-450 flex justify-between pt-2">
                            <span>Logged by: {student.observations[student.observations.length - 1].teacherName}</span>
                            <span>{new Date(student.observations[student.observations.length - 1].date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-450 italic">No observation logs written yet for this student.</p>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 2: PARENT INFORMATION */}
              {activeTab === 'parent' && (
                <div className="glass-card p-6 rounded-2xl border border-slate-205/50 dark:border-slate-800/15 animate-fade-in text-left max-w-3xl">
                  <h3 className="font-bold text-base text-slate-850 dark:text-white flex items-center mb-1">
                    Parent / Guardian Contact File
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 mb-6">
                    Access child registry parent records. Teachers are authorized to call or send direct updates.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Contact Details List */}
                    <div className="space-y-4 text-xs font-semibold">
                      <div className="p-4 bg-slate-50/60 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/40 rounded-2xl space-y-3.5">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Father's Name</span>
                          <span className="text-slate-800 dark:text-white font-extrabold">{student.fatherName || 'Not Listed'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Primary Contact (Guardian)</span>
                          <span className="text-slate-800 dark:text-white font-extrabold">{student.parentName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Relationship to Student</span>
                          <span className="text-slate-800 dark:text-white font-extrabold capitalize">{student.relationship}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Email Address</span>
                          <span className="text-slate-805 dark:text-white font-mono">{student.parentEmail}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Phone Contact</span>
                          <span className="text-slate-800 dark:text-white">{student.contactNumber}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick message form */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Send Quick Portal Message</h4>
                      
                      <form onSubmit={handleSendMessage} className="space-y-3">
                        <textarea
                          rows={4}
                          required
                          value={parentMessage}
                          onChange={(e) => setParentMessage(e.target.value)}
                          placeholder="Type an instant message update to send to parent's message inbox..."
                          className="w-full px-4 py-3 rounded-xl text-sm glass-input font-sans"
                        />
                        <button
                          type="submit"
                          disabled={sendingMsg || !parentMessage.trim()}
                          className="w-full flex items-center justify-center bg-brand-500 hover:bg-brand-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow shadow-brand-500/10"
                        >
                          {sendingMsg ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1.5" />}
                          Send Instant Message
                        </button>
                      </form>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 3: ATTENDANCE */}
              {activeTab === 'attendance' && (() => {
                const extStats = getExtendedAttendanceStats();
                const monthNames = [
                  'January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'
                ];
                return (
                  <div className="glass-card p-6 rounded-2xl border border-slate-205/50 dark:border-slate-800/15 animate-fade-in text-left max-w-4xl space-y-6">
                    
                    {/* Today's Attendance Box */}
                    <div className="bg-gradient-to-r from-brand-500/10 via-brand-600/5 to-transparent p-5 rounded-2xl border border-brand-500/25 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-black text-slate-800 dark:text-white font-sans">Mark Today's Attendance</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5 font-sans">
                            Date: {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-slate-505 dark:text-slate-400 font-bold font-sans">{student.name} • {student.classroom}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        {/* Status Selection Pills */}
                        <div className="flex items-center space-x-2.5">
                          <button
                            type="button"
                            onClick={() => setTodayStatus('present')}
                            className={`px-4.5 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-2 border ${
                              todayStatus === 'present'
                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/10'
                                : 'bg-white hover:bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300'
                            }`}
                          >
                            <span>🟢 Present</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setTodayStatus('absent')}
                            className={`px-4.5 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-2 border ${
                              todayStatus === 'absent'
                                ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/10'
                                : 'bg-white hover:bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300'
                            }`}
                          >
                            <span>🔴 Absent</span>
                          </button>
                        </div>

                        {/* Notify Parent Checkbox */}
                        <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-350 select-none font-sans">
                          <input
                            type="checkbox"
                            checked={notifyParent}
                            onChange={(e) => setNotifyParent(e.target.checked)}
                            className="rounded border-slate-300 text-brand-500 focus:ring-brand-500 h-4 w-4 accent-brand-500"
                          />
                          <span>Notify Parent via Portal Alert</span>
                        </label>

                        {/* Save Button */}
                        <button
                          type="button"
                          disabled={savingAttendance}
                          onClick={handleSaveTodayAttendance}
                          className="ml-auto flex items-center justify-center bg-brand-500 hover:bg-brand-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-extrabold px-5 py-2 rounded-xl text-xs shadow-md transition-all font-sans"
                        >
                          {savingAttendance ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}
                          Save Attendance
                        </button>
                      </div>
                    </div>

                    {/* Attendance Summary Grid */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-slate-405 uppercase tracking-wider font-sans">Attendance Summary</h4>
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800/40 rounded-2xl">
                          <span className="text-[10px] font-black text-slate-400 block uppercase font-sans">Attendance Rate</span>
                          <span className="text-lg font-black text-emerald-600 dark:text-emerald-450 mt-1 block font-sans">
                            {extStats.rate}%
                          </span>
                        </div>
                        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800/40 rounded-2xl">
                          <span className="text-[10px] font-black text-slate-400 block uppercase font-sans">Present Days</span>
                          <span className="text-lg font-black text-slate-800 dark:text-white mt-1 block font-sans">
                            {extStats.present}
                          </span>
                        </div>
                        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800/40 rounded-2xl">
                          <span className="text-[10px] font-black text-slate-400 block uppercase font-sans">Absent Days</span>
                          <span className="text-lg font-black text-rose-500 mt-1 block font-sans">
                            {extStats.absent}
                          </span>
                        </div>
                        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800/40 rounded-2xl">
                          <span className="text-[10px] font-black text-slate-400 block uppercase font-sans">Current Streak</span>
                          <span className="text-lg font-black text-brand-500 dark:text-brand-400 mt-1 block font-sans">
                            {extStats.streak} {extStats.streak === 1 ? 'day' : 'days'}
                          </span>
                        </div>
                        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800/40 rounded-2xl font-sans">
                          <span className="text-[10px] font-black text-slate-400 block uppercase">Last Absent Date</span>
                          <span className="text-xs font-black text-slate-700 dark:text-slate-300 mt-2 block font-mono">
                            {extStats.lastAbsentDate}
                          </span>
                        </div>
                        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800/40 rounded-2xl font-sans">
                          <span className="text-[10px] font-black text-slate-400 block uppercase">Total Working Days</span>
                          <span className="text-lg font-black text-slate-850 dark:text-white mt-1 block">
                            {extStats.workingDays}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Calendar and Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Calendar Grid card */}
                      <div className="md:col-span-2 p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 bg-slate-50/20 dark:bg-slate-900/20 font-sans">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                            {monthNames[calendarMonth]} {calendarYear}
                          </span>
                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={handlePrevMonth}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs"
                            >
                              &larr;
                            </button>
                            <button
                              type="button"
                              onClick={handleNextMonth}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs"
                            >
                              &rarr;
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-7 gap-2 text-center text-[10px] mt-4 font-bold">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-slate-400 dark:text-slate-500 uppercase tracking-wider py-1">{day}</div>
                          ))}
                          {renderCalendarDays().map((cell, idx) => {
                            if (!cell.dayNum) {
                              return <div key={`empty-${idx}`} className="h-9"></div>;
                            }
                            
                            const rec = attendanceRecords.find(r => r.date === cell.dateStr);
                            let cellStyle = "border-slate-100 dark:border-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50";
                            let statusDot = null;
                            const isWeekend = new Date(cell.dateStr.replace(/-/g, '/')).getDay() === 0 || new Date(cell.dateStr.replace(/-/g, '/')).getDay() === 6;

                            if (rec) {
                              if (rec.status === 'present') {
                                cellStyle = "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20";
                                statusDot = <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-500"></span>;
                              } else {
                                cellStyle = "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-450 hover:bg-rose-500/20";
                                statusDot = <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-rose-500"></span>;
                              }
                            } else if (isWeekend) {
                              cellStyle = "bg-slate-100/30 dark:bg-slate-800/20 border-transparent text-slate-400 dark:text-slate-600 cursor-not-allowed";
                            } else {
                              cellStyle = "border-dashed border-slate-200 dark:border-slate-800 text-slate-450 dark:text-slate-500 hover:border-brand-500/50";
                            }

                            const isSelected = selectedCalendarDateDetails?.dateStr === cell.dateStr;
                            if (isSelected) {
                              cellStyle += " ring-2 ring-brand-500 dark:ring-brand-400 border-transparent";
                            }

                            return (
                              <button
                                key={cell.key}
                                type="button"
                                onClick={() => {
                                  if (rec) {
                                    setSelectedCalendarDateDetails({
                                      dateStr: cell.dateStr,
                                      hasRecord: true,
                                      status: rec.status,
                                      markedBy: rec.markedBy,
                                      updatedAt: rec.updatedAt,
                                      recordId: rec._id
                                    });
                                  } else {
                                    setSelectedCalendarDateDetails({
                                      dateStr: cell.dateStr,
                                      hasRecord: false,
                                      isWeekend
                                    });
                                  }
                                }}
                                className={`relative h-9 flex flex-col items-center justify-center rounded-xl border text-xs font-black transition-all ${cellStyle}`}
                              >
                                <span>{cell.dayNum}</span>
                                {statusDot}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Day details card */}
                      <div className="p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 bg-slate-50/20 dark:bg-slate-900/20 flex flex-col justify-between font-sans">
                        <div>
                          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Day Details</h5>
                          {selectedCalendarDateDetails ? (
                            <div className="space-y-3.5 text-xs font-semibold animate-fade-in">
                              <div>
                                <span className="text-[10px] text-slate-450 uppercase block font-bold">Selected Date</span>
                                <span className="text-slate-800 dark:text-white font-extrabold mt-0.5 block">
                                  {new Date(selectedCalendarDateDetails.dateStr.replace(/-/g, '/')).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                              </div>

                              {selectedCalendarDateDetails.hasRecord ? (
                                <>
                                  <div>
                                    <span className="text-[10px] text-slate-450 uppercase block font-bold">Status</span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase mt-1 ${
                                      selectedCalendarDateDetails.status === 'present'
                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                        : 'bg-rose-500/10 text-rose-500'
                                    }`}>
                                      {selectedCalendarDateDetails.status === 'present' ? '🟢 Present' : '🔴 Absent'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-slate-450 uppercase block font-bold">Marked By</span>
                                    <span className="text-slate-700 dark:text-slate-300 font-semibold block mt-0.5">
                                      Teacher / Staff
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-slate-450 uppercase block font-bold">Last Updated</span>
                                    <span className="text-slate-750 dark:text-slate-400 font-mono block mt-0.5">
                                      {selectedCalendarDateDetails.updatedAt
                                        ? new Date(selectedCalendarDateDetails.updatedAt).toLocaleString()
                                        : 'N/A'}
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <div className="text-slate-450 italic">
                                  {selectedCalendarDateDetails.isWeekend
                                    ? "Weekend / No School scheduled."
                                    : "No attendance recorded for this day."}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-slate-400 italic">
                              Click a date on the calendar to view full records and details.
                            </div>
                          )}
                        </div>
                        {selectedCalendarDateDetails && (
                          <button
                            type="button"
                            onClick={() => setSelectedCalendarDateDetails(null)}
                            className="w-full mt-4 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold py-2 rounded-xl text-[10px] uppercase text-slate-500 dark:text-slate-450 transition-colors"
                          >
                            Clear Selection
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Attendance History List */}
                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/40 font-sans">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Attendance Logs History</h4>
                          <p className="text-[10px] text-slate-455 font-semibold mt-0.5">List of all records marked for this student.</p>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center space-x-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase font-sans">Filter:</label>
                            <select
                              value={historyFilter}
                              onChange={(e) => setHistoryFilter(e.target.value)}
                              className="rounded-xl py-1.5 px-3 text-[11px] glass-input font-sans bg-transparent dark:text-white capitalize"
                            >
                              <option value="all" className="dark:bg-slate-900">All Records</option>
                              <option value="today" className="dark:bg-slate-900">Today</option>
                              <option value="week" className="dark:bg-slate-900">This Week</option>
                              <option value="month" className="dark:bg-slate-900">This Month</option>
                              <option value="custom" className="dark:bg-slate-900">Custom Range</option>
                            </select>
                          </div>

                          {historyFilter === 'custom' && (
                            <div className="flex items-center space-x-2 animate-fade-in">
                              <input
                                type="date"
                                value={customStart}
                                onChange={(e) => setCustomStart(e.target.value)}
                                className="rounded-xl py-1 px-2.5 text-[11px] glass-input font-sans bg-transparent dark:text-white"
                              />
                              <span className="text-[10px] text-slate-455 font-bold">to</span>
                              <input
                                type="date"
                                value={customEnd}
                                onChange={(e) => setCustomEnd(e.target.value)}
                                className="rounded-xl py-1 px-2.5 text-[11px] glass-input font-sans bg-transparent dark:text-white"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {loadingAttendance ? (
                        <div className="space-y-3 py-6">
                          {[1, 2].map(n => <div key={n} className="h-12 bg-slate-100/50 dark:bg-slate-905/30 rounded-xl animate-pulse"></div>)}
                        </div>
                      ) : getFilteredRecords().length === 0 ? (
                        <div className="p-8 text-center bg-slate-50/50 dark:bg-slate-900/20 border border-dashed border-slate-200/50 dark:border-slate-800/20 rounded-2xl">
                          <p className="text-xs text-slate-450 font-medium italic">No attendance records match the selected filter criteria.</p>
                        </div>
                      ) : (
                        <div className="overflow-hidden border border-slate-100 dark:border-slate-800/40 rounded-xl">
                          <table className="w-full text-left text-xs font-sans">
                            <thead>
                              <tr className="border-b border-slate-100 dark:border-slate-800/40 text-slate-400 dark:text-slate-500 uppercase font-semibold">
                                <th className="py-3.5 pl-4">Record Date</th>
                                <th className="py-3.5">Classroom</th>
                                <th className="py-3.5">Marked By</th>
                                <th className="py-3.5">Last Updated</th>
                                <th className="py-3.5">Status</th>
                                <th className="py-3.5 pr-4 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30 font-semibold">
                              {getFilteredRecords().sort((a, b) => new Date(b.date) - new Date(a.date)).map((rec) => {
                                const isEditing = editingRecordId === rec._id;
                                return (
                                  <tr key={rec._id} className="hover:bg-slate-55/10 dark:hover:bg-slate-900/10">
                                    <td className="py-3 pl-4 text-slate-800 dark:text-white font-mono">{rec.date}</td>
                                    <td className="py-3 text-slate-550 dark:text-slate-400">{rec.classroom}</td>
                                    <td className="py-3 text-slate-500 dark:text-slate-450 font-normal">Teacher / Staff</td>
                                    <td className="py-3 text-slate-500 dark:text-slate-450 font-mono font-normal">
                                      {rec.updatedAt ? new Date(rec.updatedAt).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="py-3">
                                      {isEditing ? (
                                        <select
                                          value={editingStatus}
                                          onChange={(e) => setEditingStatus(e.target.value)}
                                          className="rounded-lg py-1 px-2 text-xs glass-input bg-transparent dark:text-white"
                                        >
                                          <option value="present" className="dark:bg-slate-900">Present</option>
                                          <option value="absent" className="dark:bg-slate-900">Absent</option>
                                        </select>
                                      ) : (
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase ${
                                          rec.status === 'present' 
                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                            : 'bg-rose-500/10 text-rose-500'
                                        }`}>
                                          {rec.status}
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-3 pr-4 text-right">
                                      {isEditing ? (
                                        <div className="flex items-center justify-end space-x-2">
                                          <button
                                            type="button"
                                            onClick={() => handleUpdateAttendance(rec._id)}
                                            className="p-1 rounded bg-brand-500 text-white hover:bg-brand-600 transition-colors"
                                            title="Save changes"
                                          >
                                            <Check className="h-3 w-3" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setEditingRecordId(null)}
                                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                                            title="Cancel editing"
                                          >
                                            <X className="h-3 w-3" />
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingRecordId(rec._id);
                                            setEditingStatus(rec.status);
                                          }}
                                          className="text-[10px] font-black text-brand-500 hover:text-brand-600 flex items-center justify-end space-x-1 ml-auto"
                                        >
                                          <Edit3 className="h-3 w-3" />
                                          <span>Modify</span>
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })()}

              {/* TAB 4: MILESTONES */}
              {activeTab === 'milestones' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-left">
                  
                  {/* Sliders update form */}
                  <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-205/50 dark:border-slate-800/15">
                    <h3 className="font-bold text-base text-slate-850 dark:text-white flex items-center mb-1">
                      Milestones Scorecard
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 mb-6">
                      Adjust completion percentages for student learning outcomes across core developmental categories.
                    </p>

                    <form onSubmit={handleSaveMilestones} className="space-y-5">
                      {Object.keys(milestones).map((key) => (
                        <div key={key} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs font-bold font-sans">
                            <span className="text-slate-705 dark:text-slate-350">{key}</span>
                            <span className="text-brand-500 dark:text-brand-450">{milestones[key]}%</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={milestones[key]}
                              onChange={(e) => setMilestones({ ...milestones, [key]: parseInt(e.target.value, 10) })}
                              className="flex-1 accent-brand-500 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
                            />
                          </div>
                        </div>
                      ))}

                      <div className="pt-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">
                          Teacher Feedback Commentary
                        </label>
                        <textarea
                          rows={3}
                          value={teacherFeedback}
                          onChange={(e) => setTeacherFeedback(e.target.value)}
                          placeholder="Type milestone observations, child progress comments or specific feedback highlights..."
                          className="w-full px-4 py-2.5 rounded-xl text-xs glass-input font-sans"
                        />
                      </div>

                      <div className="pt-4 flex justify-end">
                        <button
                          type="submit"
                          disabled={savingMilestones}
                          className="flex items-center justify-center bg-brand-500 hover:bg-brand-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-md transition-all"
                        >
                          {savingMilestones ? <Loader2 className="h-4.5 w-4.5 animate-spin mr-1.5" /> : <Save className="h-4.5 w-4.5 mr-1.5" />}
                          Save Progress Outcomes
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Summary visual radar */}
                  <div className="glass-card p-6 rounded-2xl border border-slate-205/50 dark:border-slate-800/15 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-850 dark:text-white uppercase tracking-wider mb-2">
                        Milestone Radar
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs">
                        Graphical view of learning achievement levels.
                      </p>
                    </div>

                    <div className="h-56 w-full flex items-center justify-center mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                          <PolarGrid stroke="#475569" strokeDasharray="3 3" />
                          <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={9} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" fontSize={8} />
                          <Radar name={student.name} dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 5: TEACHER OBSERVATIONS */}
              {activeTab === 'observations' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-left">
                  
                  {/* List of existing observations */}
                  <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-205/50 dark:border-slate-800/15 space-y-5">
                    <h3 className="font-bold text-base text-slate-850 dark:text-white flex items-center mb-1">
                      Observations Logbook
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 mb-6">
                      History of pedagogical notes, social adaptations, child behavior observations, and academic feedback log.
                    </p>

                    {student.observations && student.observations.length > 0 ? (
                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {student.observations.slice().reverse().map((obs) => {
                          const isEditing = editingObsId === obs._id;
                          return (
                            <div key={obs._id} className="p-4 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-105/50 dark:border-slate-800/30 rounded-2xl space-y-2">
                              {isEditing ? (
                                <div className="space-y-2.5">
                                  <textarea
                                    rows={3}
                                    value={editObsContent}
                                    onChange={(e) => setEditObsContent(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl text-xs glass-input font-sans"
                                  />
                                  <div className="flex justify-end space-x-2">
                                    <button
                                      onClick={() => {
                                        setEditingObsId(null);
                                        setEditObsContent('');
                                      }}
                                      className="p-1 px-2.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 text-[10px] font-bold"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => handleSaveEditObservation(obs._id)}
                                      className="p-1 px-2.5 rounded bg-brand-500 text-white hover:bg-brand-600 text-[10px] font-bold"
                                    >
                                      Save Edit
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line font-medium leading-relaxed font-sans">
                                    {obs.content}
                                  </p>
                                  <div className="flex justify-between items-center text-[10px] text-slate-450 border-t border-slate-100/50 dark:border-slate-800/30 pt-2 font-semibold">
                                    <span>Logged by: {obs.teacherName} ({new Date(obs.date).toLocaleDateString()})</span>
                                    <button
                                      onClick={() => {
                                        setEditingObsId(obs._id);
                                        setEditObsContent(obs.content);
                                      }}
                                      className="flex items-center space-x-1 text-brand-500 hover:text-brand-600"
                                      title="Edit Observation"
                                    >
                                      <Edit3 className="h-3 w-3" /> <span>Edit</span>
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-slate-50/50 dark:bg-slate-900/20 border border-dashed border-slate-200/50 dark:border-slate-800/20 rounded-2xl">
                        <p className="text-xs text-slate-450 font-medium italic">No observation logs written yet for this student.</p>
                      </div>
                    )}
                  </div>

                  {/* Add New Observation form */}
                  <div className="glass-card p-6 rounded-2xl border border-slate-205/50 dark:border-slate-800/15">
                    <h3 className="font-bold text-sm text-slate-850 dark:text-white uppercase tracking-wider mb-4">
                      Record Observation
                    </h3>
                    
                    <form onSubmit={handleAddObservation} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-450 uppercase mb-2">Observation Notes</label>
                        <textarea
                          rows={5}
                          required
                          value={newObs}
                          onChange={(e) => setNewObs(e.target.value)}
                          placeholder="Describe behavior, learning milestones achieved, physical coordinations, or other developmental remarks..."
                          className="w-full px-3.5 py-3 rounded-xl text-xs glass-input font-sans"
                        />
                      </div>
                      
                      <button
                        type="submit"
                        disabled={addingObs || !newObs.trim()}
                        className="w-full flex items-center justify-center bg-brand-500 hover:bg-brand-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all font-sans"
                      >
                        {addingObs ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Plus className="h-4 w-4 mr-1.5" />}
                        Add Log Entry
                      </button>
                    </form>
                  </div>

                </div>
              )}

              {/* TAB 6: FEEDBACK HISTORY */}
              {activeTab === 'feedback' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-left">
                  
                  {/* Feedback logs list */}
                  <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-205/50 dark:border-slate-800/15 space-y-5">
                    <h3 className="font-bold text-base text-slate-850 dark:text-white flex items-center mb-1">
                      Feedback Reports Archive
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 mb-6">
                      Historical list of formal progress feedback and reports dispatched to parent alert portal.
                    </p>

                    {loadingHistory ? (
                      <div className="space-y-3 py-6">
                        {[1, 2].map(n => <div key={n} className="h-12 bg-slate-105/50 dark:bg-slate-905/30 rounded-xl animate-pulse"></div>)}
                      </div>
                    ) : feedbackHistory.length === 0 ? (
                      <div className="p-8 text-center bg-slate-50/50 dark:bg-slate-900/20 border border-dashed border-slate-200/50 dark:border-slate-800/20 rounded-2xl">
                        <p className="text-xs text-slate-450 font-medium italic">No feedback history reports sent yet to this parent.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {feedbackHistory.map((feed) => (
                          <div key={feed._id} className="p-4 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-105/50 dark:border-slate-800/30 rounded-2xl space-y-2">
                            <div className="flex justify-between items-start">
                              <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                Dispatched
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">{new Date(feed.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-sans font-medium">
                              {feed.message}
                            </p>
                            <div className="text-[10px] text-slate-450 pt-1 font-semibold">
                              Sender: {feed.sender?.name || 'Assigned Teacher'} ({feed.sender?.role || 'Staff'})
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Send New Feedback form */}
                  <div className="glass-card p-6 rounded-2xl border border-slate-205/50 dark:border-slate-800/15">
                    <h3 className="font-bold text-sm text-slate-850 dark:text-white uppercase tracking-wider mb-4">
                      Send Progress Feedback
                    </h3>
                    
                    <form onSubmit={handleSendFeedback} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-455 uppercase mb-2">Feedback Summary</label>
                        <textarea
                          rows={5}
                          required
                          value={newFeedbackText}
                          onChange={(e) => setNewFeedbackText(e.target.value)}
                          placeholder="Write feedback report to submit to the parent's notification feed. Parents will receive an instant portal alert notification..."
                          className="w-full px-3.5 py-3 rounded-xl text-xs glass-input font-sans"
                        />
                      </div>
                      
                      <button
                        type="submit"
                        disabled={sendingFeedback || !newFeedbackText.trim()}
                        className="w-full flex items-center justify-center bg-brand-500 hover:bg-brand-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all font-sans"
                      >
                        {sendingFeedback ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Send className="h-4 w-4 mr-1.5" />}
                        Dispatch Feedback Report
                      </button>
                    </form>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default StudentManagement;
