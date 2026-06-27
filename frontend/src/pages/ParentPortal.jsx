import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Baby, 
  Calendar, 
  Megaphone, 
  Award, 
  Clock, 
  User as UserIcon, 
  BookOpen, 
  CheckCircle2, 
  XCircle,
  MessageSquare,
  Send,
  HelpCircle,
  FileText,
  Music,
  Bookmark,
  Shield,
  Heart,
  Phone,
  AlertCircle,
  ShieldAlert,
  Download
} from 'lucide-react';

const ParentPortal = () => {
  const { user } = useAuth();

  if (user?.role !== 'parent') {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400 font-sans">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-205/50 dark:border-slate-800/15 rounded-2xl p-8 shadow-sm text-left">
          <ShieldAlert className="h-10 w-10 text-red-500 mx-auto mb-4 animate-pulse" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white text-center">Access Denied</h3>
          <p className="text-xs mt-1 text-slate-500 dark:text-slate-400 text-center">You do not have parent permissions to view the Parent Portal.</p>
        </div>
      </div>
    );
  }

  
  const [activeTab, setActiveTab] = useState('progress'); // progress, lessons, notices, enquiry, child_info
  
  const [attendance, setAttendance] = useState([]);
  const [notices, setNotices] = useState([]);
  const [progress, setProgress] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [communicationHistory, setCommunicationHistory] = useState([]);
  const [assignedTeacher, setAssignedTeacher] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [selectedWorksheetLesson, setSelectedWorksheetLesson] = useState(null);

  const getRhymesDetails = (rhymesName) => {
    const name = rhymesName?.toLowerCase() || '';
    if (name.includes('rain rain') || name.includes('pitter patter')) {
      return {
        title: "Rain Rain Go Away & Pitter Patter Raindrops",
        lyrics: [
          "Rain, rain, go away,",
          "Come again another day.",
          "Little Aarav wants to play,",
          "Rain, rain, go away!",
          "",
          "Pitter patter, pitter patter,",
          "Hear the raindrops fall!",
          "Pitter patter, pitter patter,",
          "We don't mind at all!"
        ]
      };
    }
    if (name.includes('row row')) {
      return {
        title: "Row, Row, Row Your Boat",
        lyrics: [
          "Row, row, row your boat",
          "Gently down the stream,",
          "Merrily, merrily, merrily, merrily,",
          "Life is but a dream!"
        ]
      };
    }
    return {
      title: rhymesName || "Class Rhyme",
      lyrics: [
        "Twinkle, twinkle, little star,",
        "How I wonder what you are!",
        "Up above the world so high,",
        "Like a diamond in the sky!"
      ]
    };
  };

  const downloadWorksheet = (lesson) => {
    if (!lesson) return;
    const rhymeData = getRhymesDetails(lesson.rhymes);
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Worksheet: ${lesson.topic}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1e293b; max-width: 800px; margin: 40px auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    h1 { color: #8d44ff; border-bottom: 2px solid #f3e8ff; padding-bottom: 12px; margin-top: 0; font-size: 24px; font-weight: 800; text-align: center; }
    h2 { color: #3b82f6; margin-top: 32px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f8fafc; padding: 20px; border-radius: 16px; border: 1px solid #f1f5f9; margin-bottom: 24px; }
    .meta-item { font-size: 13px; }
    .meta-label { font-weight: 700; color: #64748b; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em; margin-bottom: 4px; }
    .meta-value { color: #0f172a; font-weight: 600; }
    .lyrics { background: #faf5ff; border: 1px dashed #d8b4fe; padding: 24px; border-radius: 16px; text-align: center; font-style: italic; font-size: 14px; color: #581c87; }
    .footer { text-align: center; margin-top: 48px; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px; font-weight: 550; }
    @media print {
      body {
        border: none;
        box-shadow: none;
        margin: 0;
        padding: 0;
        max-width: 100%;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="no-print" style="background: #f3e8ff; border: 1px solid #d8b4fe; padding: 12px; border-radius: 12px; margin-bottom: 24px; font-size: 13px; color: #581c87; font-weight: 500; text-align: center;">
    💡 <strong>Tip for Parents:</strong> Select <strong>"Save as PDF"</strong> as the printer/destination in the dialog below to download this guide as a PDF file.
  </div>

  <h1>FirstCry Intellitots Learning Guide</h1>
  
  <div class="meta">
    <div class="meta-item"><div class="meta-label">Topic / Lesson</div><div class="meta-value">${lesson.topic}</div></div>
    <div class="meta-item"><div class="meta-label">Subject Area</div><div class="meta-value">${lesson.subjectArea}</div></div>
    <div class="meta-item"><div class="meta-label">Target Skill Goal</div><div class="meta-value">${lesson.learningGoal}</div></div>
    <div class="meta-item"><div class="meta-label">Date Scheduled</div><div class="meta-value">${new Date(lesson.date).toLocaleDateString()}</div></div>
  </div>

  <h2>Worksheet Assessment Details</h2>
  <p style="font-size: 14px; font-weight: 500; color: #334155;">${lesson.assessmentMethod || "Observational quiz matching cloudy cards with symbols."}</p>

  <h2>Parent Home Action Guide</h2>
  <p style="font-size: 13px; color: #475569;">Guide your child in tracing, identifying, or acting out the classroom activity details. You can encourage them to speak the answers out loud or draw matching items on a blank paper.</p>

  <h2>Rhymes Practice Corner: ${rhymeData.title}</h2>
  <div class="lyrics">
    ${rhymeData.lyrics.map(line => '<p style="margin: 6px 0; font-weight: 500;">' + (line === "" ? "&nbsp;" : line) + '</p>').join('')}
  </div>

  <div class="footer">
    Generated by FirstCry Intellitots Parent Portal &copy; ${new Date().getFullYear()}
  </div>
</body>
</html>
    `.trim();

    // 1. Try to open print window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      // Trigger print on load
      printWindow.onload = function() {
        printWindow.print();
      };
    } else {
      // 2. Fallback: download as html if pop-up blocked
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeTopic = lesson.topic.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
      link.setAttribute('download', `Worksheet_${safeTopic}.html`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Parent Enquiry Form State
  const [enquiryTitle, setEnquiryTitle] = useState('');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);
  const [enquiryFeedback, setEnquiryFeedback] = useState(null);

  // Child Info Management state
  const [emergencyPhone, setEmergencyPhone] = useState(localStorage.getItem(`emergencyPhone_${user?._id}`) || '+91 98765 43222');
  const [healthNotes, setHealthNotes] = useState(localStorage.getItem(`healthNotes_${user?._id}`) || 'No known allergies. Lactose tolerant.');
  const [saveFeedback, setSaveFeedback] = useState(null);

  const fetchParentData = async () => {
    try {
      const [attRes, noticeRes, progRes, lessonRes, notifRes, teacherRes] = await Promise.all([
        api.get('/parent/attendance'),
        api.get('/parent/notices'),
        api.get('/parent/progress'),
        api.get('/lessons'),
        api.get('/notifications'),
        api.get('/parent/teacher').catch(() => ({ success: false, data: null }))
      ]);

      if (attRes.success && attRes.data) setAttendance(attRes.data);
      if (noticeRes.success && noticeRes.data) setNotices(noticeRes.data);
      if (progRes.success && progRes.data && progRes.data.length > 0) {
        setProgress(progRes.data[0]);
      }
      if (lessonRes.success && lessonRes.data) {
        // Filter lessons for the parent's child's classroom
        const targetClass = user?.classroom || 'Nursery-A';
        const filtered = lessonRes.data.filter(l => 
          l.classroom === targetClass || 
          (l.teacher && l.teacher.classroom === targetClass)
        );
        setLessons(filtered);
      }
      if (notifRes.success && notifRes.data) {
        // Enquiries sent by or replied to parent
        const enquiries = notifRes.data.filter(n => 
          (n.type === 'enquiry' || n.type === 'parent_message') && 
          (n.sender === user?._id || n.recipient === user?._id)
        );
        setCommunicationHistory(enquiries);
      }
      if (teacherRes && teacherRes.success && teacherRes.data) {
        setAssignedTeacher(teacherRes.data);
      }
    } catch (err) {
      console.error('Failed to load parent portal details:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParentData();
  }, [user]);

  const handleSendEnquiry = async (e) => {
    e.preventDefault();
    if (!enquiryTitle || !enquiryMessage) return;

    // Resolve teacher ID — assignedTeacher may be an object with _id or just an id string
    const teacherId = assignedTeacher?._id || assignedTeacher?.id || null;
    if (!teacherId) {
      setEnquiryFeedback({ type: 'error', text: 'Unable to find your assigned teacher. Please contact the school admin.' });
      return;
    }

    setSubmittingEnquiry(true);
    setEnquiryFeedback(null);
    try {
      // Send as a notification to the teacher with type 'enquiry'
      const response = await api.post('/notifications', {
        recipient: teacherId,
        title: `Enquiry: ${enquiryTitle}`,
        message: enquiryMessage,
        type: 'enquiry'
      });

      if (response.success) {
        setEnquiryFeedback({ type: 'success', text: 'Message sent successfully! The teacher will reply soon.' });
        setEnquiryTitle('');
        setEnquiryMessage('');
        // Re-fetch notification list to update communication history
        const notifRes = await api.get('/notifications');
        if (notifRes.success && notifRes.data) {
          const enquiries = notifRes.data.filter(n =>
            (n.type === 'enquiry' || n.type === 'parent_message') &&
            (String(n.sender?._id || n.sender) === String(user?._id) ||
             String(n.recipient?._id || n.recipient) === String(user?._id))
          );
          setCommunicationHistory(enquiries);
        }
      }
    } catch (err) {
      setEnquiryFeedback({ type: 'error', text: err.message || 'Failed to send message.' });
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  const handleSaveChildInfo = (e) => {
    e.preventDefault();
    localStorage.setItem(`emergencyPhone_${user?._id}`, emergencyPhone);
    localStorage.setItem(`healthNotes_${user?._id}`, healthNotes);
    setSaveFeedback('Child information details saved successfully!');
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-48 glass-card rounded-2xl animate-pulse md:col-span-2"></div>
          <div className="h-48 glass-card rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Calculate attendance stats
  const totalDays = attendance.length;
  const presentDays = attendance.filter(a => a.status === 'present').length;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

  return (
    <div className="space-y-6 pb-12 font-sans text-left">
      
      {/* Welcome Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-brand-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-brand-500/[0.04] to-safari-500/[0.04]">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-brand-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/25">
            <Baby className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">
              {user?.childName ? `${user.childName}'s Portal` : "Child's Portal"}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Classroom: <span className="font-semibold text-brand-550 dark:text-brand-400">{user?.classroom || 'Nursery-A'}</span>
            </p>
          </div>
        </div>

        <div className="flex space-x-6 text-left">
          <div className="border-l border-slate-200 dark:border-slate-800 pl-4">
            <span className="text-[10px] font-bold text-slate-450 uppercase block">Attendance Rate</span>
            <span className="text-lg font-black text-slate-800 dark:text-white mt-0.5 block">{attendanceRate}%</span>
          </div>
          <div className="border-l border-slate-200 dark:border-slate-800 pl-4">
            <span className="text-[10px] font-bold text-slate-450 uppercase block">Milestones Completed</span>
            <span className="text-lg font-black text-emerald-500 mt-0.5 block">
              {progress?.skills ? progress.skills.filter(s => s.score >= 80).length : 4} / 5
            </span>
          </div>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex items-center space-x-1.5 border-b border-slate-200/60 dark:border-slate-800/40 pb-1.5 overflow-x-auto select-none">
        {[
          { id: 'progress', label: 'Learning Progress', icon: Award },
          { id: 'lessons', label: 'Weekly Lessons', icon: BookOpen },
          { id: 'notices', label: 'Notice Board', icon: Megaphone },
          { id: 'enquiry', label: 'Message Teacher', icon: MessageSquare },
          { id: 'child_info', label: 'Child Info Management', icon: UserIcon }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold font-sans whitespace-nowrap transition-all flex items-center space-x-2 border ${
                activeTab === tab.id
                  ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/10'
                  : 'bg-slate-100/50 hover:bg-slate-200/70 border-transparent dark:bg-slate-900/60 dark:hover:bg-slate-800/80 text-slate-550 dark:text-slate-400'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="mt-6">
        
        {/* A. TAB: LEARNING PROGRESS */}
        {activeTab === 'progress' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            
            {/* Milestones grid */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/20 space-y-6">
                <h3 className="font-bold text-base text-slate-850 dark:text-white flex items-center">
                  <Award className="h-5 w-5 mr-2 text-brand-500" /> Early Learning Milestones
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {progress?.skills ? (
                    progress.skills.map((skill) => (
                      <div key={skill.skillName} className="p-4 bg-slate-50 dark:bg-slate-900/35 border border-slate-100 dark:border-slate-800/40 rounded-xl space-y-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-705 dark:text-slate-300">{skill.skillName}</span>
                          <span className="text-xs font-black text-brand-500">{skill.score}%</span>
                        </div>
                        <div className="w-full bg-slate-200/60 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-brand-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${skill.score}%` }}
                          ></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Default milestones
                    [
                      { skillName: 'Cognitive Development', score: 85 },
                      { skillName: 'Gross Motor Skills', score: 90 },
                      { skillName: 'Sensory Play', score: 95 },
                      { skillName: 'Social-Emotional Development', score: 80 },
                      { skillName: 'Language & Communication', score: 88 }
                    ].map((skill) => (
                      <div key={skill.skillName} className="p-4 bg-slate-50 dark:bg-slate-900/35 border border-slate-100 dark:border-slate-800/40 rounded-xl space-y-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-705 dark:text-slate-300">{skill.skillName}</span>
                          <span className="text-xs font-black text-brand-500">{skill.score}%</span>
                        </div>
                        <div className="w-full bg-slate-200/60 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-brand-500 h-full rounded-full"
                            style={{ width: `${skill.score}%` }}
                          ></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Teacher Observation Notes */}
                <div className="p-4 bg-purple-500/[0.03] dark:bg-slate-900/20 border border-brand-500/10 rounded-2xl flex items-start space-x-3 mt-4">
                  <MessageSquare className="h-5 w-5 text-brand-550 dark:text-brand-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-brand-655 dark:text-brand-450 uppercase tracking-wider">Teacher Observation Feedback</h4>
                    <p className="text-xs font-medium text-slate-655 dark:text-slate-300 leading-relaxed mt-1.5">
                      {progress?.teacherFeedback || "Aarav shows great curiosity during water play and float/sink experiments. Excellent fine motor progress, highly active and visual learner."}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Attendance ledger card */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/20">
              <h3 className="font-bold text-base text-slate-850 dark:text-white flex items-center mb-4">
                <Calendar className="h-5 w-5 mr-2 text-brand-500" /> Attendance Ledger
              </h3>
              
              {attendance.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs italic">
                  No attendance records logged for Aarav this week.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {attendance.slice(0, 7).map((log) => (
                    <div key={log._id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/25 border border-slate-100 dark:border-slate-800/40 rounded-xl">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {new Date(log.date).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                      </span>
                      {log.status === 'present' ? (
                        <span className="inline-flex items-center text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg dark:bg-emerald-950/20 dark:text-emerald-450">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Present
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] text-red-655 font-bold bg-red-50 px-2 py-0.5 rounded-lg dark:bg-red-950/20 dark:text-red-450">
                          <XCircle className="h-3 w-3 mr-1" /> Absent
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* B. TAB: WEEKLY LESSONS */}
        {activeTab === 'lessons' && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/20">
              <h3 className="font-bold text-base text-slate-850 dark:text-white flex items-center mb-1">
                <BookOpen className="h-5 w-5 mr-2 text-brand-500" /> Classroom Weekly Lesson Content
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">
                Review what Aarav is learning in the classroom this week. Preview linked activities, rhymes, stories, and worksheets.
              </p>

              {lessons.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-slate-150 dark:border-slate-800 rounded-3xl">
                  <BookOpen className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                  <h4 className="font-bold text-sm text-slate-700 dark:text-white">No active lessons scheduled</h4>
                  <p className="text-slate-405 text-xs mt-1">Check back soon when the teacher updates the weekly planner.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {lessons.map((lesson) => (
                    <div key={lesson._id} className="p-5 bg-slate-50 dark:bg-slate-900/35 border border-slate-150 dark:border-slate-800 rounded-2xl space-y-4">
                      
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] bg-brand-500/10 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-lg font-bold">
                          {lesson.subjectArea}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold font-mono">
                          {new Date(lesson.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-sm text-slate-800 dark:text-white leading-tight">
                          {lesson.topic}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          <span className="font-bold text-slate-700 dark:text-slate-300">Goal:</span> {lesson.learningGoal}
                        </p>
                      </div>

                      {/* Content Breakdowns */}
                      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/40">
                        {/* Stories & Rhymes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {lesson.storyTime && (
                            <div className="flex items-start space-x-1.5 p-2 bg-purple-500/[0.03] border border-purple-500/10 rounded-xl">
                              <Bookmark className="h-4.5 w-4.5 text-purple-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="text-[9px] uppercase font-bold text-purple-600 block">Circle Time Story</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-350">{lesson.storyTime}</span>
                              </div>
                            </div>
                          )}
                          {lesson.rhymes && (
                            <div className="flex items-start space-x-1.5 p-2 bg-amber-500/[0.03] border border-amber-500/10 rounded-xl">
                              <Music className="h-4.5 w-4.5 text-amber-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="text-[9px] uppercase font-bold text-amber-600 block">Class Rhymes</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-350">{lesson.rhymes}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Activities */}
                        {lesson.activities && lesson.activities.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Class Activities</span>
                            <div className="flex flex-wrap gap-1.5">
                              {lesson.activities.map((act) => (
                                <span key={act._id} className="px-2.5 py-1 bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 text-slate-655 dark:text-slate-350 text-[10px] font-semibold rounded-lg">
                                  {act.name} ({act.category})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Worksheets */}
                        <div 
                          className="flex items-start justify-between space-x-2 text-xs border border-transparent border-dashed p-2 rounded-xl transition-all hover:bg-brand-500/5 hover:border-brand-500/10"
                        >
                          <div 
                            onClick={() => setSelectedWorksheetLesson(lesson)}
                            className="flex items-start space-x-2 cursor-pointer flex-1"
                            title="Click to view full worksheet and lyrics"
                          >
                            <FileText className="h-4.5 w-4.5 text-brand-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block flex items-center gap-1">
                                Worksheet Assessment <span className="text-[9px] bg-brand-500/10 text-brand-600 px-1 rounded-sm">Click to Open</span>
                              </span>
                              <p className="text-slate-600 dark:text-slate-300 font-medium">
                                {lesson.assessmentMethod || "Observational quiz matching cloudy cards with symbols."}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadWorksheet(lesson);
                            }}
                            className="p-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors flex items-center justify-center self-center"
                            title="Download Worksheet Guide"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>

                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        )}

        {/* C. TAB: NOTICE BOARD */}
        {activeTab === 'notices' && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/20">
              <h3 className="font-bold text-base text-slate-850 dark:text-white flex items-center mb-4">
                <Megaphone className="h-5 w-5 mr-2 text-brand-500" /> School Bulletins & Notifications
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notices.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs italic md:col-span-2">
                    No announcements posted for this classroom branch.
                  </div>
                ) : (
                  notices.map((notice) => (
                    <div key={notice._id} className="p-5 bg-slate-50 hover:bg-slate-100/60 dark:bg-slate-900/25 dark:hover:bg-slate-900/40 border border-slate-150 dark:border-slate-850 rounded-2xl transition-all space-y-3 flex flex-col justify-between">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-805 dark:text-white leading-tight">{notice.title}</h4>
                        <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed mt-2 font-medium">
                          {notice.content}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-3 border-t border-slate-100 dark:border-slate-800/35">
                        <span>Audience: {notice.targetClassroom || 'All Classrooms'}</span>
                        <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* D. TAB: ENQUIRIES & COMMUNICATION HISTORY */}
        {activeTab === 'enquiry' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            
            {/* Enquiry Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/20 space-y-4">
                <h3 className="font-bold text-base text-slate-850 dark:text-white flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-brand-500" /> Message Teacher
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                  Send a message directly to {user?.childName || "Aarav"}'s assigned classroom teacher: {assignedTeacher ? <span className="font-bold text-brand-550 dark:text-brand-400">{assignedTeacher.name}</span> : 'Loading...'}.
                </p>

                {enquiryFeedback && (
                  <div className={`p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
                    enquiryFeedback.type === 'success' 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/20' 
                      : 'bg-red-500/10 text-red-655 dark:bg-red-950/20'
                  }`}>
                    <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
                    <span>{enquiryFeedback.text}</span>
                  </div>
                )}

                <form onSubmit={handleSendEnquiry} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={enquiryTitle}
                      onChange={(e) => setEnquiryTitle(e.target.value)}
                      placeholder="e.g. Question regarding today's learning activity"
                      className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                      Message Content
                    </label>
                    <textarea
                      required
                      value={enquiryMessage}
                      onChange={(e) => setEnquiryMessage(e.target.value)}
                      placeholder="Enter your message here..."
                      rows={4}
                      className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingEnquiry || !enquiryTitle || !enquiryMessage}
                      className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all flex items-center space-x-1.5"
                    >
                      {submittingEnquiry ? (
                        <div className="animate-spin rounded-full h-4.5 w-4.5 border-t-2 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* History Column */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/20 flex flex-col">
              <h3 className="font-bold text-base text-slate-850 dark:text-white flex items-center mb-4">
                <Clock className="h-5 w-5 mr-2 text-brand-500" /> Communication Log
              </h3>
              
              <div className="space-y-4 flex-1 overflow-y-auto max-h-[350px]">
                {communicationHistory.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs italic">
                    No sent enquiries recorded.
                  </div>
                ) : (
                  communicationHistory.map((item) => {
                    const isResponse = item.recipient === user?._id;
                    return (
                      <div key={item._id} className={`p-3 border rounded-xl space-y-1.5 text-left transition-colors ${
                        isResponse 
                          ? 'bg-purple-500/[0.03] border-purple-500/15'
                          : 'bg-slate-50 dark:bg-slate-900/25 border-slate-100 dark:border-slate-800/40'
                      }`}>
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-xs text-slate-800 dark:text-white truncate max-w-[120px]">
                            {item.title.replace('Enquiry: ', '').replace('Response to: ', '')}
                          </h4>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${
                            isResponse
                              ? 'bg-purple-100 text-purple-600 dark:bg-purple-950/20'
                              : 'bg-brand-500/10 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400'
                          }`}>
                            {isResponse ? 'Response' : 'Sent'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-655 dark:text-slate-400 leading-snug">{item.message}</p>
                        <span className="text-[9px] text-slate-400 block font-mono">
                          {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}

        {/* E. TAB: CHILD INFORMATION MANAGEMENT */}
        {activeTab === 'child_info' && (
          <div className="max-w-2xl animate-fade-in">
            <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/20 space-y-4">
              <h3 className="font-bold text-base text-slate-850 dark:text-white flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-brand-500" /> Child Information Management
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                Review child profiles and manage registered emergency contacts or healthcare observation alerts.
              </p>

              {saveFeedback && (
                <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/20 rounded-xl text-xs font-semibold flex items-center space-x-2 border border-emerald-500/15 animate-fade-in">
                  <CheckCircle2 className="h-4.5 w-4.5" />
                  <span>{saveFeedback}</span>
                </div>
              )}

              <form onSubmit={handleSaveChildInfo} className="space-y-4 pt-2">
                
                {/* Child Name (Readonly) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Registered Student Name</label>
                    <input
                      type="text"
                      disabled
                      value={user?.childName || 'Aarav Patel'}
                      className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-100/80 text-slate-500 dark:bg-slate-900/60 dark:text-slate-400 cursor-not-allowed border border-transparent font-semibold font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Classroom Group</label>
                    <input
                      type="text"
                      disabled
                      value={user?.classroom || 'Nursery-A'}
                      className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-100/80 text-slate-500 dark:bg-slate-900/60 dark:text-slate-400 cursor-not-allowed border border-transparent font-semibold font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Primary Parent Phone */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Primary Parent Phone</label>
                    <input
                      type="text"
                      disabled
                      value={user?.phoneNumber || '+91 98765 43214'}
                      className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-100/80 text-slate-500 dark:bg-slate-900/60 dark:text-slate-400 cursor-not-allowed border border-transparent font-semibold font-sans"
                    />
                  </div>
                  {/* Emergency Contact */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Emergency Contact Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm glass-input font-sans font-semibold text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Health/Allergy Notes */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Child Medical & Allergy Warnings</label>
                  <textarea
                    value={healthNotes}
                    onChange={(e) => setHealthNotes(e.target.value)}
                    rows={3}
                    placeholder="Describe any food allergies, medication needs, or physical alerts here..."
                    className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans text-slate-800 dark:text-white font-medium"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow transition-all"
                  >
                    Save Emergency Info
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}
      </div>

      {/* Worksheet Modal Overlay */}
      {selectedWorksheetLesson && (() => {
        const rhymeData = getRhymesDetails(selectedWorksheetLesson.rhymes);
        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in text-left">
            <div className="bg-white dark:bg-slate-900 border border-slate-205/50 dark:border-slate-800/15 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-scale-up font-sans">
              
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-brand-500/[0.04] to-purple-500/[0.04] flex justify-between items-center">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-black text-brand-500 tracking-wider">
                    Parent Learning Guide & Worksheet
                  </span>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">
                    {selectedWorksheetLesson.topic}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedWorksheetLesson(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <XCircle className="h-6 w-6 text-slate-400" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                
                {/* Learning Objectives / Assessment Details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-705 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-brand-500" /> Worksheet Assessment Details
                  </h4>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-150/40 dark:border-slate-800/30 rounded-2xl">
                    <p className="text-xs text-slate-655 dark:text-slate-300 font-medium leading-relaxed font-sans">
                      {selectedWorksheetLesson.assessmentMethod || "Observational quiz matching cloudy cards with symbols."}
                    </p>
                    <div className="mt-4 p-3.5 bg-brand-500/[0.02] border border-brand-500/10 rounded-xl">
                      <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider block mb-1">
                        Parent Home Action Guide:
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-455 leading-relaxed font-sans font-medium">
                        Guide your child in tracing, identifying, or acting out the classroom activity details. You can encourage them to speak the answers out loud or draw matching items on a blank paper.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lesson Goal Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-slate-150/40 dark:border-slate-800/30 rounded-2xl">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Subject Area</span>
                    <span className="text-xs font-bold text-slate-750 dark:text-slate-200">{selectedWorksheetLesson.subjectArea}</span>
                  </div>
                  <div className="p-4 border border-slate-150/40 dark:border-slate-800/30 rounded-2xl">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Target Skill Goal</span>
                    <span className="text-xs font-bold text-slate-750 dark:text-slate-200">{selectedWorksheetLesson.learningGoal}</span>
                  </div>
                </div>

                {/* Rhymes & Lyrics Practice Corner */}
                {selectedWorksheetLesson.rhymes && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-705 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Music className="h-4 w-4 text-purple-500" /> Practise Class Rhyme at Home
                    </h4>
                    <div className="p-5 bg-purple-500/[0.02] dark:bg-purple-955/[0.02] border border-purple-500/10 rounded-2xl space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400">
                          {rhymeData.title}
                        </span>
                        <span className="text-[9px] font-bold text-purple-400 font-mono">SING ALONG</span>
                      </div>
                      
                      {/* Lyrics block */}
                      <div className="p-4 bg-white dark:bg-slate-950 border border-purple-500/5 dark:border-purple-500/5 rounded-xl text-center py-6">
                        <div className="space-y-1.5 font-medium italic text-slate-655 dark:text-slate-300 text-xs">
                          {rhymeData.lyrics.map((line, lidx) => (
                            <p key={lidx} className={line === "" ? "h-3" : ""}>
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>
                      
                      <p className="text-[10px] text-slate-455 dark:text-slate-500 italic text-center font-sans leading-relaxed">
                        Tip: Singing together reinforces word recall, sensory processing, and makes learning fun!
                      </p>
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end items-center gap-2">
                <button
                  onClick={() => downloadWorksheet(selectedWorksheetLesson)}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1 shadow-md shadow-brand-500/10 transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" /> Download PDF Guide
                </button>
                <button
                  onClick={() => setSelectedWorksheetLesson(null)}
                  className="bg-slate-150 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};

export default ParentPortal;
