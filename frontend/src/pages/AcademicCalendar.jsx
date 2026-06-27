import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Calendar as CalendarIcon,
  ChevronLeft, 
  ChevronRight, 
  Printer, 
  Download, 
  Edit3, 
  Save, 
  Plus, 
  X, 
  Filter, 
  Clock, 
  BookOpen, 
  Award,
  CalendarDays,
  FileText,
  CheckCircle,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

const AcademicCalendar = () => {
  const { user } = useAuth();
  
  // View mode state: 'year', 'month', 'week', 'day'
  const [viewMode, setViewMode] = useState('month');
  
  // Selected date (defaults to current local date)
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 5, 15)); // Default around seed lessons (June 2026)
  
  // Grade filter: 'all', 'Play Group', 'Nursery', 'LKG', 'UKG'
  const [gradeFilter, setGradeFilter] = useState('all');
  
  // Lessons state
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal / Detail states
  const [showInspector, setShowInspector] = useState(false);
  const [inspectorLesson, setInspectorLesson] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Edit form states
  const [editTopic, setEditTopic] = useState('');
  const [editLearningGoal, setEditLearningGoal] = useState('');
  const [editSubjectArea, setEditSubjectArea] = useState('');
  const [editStoryTime, setEditStoryTime] = useState('');
  const [editRhymes, setEditRhymes] = useState('');
  const [editAssessmentMethod, setEditAssessmentMethod] = useState('');
  const [editDuration, setEditDuration] = useState(30);
  const [editStatus, setEditStatus] = useState('draft');
  const [editActivities, setEditActivities] = useState([]);
  const [selectedActivityId, setSelectedActivityId] = useState('');
  
  // Available activities list (for assigning to lessons)
  const [activities, setActivities] = useState([]);

  // Fetch all lessons
  const fetchLessons = async () => {
    try {
      setLoading(true);
      // Fetch lessons (api helper handles user authorization & query filters)
      const response = await api.get('/lessons');
      if (response.success && response.data) {
        setLessons(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch lessons:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch activities (for edit select dropdown)
  const fetchActivities = async () => {
    try {
      const response = await api.get('/activities');
      if (response.success && response.data) {
        setActivities(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch activities:', err.message);
    }
  };

  useEffect(() => {
    fetchLessons();
    fetchActivities();
  }, [user]);

  // Helper: map a classroom name to grade levels
  const getGradeLevelOfClassroom = (classroom) => {
    if (!classroom) return 'Play Group';
    const clean = classroom.toLowerCase();
    if (clean.includes('play') || clean.includes('toddler')) return 'Play Group';
    if (clean.includes('nursery')) return 'Nursery';
    if (clean.includes('lkg') || clean.includes('kindergarten-a') || clean.includes('junior')) return 'LKG';
    if (clean.includes('ukg') || clean.includes('kindergarten-b') || clean.includes('senior')) return 'UKG';
    return 'Nursery'; // fallback default
  };

  // Filtered lessons list based on grade level selected
  const filteredLessons = useMemo(() => {
    if (gradeFilter === 'all') return lessons;
    return lessons.filter(lesson => {
      const classroom = lesson.teacher?.classroom || (user?.classroom && lesson.teacher?._id === user._id ? user.classroom : '');
      const grade = getGradeLevelOfClassroom(classroom);
      return grade === gradeFilter;
    });
  }, [lessons, gradeFilter, user]);

  // Group lessons by date string for easy lookup: { 'YYYY-MM-DD': [lessons] }
  const lessonsByDate = useMemo(() => {
    const map = {};
    filteredLessons.forEach(l => {
      if (l.date) {
        const dStr = l.date.split('T')[0];
        if (!map[dStr]) map[dStr] = [];
        map[dStr].push(l);
      }
    });
    return map;
  }, [filteredLessons]);

  // Colors mapping for status badges and indicators
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return {
          dot: 'bg-emerald-500',
          bg: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
          indicator: 'bg-emerald-500/20 border-emerald-500'
        };
      case 'submitted':
        return {
          dot: 'bg-blue-500',
          bg: 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-500/20',
          indicator: 'bg-blue-500/20 border-blue-500'
        };
      case 'rejected':
        return {
          dot: 'bg-rose-500',
          bg: 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-500/20',
          indicator: 'bg-rose-500/20 border-rose-500'
        };
      default:
        return {
          dot: 'bg-amber-500',
          bg: 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-500/20',
          indicator: 'bg-amber-500/20 border-amber-500'
        };
    }
  };

  // Calendar calculations helpers
  const year = selectedDate.getFullYear();
  const monthIdx = selectedDate.getMonth();

  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const startDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Navigate dates
  const handlePrevMonth = () => {
    setSelectedDate(new Date(year, monthIdx - 1, 15));
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(year, monthIdx + 1, 15));
  };

  const handlePrevYear = () => {
    setSelectedDate(new Date(year - 1, monthIdx, 15));
  };

  const handleNextYear = () => {
    setSelectedDate(new Date(year + 1, monthIdx, 15));
  };

  // Open inspector for specific lesson
  const openInspector = (lesson) => {
    setInspectorLesson(lesson);
    setEditTopic(lesson.topic || '');
    setEditLearningGoal(lesson.learningGoal || '');
    setEditSubjectArea(lesson.subjectArea || 'Science Exploration');
    setEditStoryTime(lesson.storyTime || '');
    setEditRhymes(lesson.rhymes || '');
    setEditAssessmentMethod(lesson.assessmentMethod || '');
    setEditDuration(lesson.duration || 30);
    setEditStatus(lesson.status || 'draft');
    setEditActivities(lesson.activities || []);
    setIsEditing(false);
    setShowInspector(true);
  };

  // Open creation modal for specific date
  const openCreateModal = (dateStr) => {
    setSelectedDate(new Date(dateStr));
    setEditTopic('');
    setEditLearningGoal('');
    setEditSubjectArea('Art & Craft');
    setEditStoryTime('');
    setEditRhymes('');
    setEditAssessmentMethod('');
    setEditDuration(30);
    setEditStatus('draft');
    setEditActivities([]);
    setShowCreateModal(true);
  };

  // Update existing lesson API handler
  const handleUpdateLesson = async (e) => {
    e.preventDefault();
    if (!editTopic || !inspectorLesson) return;
    try {
      const body = {
        topic: editTopic,
        learningGoal: editLearningGoal,
        subjectArea: editSubjectArea,
        storyTime: editStoryTime,
        rhymes: editRhymes,
        assessmentMethod: editAssessmentMethod,
        duration: parseInt(editDuration, 10),
        status: editStatus,
        activities: editActivities.map(a => a._id || a)
      };

      const response = await api.put(`/lessons/${inspectorLesson._id}`, body);
      if (response.success) {
        alert('Lesson updated successfully.');
        setIsEditing(false);
        // Refresh Inspector data
        const updatedResponse = await api.get(`/lessons/${inspectorLesson._id}`);
        if (updatedResponse.success && updatedResponse.data) {
          setInspectorLesson(updatedResponse.data);
        }
        fetchLessons();
      }
    } catch (err) {
      alert('Failed to update lesson: ' + err.message);
    }
  };

  // Create new lesson API handler
  const handleCreateLesson = async (e) => {
    e.preventDefault();
    if (!editTopic) return;
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const body = {
        date: dateStr,
        topic: editTopic,
        learningGoal: editLearningGoal,
        subjectArea: editSubjectArea,
        storyTime: editStoryTime,
        rhymes: editRhymes,
        assessmentMethod: editAssessmentMethod,
        duration: parseInt(editDuration, 10),
        status: editStatus,
        activities: editActivities.map(a => a._id || a)
      };

      const response = await api.post('/lessons', body);
      if (response.success) {
        alert('Lesson planned successfully.');
        setShowCreateModal(false);
        fetchLessons();
      }
    } catch (err) {
      alert('Failed to create lesson: ' + err.message);
    }
  };

  // Print inspector view handler
  const handlePrint = () => {
    window.print();
  };

  // Trigger PDF print save dialog
  const handleDownloadPDF = () => {
    window.print(); // Browser native Print-to-PDF handles this best via CSS
  };

  // Add activity to lesson editor list
  const addActivityToLesson = () => {
    if (!selectedActivityId) return;
    const activity = activities.find(a => a._id === selectedActivityId);
    if (activity && !editActivities.some(a => a._id === selectedActivityId)) {
      setEditActivities([...editActivities, activity]);
    }
    setSelectedActivityId('');
  };

  // Remove activity from lesson editor list
  const removeActivityFromLesson = (actId) => {
    setEditActivities(editActivities.filter(a => a._id !== actId));
  };

  // ----------------------------------------------------
  // GRID RENDERING FOR MONTH VIEW
  // ----------------------------------------------------
  const renderMonthGrid = () => {
    const totalDays = daysInMonth(year, monthIdx);
    const startDay = startDayOfMonth(year, monthIdx);
    
    const cells = [];
    
    // Fill empty slots for previous month offset
    for (let i = 0; i < startDay; i++) {
      cells.push(<div key={`empty-${i}`} className="min-h-[90px] border border-slate-100/40 dark:border-slate-800/40 bg-slate-50/25 dark:bg-slate-950/5 text-transparent"></div>);
    }
    
    // Fill current month days
    for (let day = 1; day <= totalDays; day++) {
      const currentDate = new Date(year, monthIdx, day);
      const dateStr = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayLessons = lessonsByDate[dateStr] || [];
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

      cells.push(
        <div 
          key={`day-${day}`} 
          className={`min-h-[110px] border border-slate-100 dark:border-slate-800 p-2 text-left flex flex-col justify-between transition-all group ${
            isWeekend ? 'bg-slate-50/50 dark:bg-slate-900/10' : 'bg-white dark:bg-slate-900/40'
          } hover:bg-slate-50 dark:hover:bg-slate-800/20`}
        >
          {/* Day number & Actions header */}
          <div className="flex justify-between items-center">
            <span className={`text-xs font-bold ${
              isWeekend ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400'
            }`}>
              {day}
            </span>
            {user?.role === 'teacher' && !isWeekend && (
              <button 
                onClick={() => openCreateModal(dateStr)}
                className="opacity-0 group-hover:opacity-100 p-0.5 text-brand-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/20 rounded transition-all"
                title="Schedule Lesson"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          
          {/* Daily Schedule display */}
          <div className="flex-1 mt-1 space-y-1 overflow-y-auto max-h-[80px]">
            {dayLessons.map((l) => {
              const colors = getStatusColor(l.status);
              return (
                <button
                  key={l._id}
                  onClick={() => openInspector(l)}
                  className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] font-bold truncate block ${colors.bg}`}
                  title={`${l.topic} (${l.status})`}
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full mr-1 bg-current align-middle"></span>
                  {l.topic}
                </button>
              );
            })}
            {!isWeekend && dayLessons.length === 0 && (
              <span className="text-[9px] text-slate-350 dark:text-slate-600 block italic leading-none mt-1">No plan</span>
            )}
            {isWeekend && (
              <span className="text-[9px] text-slate-350 dark:text-slate-600 block italic leading-none mt-1 font-sans">Weekend</span>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 border-t border-l border-slate-100 dark:border-slate-800 rounded-b-2xl overflow-hidden shadow-sm">
        {/* Days labels */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="bg-slate-50 dark:bg-slate-900 border-r border-b border-slate-100 dark:border-slate-800 py-2.5 text-center text-[10px] uppercase tracking-wider font-extrabold text-slate-400 font-sans">
            {d}
          </div>
        ))}
        {cells}
      </div>
    );
  };

  // ----------------------------------------------------
  // YEAR VIEW RENDERING (12 MINI GRIDS)
  // ----------------------------------------------------
  const renderYearGrid = () => {
    // We will render June 2026 to May 2027
    const monthsArray = [];
    const baseYear = 2026;
    
    // Generate 12 months starting from June (month idx 5)
    for (let offset = 0; offset < 12; offset++) {
      const mIdx = (5 + offset) % 12;
      const yVal = baseYear + Math.floor((5 + offset) / 12);
      monthsArray.push({ year: yVal, month: mIdx });
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {monthsArray.map(({ year: y, month: m }) => {
          const totalDays = daysInMonth(y, m);
          const startDay = startDayOfMonth(y, m);
          const monthCells = [];

          // Offset empties
          for (let i = 0; i < startDay; i++) {
            monthCells.push(<div key={`yempty-${i}`} className="h-5 text-transparent"></div>);
          }

          // Days
          for (let d = 1; d <= totalDays; d++) {
            const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayLessons = lessonsByDate[dateStr] || [];
            
            // Check color dot if has lessons
            let indicatorClass = 'text-slate-650 dark:text-slate-455';
            let dotClass = '';
            
            if (dayLessons.length > 0) {
              const primaryStatus = dayLessons[0].status;
              const colors = getStatusColor(primaryStatus);
              dotClass = `ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-900 ${colors.dot} text-white font-black bg-slate-900`;
              indicatorClass = 'text-slate-900 dark:text-white font-extrabold';
            }

            monthCells.push(
              <button 
                key={`yday-${d}`}
                onClick={() => {
                  setSelectedDate(new Date(y, m, d));
                  setViewMode('month');
                }}
                className={`h-5 text-[10px] flex items-center justify-center rounded-full transition-all hover:bg-brand-500/10 font-sans ${indicatorClass} ${dotClass}`}
                title={dayLessons.length > 0 ? `${dayLessons.length} Lesson scheduled` : ''}
              >
                {d}
              </button>
            );
          }

          return (
            <div key={`${y}-${m}`} className="glass-panel p-3 rounded-2xl border border-slate-100 dark:border-slate-800/40">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white font-sans mb-2 text-left">
                {monthNames[m]} {y}
              </h4>
              <div className="grid grid-cols-7 gap-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((dl, i) => (
                  <span key={i} className="text-[8px] font-bold text-slate-400 font-sans text-center">{dl}</span>
                ))}
                {monthCells}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ----------------------------------------------------
  // WEEK VIEW RENDERING (Mon-Fri vertical columns)
  // ----------------------------------------------------
  const renderWeekGrid = () => {
    // Calculate start of selected date's week (Monday)
    const currentDay = selectedDate.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay; // distance to Monday
    const monday = new Date(selectedDate);
    monday.setDate(selectedDate.getDate() + distanceToMonday);
    
    const daysOfActiveWeek = [];
    for (let i = 0; i < 5; i++) { // Mon to Fri
      const nextD = new Date(monday);
      nextD.setDate(monday.getDate() + i);
      daysOfActiveWeek.push(nextD);
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-5 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-900/15">
        {daysOfActiveWeek.map((dVal, index) => {
          const dateStr = dVal.toISOString().split('T')[0];
          const dayLessons = lessonsByDate[dateStr] || [];
          
          return (
            <div key={index} className="border-r border-slate-100 dark:border-slate-800 last:border-r-0 min-h-[300px] flex flex-col">
              {/* Header column */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3 border-b border-slate-100 dark:border-slate-800 text-left">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-sans">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][index]}
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans mt-0.5 block">
                  {dVal.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              
              {/* Content column list */}
              <div className="flex-1 p-3 space-y-2.5 overflow-y-auto">
                {dayLessons.map((l) => {
                  const colors = getStatusColor(l.status);
                  return (
                    <div 
                      key={l._id} 
                      onClick={() => openInspector(l)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all hover:scale-[1.01] bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-100/50 border-slate-200/50 dark:border-slate-800`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] bg-brand-50 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400 px-1.5 py-0.5 rounded font-extrabold uppercase font-sans">
                          {l.subjectArea || 'Nursery'}
                        </span>
                        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`}></span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-white mt-1.5 leading-snug font-sans">{l.topic}</h4>
                      <p className="text-[10px] text-slate-500 line-clamp-2 mt-1 leading-normal font-sans">{l.learningGoal}</p>
                      
                      <div className="flex items-center space-x-1.5 text-[9px] text-slate-400 mt-2 font-sans font-semibold">
                        <Clock className="h-3 w-3" />
                        <span>{l.duration} mins</span>
                      </div>
                    </div>
                  );
                })}
                {dayLessons.length === 0 && (
                  <div className="h-full flex items-center justify-center py-12">
                    <span className="text-[10px] text-slate-400 dark:text-slate-650 italic">No scheduled lessons</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ----------------------------------------------------
  // DAY VIEW RENDERING (List focused display of selected date)
  // ----------------------------------------------------
  const renderDayGrid = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const dayLessons = lessonsByDate[dateStr] || [];

    return (
      <div className="space-y-4 max-w-xl mx-auto">
        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-150/40 dark:border-slate-800 rounded-2xl text-left flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-white font-sans">
              Lessons on {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h3>
            <span className="text-xs text-slate-450 dark:text-slate-400 block font-sans">
              Total lessons scheduled: {dayLessons.length}
            </span>
          </div>
          {user?.role === 'teacher' && (
            <button
              onClick={() => openCreateModal(dateStr)}
              className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center shadow-sm shadow-brand-500/10 font-sans"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Lesson
            </button>
          )}
        </div>
        
        <div className="space-y-3">
          {dayLessons.map((l) => {
            const colors = getStatusColor(l.status);
            return (
              <div 
                key={l._id} 
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl flex flex-col sm:flex-row sm:items-center sm:justify-between shadow-sm hover:shadow-md transition-all text-left space-y-4 sm:space-y-0"
              >
                <div className="space-y-1.5 flex-1 pr-4">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-brand-50 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400 rounded text-[9px] font-bold uppercase tracking-wider font-sans">
                      {l.subjectArea}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-sans ${colors.bg}`}>
                      {l.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-base text-slate-850 dark:text-white font-sans leading-snug">{l.topic}</h4>
                  <p className="text-xs text-slate-500 leading-normal font-sans">{l.learningGoal}</p>
                  
                  {/* Metadata labels */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {l.duration} mins</span>
                    {l.storyTime && <span className="flex items-center"><BookOpen className="h-3 w-3 mr-1" /> Story: {l.storyTime}</span>}
                    {l.rhymes && <span className="flex items-center"><Award className="h-3 w-3 mr-1" /> Rhyme: {l.rhymes}</span>}
                  </div>
                </div>

                <div className="flex items-center space-x-2 justify-end sm:justify-start">
                  <button
                    onClick={() => openInspector(l)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white bg-slate-50 dark:bg-slate-850 rounded-xl font-sans border border-slate-100 dark:border-slate-800 transition-colors"
                  >
                    Inspect Details
                  </button>
                </div>
              </div>
            );
          })}
          {dayLessons.length === 0 && (
            <div className="py-16 text-center text-slate-400 font-sans italic text-xs">
              No lessons scheduled for this date.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Print-only CSS layout override */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 30px;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white font-sans">Academic Year Calendar</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-sans mt-0.5">
            Coordinate activities, schedule lesson guides, and inspect curriculum progress.
          </p>
        </div>

        {/* Grade level dropdown filter */}
        <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-xl self-start sm:self-auto">
          <Filter className="h-4 w-4 text-slate-400 ml-2" />
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="text-xs font-bold bg-transparent border-0 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-0 cursor-pointer pr-6"
          >
            <option value="all">All Classrooms</option>
            <option value="Play Group">Play Group (2-3 Yrs)</option>
            <option value="Nursery">Nursery (3-4 Yrs)</option>
            <option value="LKG">LKG (4-5 Yrs)</option>
            <option value="UKG">UKG (5-6 Yrs)</option>
          </select>
        </div>
      </div>

      {/* Calendar navigation & view toggle tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 glass-panel p-4 rounded-2xl no-print">
        {/* Navigation arrows */}
        <div className="flex items-center space-x-3 justify-center sm:justify-start">
          <button 
            onClick={handlePrevMonth}
            className="p-2 border border-slate-200/50 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-655 dark:text-slate-400"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </button>
          
          <h2 className="font-extrabold text-base text-slate-800 dark:text-white font-sans min-w-[150px] text-center">
            {monthNames[monthIdx]} {year}
          </h2>
          
          <button 
            onClick={handleNextMonth}
            className="p-2 border border-slate-200/50 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-655 dark:text-slate-400"
          >
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
          
          {/* Quick jump to Current date */}
          <button
            onClick={() => setSelectedDate(new Date(2026, 5, 15))}
            className="px-2.5 py-1 text-[10px] font-extrabold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/65 text-slate-600 dark:text-slate-300 rounded-lg font-sans"
          >
            Today
          </button>
        </div>

        {/* View Mode tabs (Year / Month / Week / Day) */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200/30 dark:border-slate-850 rounded-xl self-center sm:self-auto">
          {['year', 'month', 'week', 'day'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold font-sans uppercase tracking-wider transition-all ${
                viewMode === mode
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-white shadow-sm'
                  : 'text-slate-450 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-400'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid View render container */}
      <div className="no-print">
        {loading ? (
          <div className="py-24 text-center">
            <span className="inline-block animate-spin h-6 w-6 border-2 border-brand-500 border-t-transparent rounded-full mb-2"></span>
            <p className="text-slate-400 text-xs font-sans italic">Synching schedule data...</p>
          </div>
        ) : (
          <>
            {viewMode === 'month' && renderMonthGrid()}
            {viewMode === 'year' && renderYearGrid()}
            {viewMode === 'week' && renderWeekGrid()}
            {viewMode === 'day' && renderDayGrid()}
          </>
        )}
      </div>

      {/* ----------------------------------------------------
          DAILY DETAILS INSPECTOR PANEL (AS AN OVERLAY MODAL)
          ---------------------------------------------------- */}
      {showInspector && inspectorLesson && createPortal(
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-150 dark:border-slate-800 max-h-[80vh] flex flex-col animate-scale-up">
            
            {/* Modal Body wrapper that handles print targeting */}
            <div id="print-area" className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800/40 pb-4">
                <div>
                  <span className="text-[10px] bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400 px-2.5 py-1 rounded-lg font-bold">
                    Class level: {getGradeLevelOfClassroom(inspectorLesson.teacher?.classroom)} ({inspectorLesson.teacher?.classroom || 'Nursery-A'})
                  </span>
                  <h2 className="font-extrabold text-xl text-slate-850 dark:text-white font-sans mt-2">
                    {isEditing ? 'Edit Lesson Plan' : inspectorLesson.topic}
                  </h2>
                  <span className="text-xs text-slate-400 mt-1 block">
                    Scheduled Date: {new Date(inspectorLesson.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                
                <button 
                  onClick={() => {
                    setShowInspector(false);
                    setIsEditing(false);
                  }}
                  className="text-slate-450 hover:text-slate-650 dark:hover:text-white font-bold no-print"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {isEditing ? (
                // EDIT MODE FORM
                <form onSubmit={handleUpdateLesson} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Topic / Title</label>
                      <input 
                        type="text" 
                        value={editTopic} 
                        onChange={(e) => setEditTopic(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs glass-input font-sans" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Subject Area</label>
                      <select
                        value={editSubjectArea}
                        onChange={(e) => setEditSubjectArea(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs glass-input font-sans"
                      >
                        <option value="Science Exploration">Science Exploration</option>
                        <option value="Art & Craft">Art & Craft</option>
                        <option value="Language Development">Language Development</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Music & Dance">Music & Dance</option>
                        <option value="Fine Motor Skills">Fine Motor Skills</option>
                        <option value="Gross Motor Skills">Gross Motor Skills</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Learning Goal Outcome</label>
                    <textarea 
                      value={editLearningGoal} 
                      onChange={(e) => setEditLearningGoal(e.target.value)}
                      rows={2} 
                      className="w-full px-3 py-2 rounded-xl text-xs glass-input font-sans" 
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Story Time Title</label>
                      <input 
                        type="text" 
                        value={editStoryTime} 
                        onChange={(e) => setEditStoryTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs glass-input font-sans" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Rhymes Session</label>
                      <input 
                        type="text" 
                        value={editRhymes} 
                        onChange={(e) => setEditRhymes(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs glass-input font-sans" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Assessment Method</label>
                      <input 
                        type="text" 
                        value={editAssessmentMethod} 
                        onChange={(e) => setEditAssessmentMethod(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs glass-input font-sans" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Duration (Mins)</label>
                      <input 
                        type="number" 
                        value={editDuration} 
                        onChange={(e) => setEditDuration(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs glass-input font-sans" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Plan Status</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs glass-input font-sans"
                      >
                        <option value="draft">Draft</option>
                        <option value="submitted">Submitted</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Needs Revision</option>
                      </select>
                    </div>
                  </div>

                  {/* Activity Linking section inside lesson builder */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/40">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Assign Activities</label>
                    <div className="flex space-x-2 mb-2">
                      <select
                        value={selectedActivityId}
                        onChange={(e) => setSelectedActivityId(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl text-xs glass-input font-sans"
                      >
                        <option value="">Choose activity to link...</option>
                        {activities.map(a => (
                          <option key={a._id} value={a._id}>{a.name} ({a.category})</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={addActivityToLesson}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/60 rounded-xl text-xs font-bold"
                      >
                        Link
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {editActivities.map(act => (
                        <span 
                          key={act._id} 
                          className="inline-flex items-center px-2.5 py-1 bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 rounded-lg text-xs font-bold"
                        >
                          {act.name}
                          <button 
                            type="button" 
                            onClick={() => removeActivityFromLesson(act._id)}
                            className="ml-1.5 text-red-500 hover:text-red-750 font-black text-xs"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-855 rounded-xl text-xs font-bold"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow shadow-brand-500/10 flex items-center"
                    >
                      <Save className="h-3.5 w-3.5 mr-1" /> Update Plan Details
                    </button>
                  </div>
                </form>
              ) : (
                // INSPECT MODE DETAILS VIEW
                <div className="space-y-6">
                  {/* Status strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/30 rounded-2xl">
                    <div>
                      <span className="text-[9px] uppercase font-extrabold text-slate-400 block font-sans">Status</span>
                      <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${getStatusColor(inspectorLesson.status).bg}`}>
                        {inspectorLesson.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-extrabold text-slate-400 block font-sans">Subject Area</span>
                      <span className="text-xs font-extrabold text-slate-700 dark:text-white block mt-1">{inspectorLesson.subjectArea}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-extrabold text-slate-400 block font-sans">Duration</span>
                      <span className="text-xs font-extrabold text-brand-550 block mt-1">{inspectorLesson.duration} Mins</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-extrabold text-slate-400 block font-sans">Facilitator</span>
                      <span className="text-xs font-bold text-slate-550 block mt-1 truncate">{inspectorLesson.teacher?.name || 'Teacher'}</span>
                    </div>
                  </div>

                  {/* Learning Goal */}
                  <div>
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-sans">Learning Objective Goal</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-350 leading-relaxed font-sans font-medium">
                      {inspectorLesson.learningGoal}
                    </p>
                  </div>

                  {/* Split Story / Rhymes panel */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/10 rounded-2xl border border-slate-100 dark:border-slate-800/40">
                      <span className="text-[9px] uppercase font-extrabold text-slate-400 block font-sans">Circle Time Story</span>
                      <span className="text-sm font-extrabold text-slate-800 dark:text-white mt-1 block font-sans">
                        {inspectorLesson.storyTime || 'No Story Outlined'}
                      </span>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/10 rounded-2xl border border-slate-100 dark:border-slate-800/40">
                      <span className="text-[9px] uppercase font-extrabold text-slate-400 block font-sans">Rhyme/Song Session</span>
                      <span className="text-sm font-extrabold text-slate-800 dark:text-white mt-1 block font-sans">
                        {inspectorLesson.rhymes || 'No Rhyme Outlined'}
                      </span>
                    </div>
                  </div>

                  {/* Activities blueprints */}
                  <div>
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 font-sans">Assigned Lesson Activities</h4>
                    {(!inspectorLesson.activities || inspectorLesson.activities.length === 0) ? (
                      <span className="text-xs text-slate-400 font-sans italic">No custom activities linked to this lesson.</span>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {inspectorLesson.activities.map((act, idx) => (
                          <div key={idx} className="p-3.5 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-sm">
                            <span className="px-2 py-0.5 bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 rounded text-[9px] font-extrabold uppercase">
                              {act.category}
                            </span>
                            <h5 className="font-extrabold text-xs text-slate-800 dark:text-white mt-1.5 font-sans">{act.name}</h5>
                            <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed font-sans">{act.learningOutcome}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Assessment */}
                  {inspectorLesson.assessmentMethod && (
                    <div>
                      <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-sans">Observation & Assessment</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-sans italic leading-relaxed">
                        "{inspectorLesson.assessmentMethod}"
                      </p>
                    </div>
                  )}

                  {/* Feedback Strip */}
                  {inspectorLesson.feedback && (
                    <div className="p-4 bg-amber-500/10 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 rounded-2xl border border-amber-500/10 flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold block uppercase tracking-wider">Coordinator Review Notes:</span>
                        <p className="text-xs mt-1 leading-relaxed font-sans font-medium">{inspectorLesson.feedback}</p>
                      </div>
                    </div>
                  )}

                  {/* Review / Control actions footer */}
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800/40 flex justify-between items-center no-print">
                    <div className="flex space-x-1.5">
                      <button
                        onClick={handlePrint}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/60 text-slate-655 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center font-sans border border-slate-100 dark:border-slate-800 transition-colors"
                      >
                        <Printer className="h-3.5 w-3.5 mr-1" /> Print Plan
                      </button>
                      <button
                        onClick={handleDownloadPDF}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/60 text-slate-655 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center font-sans border border-slate-100 dark:border-slate-800 transition-colors"
                      >
                        <Download className="h-3.5 w-3.5 mr-1" /> Save PDF
                      </button>
                    </div>

                    {user?.role === 'teacher' && inspectorLesson.teacher?._id === user._id && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold flex items-center shadow shadow-brand-500/10"
                      >
                        <Edit3 className="h-3.5 w-3.5 mr-1.5" /> Edit Lesson Guide
                      </button>
                    )}
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ----------------------------------------------------
          CREATE PLAN MODAL (FOR EMPTY DATES CLICKED)
          ---------------------------------------------------- */}
      {showCreateModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] overflow-y-auto">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-150 dark:border-slate-800 max-h-[80vh] flex flex-col animate-scale-up">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/40 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/35 text-left">
              <div>
                <h3 className="font-extrabold text-base text-slate-850 dark:text-white font-sans">Schedule New Lesson Plan</h3>
                <p className="text-xs text-slate-400 mt-0.5 font-sans">
                  Planning for date: {selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-655 font-bold"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLesson} className="p-6 space-y-4 text-left overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-sans">Topic / Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Intro to Rain Cycle"
                    value={editTopic} 
                    onChange={(e) => setEditTopic(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input font-sans text-slate-800 dark:text-white" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-sans">Subject Area</label>
                  <select
                    value={editSubjectArea}
                    onChange={(e) => setEditSubjectArea(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input font-sans text-slate-800 dark:text-white"
                  >
                    <option value="Science Exploration">Science Exploration</option>
                    <option value="Art & Craft">Art & Craft</option>
                    <option value="Language Development">Language Development</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Music & Dance">Music & Dance</option>
                    <option value="Fine Motor Skills">Fine Motor Skills</option>
                    <option value="Gross Motor Skills">Gross Motor Skills</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-sans">Learning Goal Outcome</label>
                <textarea 
                  placeholder="What should children understand after this session?"
                  value={editLearningGoal} 
                  onChange={(e) => setEditLearningGoal(e.target.value)}
                  rows={2} 
                  className="w-full px-3 py-2 rounded-xl text-xs glass-input font-sans text-slate-800 dark:text-white" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-sans">Circle Time Story</label>
                  <input 
                    type="text" 
                    placeholder="Storybook title"
                    value={editStoryTime} 
                    onChange={(e) => setEditStoryTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input font-sans text-slate-800 dark:text-white" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-sans">Rhymes Session</label>
                  <input 
                    type="text" 
                    placeholder="Song or rhymes names"
                    value={editRhymes} 
                    onChange={(e) => setEditRhymes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input font-sans text-slate-800 dark:text-white" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-sans">Assessment Method</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Group observation"
                    value={editAssessmentMethod} 
                    onChange={(e) => setEditAssessmentMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input font-sans text-slate-800 dark:text-white" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-sans">Duration (Mins)</label>
                  <input 
                    type="number" 
                    value={editDuration} 
                    onChange={(e) => setEditDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input font-sans text-slate-800 dark:text-white" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-sans">Draft Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input font-sans text-slate-800 dark:text-white"
                  >
                    <option value="draft">Draft (Save locally)</option>
                    <option value="submitted">Submitted (Send for review)</option>
                  </select>
                </div>
              </div>

              {/* Activity Linking section inside lesson creator */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/40">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">Link Vetted Activities</label>
                <div className="flex space-x-2 mb-2">
                  <select
                    value={selectedActivityId}
                    onChange={(e) => setSelectedActivityId(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl text-xs glass-input font-sans text-slate-800 dark:text-white"
                  >
                    <option value="">Choose activity to link...</option>
                    {activities.map(a => (
                      <option key={a._id} value={a._id}>{a.name} ({a.category})</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addActivityToLesson}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/60 rounded-xl text-xs font-bold"
                  >
                    Link
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {editActivities.map(act => (
                    <span 
                      key={act._id} 
                      className="inline-flex items-center px-2.5 py-1 bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 rounded-lg text-xs font-bold font-sans"
                    >
                      {act.name}
                      <button 
                        type="button" 
                        onClick={() => removeActivityFromLesson(act._id)}
                        className="ml-1.5 text-red-500 hover:text-red-750 font-black text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/40 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-205 dark:hover:bg-slate-700/60 rounded-xl text-xs font-bold text-slate-550 dark:text-slate-350"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow shadow-brand-500/10 flex items-center font-sans"
                >
                  Schedule Lesson Plan
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default AcademicCalendar;
