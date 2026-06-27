import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Bookmark, 
  Check, 
  X,
  FileText,
  User,
  PlusCircle,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';

const WeeklyPlanner = () => {
  const { user } = useAuth();

  if (user?.role !== 'teacher') {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400 font-sans">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-205/50 dark:border-slate-800/15 rounded-2xl p-8 shadow-sm text-left">
          <ShieldAlert className="h-10 w-10 text-red-500 mx-auto mb-4 animate-pulse" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white text-center">Access Denied</h3>
          <p className="text-xs mt-1 text-slate-500 dark:text-slate-400 text-center">You do not have teacher permissions to view the Weekly Planner.</p>
        </div>
      </div>
    );
  }
  
  const [lessons, setLessons] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekNumber, setWeekNumber] = useState(1);
  
  // Date tracking: Let's assume we are scheduling for the week of June 15, 2026
  const [weekStartDate, setWeekStartDate] = useState(new Date('2026-06-15'));
  
  // Modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  
  // Form states
  const [topic, setTopic] = useState('');
  const [learningGoal, setLearningGoal] = useState('');
  const [subjectArea, setSubjectArea] = useState('Science Exploration');
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [storyTime, setStoryTime] = useState('');
  const [rhymes, setRhymes] = useState('');
  const [assessmentMethod, setAssessmentMethod] = useState('');
  const [duration, setDuration] = useState(30);

  const subjectOptions = [
    'Science Exploration',
    'Mathematics',
    'Language Development',
    'Art & Craft',
    'Music & Dance',
    'Storytelling',
    'Outdoor Activities',
    'Fine Motor Skills',
    'Gross Motor Skills'
  ];

  // Helper to generate the 5 week dates (Mon to Fri)
  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(weekStartDate);
      d.setDate(weekStartDate.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays();

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/lessons?weekNumber=${weekNumber}`);
      if (response.success && response.data) {
        setLessons(response.data);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await api.get('/activities');
      if (response.success && response.data) {
        setActivities(response.data);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [weekNumber, weekStartDate, user?.role]);

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleScheduleLesson = async (e) => {
    e.preventDefault();
    try {
      const body = {
        weekNumber,
        topic,
        learningGoal,
        subjectArea,
        activities: selectedActivities,
        storyTime,
        rhymes,
        assessmentMethod,
        duration,
        date: selectedDate,
        status: user.role === 'teacher' ? 'submitted' : 'approved'
      };
      
      const response = await api.post('/lessons', body);
      if (response.success) {
        fetchLessons();
        resetForm();
        setShowScheduleModal(false);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setTopic('');
    setLearningGoal('');
    setSubjectArea('Science Exploration');
    setSelectedActivities([]);
    setStoryTime('');
    setRhymes('');
    setAssessmentMethod('');
    setDuration(30);
  };

  const handleNextWeek = () => {
    setWeekNumber(w => w + 1);
    const nextMon = new Date(weekStartDate);
    nextMon.setDate(weekStartDate.getDate() + 7);
    setWeekStartDate(nextMon);
  };

  const handlePrevWeek = () => {
    if (weekNumber <= 1) return;
    setWeekNumber(w => w - 1);
    const prevMon = new Date(weekStartDate);
    prevMon.setDate(weekStartDate.getDate() - 7);
    setWeekStartDate(prevMon);
  };

  // Drag & Drop Handlers
  const handleDragStart = (e, lessonId) => {
    e.dataTransfer.setData('text/plain', lessonId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Required to drop
  };

  const handleDrop = async (e, dateString) => {
    e.preventDefault();
    const lessonId = e.dataTransfer.getData('text/plain');
    if (!lessonId) return;

    try {
      // Find local lesson copy
      const lessonObj = lessons.find(l => l._id === lessonId);
      if (!lessonObj) return;

      // Update date via API
      const response = await api.put(`/lessons/${lessonId}`, { date: dateString });
      if (response.success) {
        fetchLessons();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleApproveStatus = async (id, status) => {
    try {
      const response = await api.post(`/lessons/${id}/approve`, { 
        status, 
        feedback: status === 'rejected' ? 'Needs adjustment' : 'Looks good' 
      });
      if (response.success) {
        fetchLessons();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const getDayLessons = (date) => {
    const formatted = date.toISOString().split('T')[0];
    return lessons.filter(l => l.date === formatted);
  };

  const formatDateLabel = (date) => {
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const handleActivityCheckbox = (id) => {
    if (selectedActivities.includes(id)) {
      setSelectedActivities(selectedActivities.filter(aid => aid !== id));
    } else {
      setSelectedActivities([...selectedActivities, id]);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white font-sans">Classroom Weekly Lesson Planner</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-sans mt-0.5">
            Schedule activities, storytelling circles, and track coordinator approvals. Drag-and-drop cards to reschedule.
          </p>
        </div>

        {/* Week navigator */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevWeek}
            disabled={weekNumber <= 1}
            className="p-2 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-355 font-sans px-2">
            Week {weekNumber}
          </span>
          <button
            onClick={handleNextWeek}
            className="p-2 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid - 5 columns (Mon-Fri) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {weekDays.map((day) => {
          const dayLessons = getDayLessons(day);
          const formattedDate = day.toISOString().split('T')[0];
          
          return (
            <div
              key={formattedDate}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, formattedDate)}
              className="glass-panel p-4 rounded-2xl flex flex-col min-h-[450px] border border-slate-200/50 dark:border-slate-800/20"
            >
              {/* Day Header */}
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800/35 flex justify-between items-center mb-3">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-xs font-sans capitalize">
                    {day.toLocaleDateString([], { weekday: 'long' })}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                    {formatDateLabel(day)}
                  </span>
                </div>

                {user?.role === 'teacher' && (
                  <button
                    onClick={() => {
                      setSelectedDate(formattedDate);
                      setShowScheduleModal(true);
                    }}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded text-brand-500 hover:text-brand-600 transition-colors"
                    title="Add Lesson to this day"
                  >
                    <PlusCircle className="h-4.5 w-4.5" />
                  </button>
                )}
              </div>

              {/* Day Body containing cards */}
              <div className="flex-1 space-y-3 overflow-y-auto pr-0.5">
                {dayLessons.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16 text-slate-350 dark:text-slate-600 border-2 border-dashed border-slate-100 dark:border-slate-800/45 rounded-xl p-3">
                    <CalendarIcon className="h-6 w-6 text-slate-300 dark:text-slate-700 mb-1.5" />
                    <span className="text-[10px] font-medium font-sans">No lessons scheduled</span>
                  </div>
                ) : (
                  dayLessons.map((lesson) => (
                    <div
                      key={lesson._id}
                      draggable={user?.role === 'teacher' && lesson.status !== 'approved'}
                      onDragStart={(e) => handleDragStart(e, lesson._id)}
                      className={`p-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl shadow-sm cursor-grab active:cursor-grabbing hover:border-brand-300 dark:hover:border-brand-500 transition-all ${
                        lesson.status === 'approved' 
                          ? 'border-l-4 border-l-emerald-500' 
                          : lesson.status === 'rejected' 
                          ? 'border-l-4 border-l-red-500' 
                          : 'border-l-4 border-l-blue-500'
                      }`}
                    >
                      {/* Lesson Card content */}
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="text-[9px] uppercase font-bold text-slate-400 truncate max-w-[70px]">
                          {lesson.subjectArea}
                        </span>
                        
                        {/* Status label */}
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                          lesson.status === 'approved' 
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' 
                            : lesson.status === 'rejected' 
                            ? 'bg-red-55 text-red-600 dark:bg-red-950/20' 
                            : 'bg-blue-50 text-blue-600 dark:bg-blue-950/20'
                        }`}>
                          {lesson.status === 'approved' ? 'Appr' : lesson.status === 'rejected' ? 'Rej' : 'Sub'}
                        </span>
                      </div>

                      <h5 className="font-extrabold text-xs text-slate-800 dark:text-white leading-tight font-sans">
                        {lesson.topic}
                      </h5>

                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans mt-1 leading-snug line-clamp-2">
                        {lesson.learningGoal}
                      </p>

                      <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400 font-sans border-t border-slate-100 dark:border-slate-800/40 pt-2">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-0.5 text-slate-400" /> {lesson.duration}m
                        </span>
                        
                        <span className="flex items-center text-slate-500 truncate max-w-[70px]">
                          <User className="h-3 w-3 mr-0.5 text-slate-450" /> {lesson.teacher?.name?.split(' ')[0] || 'Teacher'}
                        </span>
                      </div>

                      {/* Approval triggers inside card for coordinator/admin reviews */}
                      {(user?.role === 'coordinator' || user?.role === 'admin') && lesson.status === 'submitted' && (
                        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/40 pt-2 mt-2 gap-1.5">
                          <button
                            onClick={() => handleApproveStatus(lesson._id, 'rejected')}
                            className="flex-1 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center text-[9px] font-bold"
                            title="Reject"
                          >
                            <X className="h-3 w-3 mr-0.5" /> Reject
                          </button>
                          <button
                            onClick={() => handleApproveStatus(lesson._id, 'approved')}
                            className="flex-1 py-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center text-[9px] font-bold"
                            title="Approve"
                          >
                            <Check className="h-3 w-3 mr-0.5" /> Approve
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SCHEDULE LESSON MODAL */}
      {showScheduleModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-150 dark:border-slate-800 max-h-[80vh] flex flex-col animate-scale-up">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/40 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/35">
              <div>
                <span className="text-[10px] bg-brand-50 text-brand-600 dark:bg-brand-950/35 dark:text-brand-400 px-2.5 py-1 rounded-lg font-bold">
                  Schedule Lesson Plan
                </span>
                <h3 className="font-bold text-base text-slate-850 dark:text-white font-sans mt-1">
                  Target: {selectedDate.split('-').reverse().join('/')}
                </h3>
              </div>
              <button 
                onClick={() => {
                  resetForm();
                  setShowScheduleModal(false);
                }}
                className="text-slate-450 hover:text-slate-650 dark:hover:text-white font-semibold text-sm font-sans"
              >
                Close
              </button>
            </div>

            {/* Scrollable form */}
            <form onSubmit={handleScheduleLesson} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-sans">
                  Lesson Topic
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Intro to Clouds & Puddle Jumping"
                  className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-sans">
                  Learning Goal Description
                </label>
                <textarea
                  required
                  value={learningGoal}
                  onChange={(e) => setLearningGoal(e.target.value)}
                  placeholder="What is the key takeaway objective for this day's activity?"
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-sans">
                    Subject Area Category
                  </label>
                  <select
                    value={subjectArea}
                    onChange={(e) => setSubjectArea(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm glass-input font-sans"
                  >
                    {subjectOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-sans">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={120}
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-sans">
                  Story Time Selection
                </label>
                <input
                  type="text"
                  value={storyTime}
                  onChange={(e) => setStoryTime(e.target.value)}
                  placeholder="e.g. Shelly the Crab's Rain Adventure"
                  className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-sans">
                  Rhyme or Songs List
                </label>
                <input
                  type="text"
                  value={rhymes}
                  onChange={(e) => setRhymes(e.target.value)}
                  placeholder="e.g. Rain Rain Go Away, Five Little Ducks"
                  className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-sans">
                  Assessment Method
                </label>
                <input
                  type="text"
                  value={assessmentMethod}
                  onChange={(e) => setAssessmentMethod(e.target.value)}
                  placeholder="e.g. Observe sponge puddle balancing"
                  className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans"
                />
              </div>

              {/* Link Activity from library */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider font-sans">
                  Link Activities from Library
                </label>
                <div className="max-h-32 overflow-y-auto border border-slate-200/50 dark:border-slate-800 rounded-xl p-3 divide-y divide-slate-100 dark:divide-slate-800/35">
                  {activities.map((act) => (
                    <label key={act._id} className="flex items-center py-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={selectedActivities.includes(act._id)}
                        onChange={() => handleActivityCheckbox(act._id)}
                        className="rounded text-brand-500 focus:ring-brand-500 mr-2.5 border-slate-350 dark:bg-slate-900"
                      />
                      <div className="text-xs font-sans">
                        <span className="font-bold text-slate-700 dark:text-slate-300 block">{act.name}</span>
                        <span className="text-[10px] text-slate-400">{act.category} • {act.ageGroup}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

            </form>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800/40 bg-slate-55/40 dark:bg-slate-900/25 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowScheduleModal(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-white font-sans"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleLesson}
                disabled={!topic || !learningGoal}
                className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold font-sans shadow shadow-brand-500/15"
              >
                Schedule & Submit Review
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default WeeklyPlanner;
