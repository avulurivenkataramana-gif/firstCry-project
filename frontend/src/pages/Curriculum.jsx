import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Plus, 
  Search, 
  Filter, 
  Table, 
  Grid, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Trash2, 
  Edit, 
  Eye, 
  Send,
  MessageSquare,
  ChevronRight,
  Sparkles,
  BookOpen,
  X,
  Target,
  Calendar
} from 'lucide-react';

const Curriculum = () => {
  const { user } = useAuth();
  
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table', 'grid', 'timeline'
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  // Selected activity for blueprint modal
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  
  // Review/Feedback state
  const [feedback, setFeedback] = useState('');
  
  // Form state
  const [title, setTitle] = useState('');
  const [themeName, setThemeName] = useState('');
  const [description, setDescription] = useState('');
  const [month, setMonth] = useState('June');
  const [academicYear, setAcademicYear] = useState('2026-27');
  const [learningObjectives, setLearningObjectives] = useState(['']);
  const [learningOutcomes, setLearningOutcomes] = useState(['']);
  const [skillsCovered, setSkillsCovered] = useState([]);
  const [week1, setWeek1] = useState('');
  const [week2, setWeek2] = useState('');
  const [week3, setWeek3] = useState('');
  const [week4, setWeek4] = useState('');
  const [notes, setNotes] = useState('');

  const months = ['June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May'];
  
  const skillOptions = [
    'Cognitive Development',
    'Gross Motor Skills',
    'Sensory Play',
    'Social-Emotional',
    'Language & Communication',
    'Creative Expression',
    'Scientific Exploration',
    'Storytelling'
  ];

  const fetchPlans = async () => {
    try {
      let endpoint = '/curriculum';
      const params = [];
      if (statusFilter !== 'all') params.push(`status=${statusFilter}`);
      if (search) params.push(`search=${search}`);
      
      if (params.length > 0) {
        endpoint += `?${params.join('&')}`;
      }
      
      const response = await api.get(endpoint);
      if (response.success && response.data) {
        setPlans(response.data);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [statusFilter, search, user?.role]);

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      const body = {
        title,
        themeName,
        description,
        month,
        academicYear,
        learningObjectives: learningObjectives.filter(Boolean),
        learningOutcomes: learningOutcomes.filter(Boolean),
        skillsCovered,
        weeklyBreakdown: { week1, week2, week3, week4 },
        notes
      };
      
      const response = await api.post('/curriculum', body);
      if (response.success) {
        fetchPlans();
        resetForm();
        setShowCreateModal(false);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmitForApproval = async (id) => {
    try {
      const response = await api.post(`/curriculum/${id}/submit`);
      if (response.success) {
        fetchPlans();
        if (selectedPlan && selectedPlan._id === id) {
          setShowDetailModal(false);
        }
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleApprove = async (id) => {
    try {
      const response = await api.post(`/curriculum/${id}/approve`, { feedback });
      if (response.success) {
        fetchPlans();
        setShowDetailModal(false);
        setFeedback('');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (id) => {
    if (!feedback) {
      alert('Feedback is required to reject a plan.');
      return;
    }
    try {
      const response = await api.post(`/curriculum/${id}/reject`, { feedback });
      if (response.success) {
        fetchPlans();
        setShowDetailModal(false);
        setFeedback('');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this curriculum plan?')) return;
    try {
      const response = await api.delete(`/curriculum/${id}`);
      if (response.success) {
        fetchPlans();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemoveActivity = async (planId, activityId) => {
    if (!window.confirm('Are you sure you want to remove this activity from this curriculum plan?')) return;
    try {
      const activityIds = (selectedPlan.activities || []).map(act => act._id || act);
      const updatedIds = activityIds.filter(id => id !== activityId);
      
      const response = await api.put(`/curriculum/${planId}`, {
        activities: updatedIds
      });
      
      if (response.success) {
        const planResponse = await api.get(`/curriculum/${planId}`);
        if (planResponse.success && planResponse.data) {
          setSelectedPlan(planResponse.data);
        }
        fetchPlans();
      }
    } catch (err) {
      alert('Failed to remove activity: ' + err.message);
    }
  };

  const handleViewActivityDetails = (activity) => {
    setSelectedActivity(activity);
    setShowActivityModal(true);
  };

  const resetForm = () => {
    setTitle('');
    setThemeName('');
    setDescription('');
    setMonth('June');
    setAcademicYear('2026-27');
    setLearningObjectives(['']);
    setLearningOutcomes(['']);
    setSkillsCovered([]);
    setWeek1('');
    setWeek2('');
    setWeek3('');
    setWeek4('');
    setNotes('');
  };

  const handleAddArrayField = (type) => {
    if (type === 'objectives') {
      setLearningObjectives([...learningObjectives, '']);
    } else {
      setLearningOutcomes([...learningOutcomes, '']);
    }
  };

  const handleArrayFieldChange = (type, index, value) => {
    if (type === 'objectives') {
      const updated = [...learningObjectives];
      updated[index] = value;
      setLearningObjectives(updated);
    } else {
      const updated = [...learningOutcomes];
      updated[index] = value;
      setLearningOutcomes(updated);
    }
  };

  const handleSkillToggle = (skill) => {
    if (skillsCovered.includes(skill)) {
      setSkillsCovered(skillsCovered.filter(s => s !== skill));
    } else {
      setSkillsCovered([...skillsCovered, skill]);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/45 dark:text-emerald-400 font-sans">
            <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold bg-red-500/10 text-red-600 dark:bg-red-950/45 dark:text-red-400 font-sans">
            <XCircle className="h-3.5 w-3.5 mr-1" /> Revisions Needed
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-600 dark:bg-blue-950/45 dark:text-blue-400 font-sans">
            <Clock className="h-3.5 w-3.5 mr-1 animate-pulse-subtle" /> Under Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-sans">
            <AlertCircle className="h-3.5 w-3.5 mr-1" /> Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white font-sans">Curriculum Coordinator Planner</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-sans mt-0.5">
            Create academic frameworks, outline monthly learning objectives, and review progress.
          </p>
        </div>

        {user?.role === 'teacher' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 transition-all font-sans"
          >
            <Plus className="h-4.5 w-4.5 mr-1.5" /> Create Curriculum Plan
          </button>
        )}
      </div>

      {/* Filter and View Toggler Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Title or Theme..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm glass-input font-sans"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-3 pr-8 py-2 rounded-xl text-sm glass-input font-sans capitalize appearance-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Revisions Needed</option>
            </select>
            <Filter className="absolute right-3 top-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center space-x-1.5 bg-slate-100/80 dark:bg-slate-900/40 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/10">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-800 shadow-sm text-brand-500' : 'text-slate-400 hover:text-slate-600'}`}
            title="Table View"
          >
            <Table className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 shadow-sm text-brand-500' : 'text-slate-400 hover:text-slate-600'}`}
            title="Card Grid View"
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'timeline' ? 'bg-white dark:bg-slate-800 shadow-sm text-brand-500' : 'text-slate-400 hover:text-slate-600'}`}
            title="Timeline View"
          >
            <Clock className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main List Area */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-20 glass-card rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="glass-card rounded-3xl p-16 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white font-sans">No curriculum plans found</h3>
          <p className="text-slate-400 text-xs font-sans max-w-sm mx-auto mt-1">
            Try adjusting your search filters or click the Create button to start building a new curriculum.
          </p>
        </div>
      ) : (
        <>
          {/* 1. TABLE VIEW */}
          {viewMode === 'table' && (
            <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/30">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800/40 text-slate-400 dark:text-slate-500 uppercase font-semibold">
                      <th className="py-4 pl-6">Curriculum Info</th>
                      <th className="py-4">Theme</th>
                      <th className="py-4">Target Month</th>
                      <th className="py-4">Author</th>
                      <th className="py-4">Status</th>
                      <th className="py-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
                    {plans.map((plan) => (
                      <tr key={plan._id} className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                        <td className="py-4 pl-6">
                          <div className="font-bold text-slate-800 dark:text-white text-sm">{plan.title}</div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Year: {plan.academicYear}</div>
                        </td>
                        <td className="py-4 text-slate-600 dark:text-slate-300 font-medium">{plan.themeName}</td>
                        <td className="py-4">
                          <span className="px-2 py-1 bg-brand-50 text-brand-600 dark:bg-brand-950/35 dark:text-brand-400 rounded-lg font-bold">
                            {plan.month}
                          </span>
                        </td>
                        <td className="py-4 text-slate-500 dark:text-slate-400 font-medium">
                          {plan.createdBy?.name || 'Unknown'}
                        </td>
                        <td className="py-4">{getStatusBadge(plan.status)}</td>
                        <td className="py-4 pr-6 text-right space-x-1.5">
                          <button
                            onClick={() => {
                              setSelectedPlan(plan);
                              setFeedback(plan.feedback || '');
                              setShowDetailModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors"
                            title="View Detail"
                          >
                            <Eye className="h-4.5 w-4.5" />
                          </button>
                          {user?.role === 'teacher' && plan.status === 'draft' && (
                            <button
                              onClick={() => handleSubmitForApproval(plan._id)}
                              className="p-1.5 text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors"
                              title="Submit for Review"
                            >
                              <Send className="h-4.5 w-4.5" />
                            </button>
                          )}
                          {user?.role === 'admin' && (
                            <button
                              onClick={() => handleDelete(plan._id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors"
                              title="Delete Plan"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. GRID CARD VIEW */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan._id} className="glass-card p-5 rounded-2xl flex flex-col justify-between border-t-4 border-t-brand-500">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] bg-brand-50 text-brand-600 dark:bg-brand-950/35 dark:text-brand-400 px-2 py-1 rounded-lg font-bold font-sans">
                        {plan.month} ({plan.academicYear})
                      </span>
                      {getStatusBadge(plan.status)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-slate-800 dark:text-white font-sans leading-tight">
                        {plan.title}
                      </h4>
                      {plan.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-1.5 line-clamp-2 leading-relaxed">
                          {plan.description}
                        </p>
                      )}
                      <p className="text-xs text-slate-550 dark:text-slate-400 font-sans mt-1.5">
                        Theme: <span className="font-semibold text-slate-750 dark:text-slate-300">{plan.themeName}</span>
                      </p>
                    </div>

                    <div className="space-y-1 mt-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 font-sans">Objectives:</span>
                      <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 font-sans">
                        {plan.learningObjectives.slice(0, 2).map((obj, i) => (
                          <li key={i} className="truncate flex items-center">
                            <ChevronRight className="h-3 w-3 text-brand-400 flex-shrink-0 mr-1" /> {obj}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/35 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-sans">
                      By: {plan.createdBy?.name || 'Unknown'}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedPlan(plan);
                        setFeedback(plan.feedback || '');
                        setShowDetailModal(true);
                      }}
                      className="text-xs text-brand-500 hover:text-brand-600 font-bold font-sans flex items-center"
                    >
                      Open Details <ChevronRight className="h-4 w-4 ml-0.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. TIMELINE VIEW */}
          {viewMode === 'timeline' && (
            <div className="relative border-l-2 border-brand-500/20 pl-6 space-y-8 ml-3 font-sans">
              {plans.map((plan, index) => (
                <div key={plan._id} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-brand-500 border-4 border-white dark:border-slate-950 shadow"></div>
                  
                  <div className="glass-card p-5 rounded-2xl max-w-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-brand-600 dark:text-brand-400">{plan.month} Calendar Block</span>
                      {getStatusBadge(plan.status)}
                    </div>
                    <h4 className="font-bold text-base text-slate-800 dark:text-white">{plan.title}</h4>
                    {plan.description && (
                      <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{plan.description}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">Theme focus: {plan.themeName}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-4">
                      {Object.keys(plan.weeklyBreakdown || {}).map((w) => (
                        <div key={w} className="p-2.5 bg-slate-100/50 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/20 rounded-xl text-center">
                          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">{w.replace('week', 'Week ')}</span>
                          <span className="text-xs text-slate-700 dark:text-slate-350 truncate block mt-0.5 font-medium">{plan.weeklyBreakdown[w] || 'Unassigned'}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => {
                          setSelectedPlan(plan);
                          setFeedback(plan.feedback || '');
                          setShowDetailModal(true);
                        }}
                        className="text-xs text-brand-500 hover:text-brand-600 font-bold flex items-center"
                      >
                        Inspect Full Framework <ChevronRight className="h-4 w-4 ml-0.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* CREATE CURRICULUM MODAL */}
      {showCreateModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] overflow-y-auto">
          <div className="w-full max-w-lg md:max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 max-h-[82vh] flex flex-col animate-scale-up">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800/40 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/35">
              <div>
                <h3 className="font-bold text-base text-slate-800 dark:text-white font-sans flex items-center gap-1.5">
                  <Plus className="h-4.5 w-4.5 text-brand-500" />
                  New Curriculum Planner
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-sans mt-0.5">Assemble themes, skills, and monthly goals.</p>
              </div>
              <button 
                type="button"
                onClick={() => {
                  resetForm();
                  setShowCreateModal(false);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-150 dark:hover:bg-slate-800/60 rounded-full transition-all"
                title="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Scrollable */}
            <form onSubmit={handleCreatePlan} className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              
              {/* Section 1: Core Information */}
              <div className="space-y-4 p-5 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center space-x-2 border-b border-slate-105 dark:border-slate-800/40 pb-2 mb-1">
                  <BookOpen className="h-4 w-4 text-brand-500" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider font-sans">Core Information</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Curriculum Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Exploring Rainbow Nature"
                      className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Theme Name</label>
                    <input
                      type="text"
                      required
                      value={themeName}
                      onChange={(e) => setThemeName(e.target.value)}
                      placeholder="e.g. Rainy Weather & Colors"
                      className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Target Month</label>
                    <select
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm glass-input font-sans focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                    >
                      {months.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Academic Year</label>
                    <input
                      type="text"
                      required
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      placeholder="2026-27"
                      className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Curriculum Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief overview of what this curriculum plan covers..."
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Objectives & Skills */}
              <div className="space-y-4 p-5 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center space-x-2 border-b border-slate-105 dark:border-slate-800/40 pb-2 mb-1">
                  <Target className="h-4 w-4 text-brand-500" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider font-sans">Objectives & Skills</span>
                </div>
                
                {/* Objectives array */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-sans">Learning Objectives</label>
                    <button
                      type="button"
                      onClick={() => handleAddArrayField('objectives')}
                      className="text-xs text-brand-500 hover:text-brand-600 font-bold font-sans flex items-center space-x-1"
                    >
                      <span>+ Add Objective</span>
                    </button>
                  </div>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1 scrollbar-thin">
                    {learningObjectives.map((obj, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={obj}
                        onChange={(e) => handleArrayFieldChange('objectives', idx, e.target.value)}
                        placeholder={`Objective #${idx + 1}`}
                        className="w-full px-4 py-2 rounded-xl text-sm glass-input font-sans focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                      />
                    ))}
                  </div>
                </div>

                {/* Outcomes array */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-sans">Learning Outcomes</label>
                    <button
                      type="button"
                      onClick={() => handleAddArrayField('outcomes')}
                      className="text-xs text-brand-500 hover:text-brand-600 font-bold font-sans flex items-center space-x-1"
                    >
                      <span>+ Add Outcome</span>
                    </button>
                  </div>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1 scrollbar-thin">
                    {learningOutcomes.map((out, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={out}
                        onChange={(e) => handleArrayFieldChange('outcomes', idx, e.target.value)}
                        placeholder={`Learning Outcome #${idx + 1}`}
                        className="w-full px-4 py-2 rounded-xl text-sm glass-input font-sans focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                      />
                    ))}
                  </div>
                </div>

                {/* Skills covered - grid of tags */}
                <div className="space-y-2 pt-1">
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-sans">Early Learning Skills Covered</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {skillOptions.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleSkillToggle(skill)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold text-center border font-sans transition-all duration-150 ${
                          skillsCovered.includes(skill)
                            ? 'bg-brand-500/10 border-brand-500 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400'
                            : 'border-slate-200/50 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 3: Weekly Planning & Notes */}
              <div className="space-y-4 p-5 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center space-x-2 border-b border-slate-105 dark:border-slate-800/40 pb-2 mb-1">
                  <Calendar className="h-4 w-4 text-brand-500" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider font-sans">Weekly Focus & Notes</span>
                </div>
                
                {/* Weekly Breakdown fields */}
                <div className="space-y-3">
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-sans">Weekly Focus Outline</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase font-sans">Week 1 Topic</label>
                      <input
                        type="text"
                        value={week1}
                        onChange={(e) => setWeek1(e.target.value)}
                        placeholder="e.g. Clouds & Sensory Play"
                        className="w-full px-3 py-2 rounded-xl text-xs glass-input font-sans focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase font-sans">Week 2 Topic</label>
                      <input
                        type="text"
                        value={week2}
                        onChange={(e) => setWeek2(e.target.value)}
                        placeholder="e.g. Floating Science Test"
                        className="w-full px-3 py-2 rounded-xl text-xs glass-input font-sans focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase font-sans">Week 3 Topic</label>
                      <input
                        type="text"
                        value={week3}
                        onChange={(e) => setWeek3(e.target.value)}
                        placeholder="e.g. Rainbow Coloring & Counting"
                        className="w-full px-3 py-2 rounded-xl text-xs glass-input font-sans focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase font-sans">Week 4 Topic</label>
                      <input
                        type="text"
                        value={week4}
                        onChange={(e) => setWeek4(e.target.value)}
                        placeholder="e.g. Weather Chart Assessment"
                        className="w-full px-3 py-2 rounded-xl text-xs glass-input font-sans focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="pt-1">
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Additional Notes & Equipment</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Items or equipment list coordinators should review..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

            </form>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800/40 bg-slate-50/80 dark:bg-slate-900/45 backdrop-blur-md flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowCreateModal(false);
                }}
                className="px-4.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-white font-sans hover:bg-slate-100 dark:hover:bg-slate-800/45 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePlan}
                disabled={!title || !themeName}
                className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold font-sans shadow shadow-brand-500/15 transition-all"
              >
                Save Draft Framework
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* DETAIL & WORKFLOW MODAL */}
      {showDetailModal && selectedPlan && createPortal(
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 max-h-[80vh] flex flex-col animate-scale-up">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/40 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/35">
              <div>
                <span className="text-[10px] bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400 px-2.5 py-1 rounded-lg font-bold">
                  Academic Framework Plan Detail
                </span>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white font-sans mt-1">{selectedPlan.title}</h3>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setSelectedPlan(null);
                  setFeedback('');
                  setShowDetailModal(false);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-150 dark:hover:bg-slate-800/60 rounded-full transition-all"
                title="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scroll Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Top meta grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-100/50 dark:bg-slate-900/25 border border-slate-200/50 dark:border-slate-800/20 rounded-2xl">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Status</span>
                  <div className="mt-0.5">{getStatusBadge(selectedPlan.status)}</div>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Theme Name</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-white block mt-0.5">{selectedPlan.themeName}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Target Month</span>
                  <span className="text-xs font-bold text-brand-500 block mt-0.5">{selectedPlan.month}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Author</span>
                  <span className="text-xs font-bold text-slate-500 block mt-0.5">{selectedPlan.createdBy?.name || 'Teacher'}</span>
                </div>
              </div>

              {/* Description */}
              {selectedPlan.description && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/10 rounded-2xl border border-slate-200/20 dark:border-slate-800/10">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-sans">Description</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
                    {selectedPlan.description}
                  </p>
                </div>
              )}

              {/* Objectives */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 font-sans">Learning Objectives</h4>
                <ul className="space-y-1.5">
                  {selectedPlan.learningObjectives.map((obj, i) => (
                    <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start">
                      <CheckCircle className="h-4 w-4 text-brand-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="font-sans">{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Outcomes */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 font-sans">Learning Outcomes</h4>
                <ul className="space-y-1.5">
                  {selectedPlan.learningOutcomes.map((out, i) => (
                    <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start">
                      <ChevronRight className="h-4 w-4 text-safari-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="font-sans">{out}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Skills */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 font-sans">Development Skills Covered</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPlan.skillsCovered.map((skill) => (
                    <span 
                      key={skill} 
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-lg font-sans border border-slate-200/40 dark:border-slate-700/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Weekly Focus */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 font-sans">Weekly Focus Breakdown</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.keys(selectedPlan.weeklyBreakdown || {}).map((wk) => (
                    <div key={wk} className="p-3 bg-slate-50 dark:bg-slate-900/10 rounded-xl border border-slate-200/20 dark:border-slate-800/10 flex items-start space-x-2">
                      <div className="bg-brand-500 text-white font-black text-[10px] w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0">
                        {wk.slice(-1)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">{wk.replace('week', 'Week ')}</span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1 block truncate max-w-[200px]">{selectedPlan.weeklyBreakdown[wk] || 'Not Outlined'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedPlan.notes && (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-sans">Equipment & Planning Notes</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-sans italic leading-relaxed">
                    "{selectedPlan.notes}"
                  </p>
                </div>
              )}

              {/* Linked Activities */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/40">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 font-sans flex items-center">
                  <BookOpen className="h-4 w-4 mr-1.5 text-slate-400" /> Linked Activities Library
                </h4>
                {(!selectedPlan.activities || selectedPlan.activities.length === 0) ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-sans italic">
                    No activities linked to this curriculum plan yet. Go to the Activities Library to link activities.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedPlan.activities.map((act) => (
                      <div key={act._id} className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800 rounded-2xl flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="px-2 py-0.5 bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 rounded text-[9px] font-bold uppercase">
                              {act.category || 'General'}
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center font-sans font-medium">
                              <Clock className="h-3 w-3 mr-0.5" /> {act.duration || 30} mins
                            </span>
                          </div>
                          <h5 className="font-bold text-xs text-slate-800 dark:text-white mt-1.5 font-sans truncate">{act.name}</h5>
                          <p className="text-[10px] text-slate-500 line-clamp-2 mt-1 leading-normal font-sans">{act.learningOutcome}</p>
                        </div>
                        <div className="flex space-x-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/40 justify-end">
                          <button
                            type="button"
                            onClick={() => handleViewActivityDetails(act)}
                            className="px-2.5 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60 rounded-lg font-sans border border-slate-200/40 dark:border-slate-700/30"
                          >
                            View Details
                          </button>
                          {user?.role === 'teacher' && (
                            <button
                              type="button"
                              onClick={() => handleRemoveActivity(selectedPlan._id, act._id)}
                              className="px-2.5 py-1 text-[10px] font-bold text-red-500 hover:text-red-750 dark:hover:text-red-400 bg-red-500/10 rounded-lg font-sans flex items-center"
                            >
                              <Trash2 className="h-3 w-3 mr-0.5" /> Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rejection Feedback block */}
              {selectedPlan.feedback && (
                <div className="p-4 bg-amber-500/10 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 rounded-2xl border border-amber-500/20 flex items-start space-x-2.5">
                  <MessageSquare className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold block uppercase tracking-wider">Coordinator Feedback History:</span>
                    <p className="text-xs mt-1 leading-relaxed font-sans font-medium">
                      {selectedPlan.feedback}
                    </p>
                  </div>
                </div>
              )}

              {/* Reviewer actions (only for coordinator / admin, and when plan is submitted) */}
              {(user?.role === 'coordinator' || user?.role === 'admin') && selectedPlan.status === 'submitted' && (
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800/40 space-y-3">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-sans">
                    Review Actions: Coordinator Feedback Notes
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide recommendations or notes for approving/revising..."
                    rows={3}
                    className="w-full px-4 py-2 rounded-xl text-sm glass-input font-sans"
                  />
                  <div className="flex space-x-2 justify-end">
                    <button
                      onClick={() => handleReject(selectedPlan._id)}
                      className="px-4 py-2 bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-500/25 rounded-xl text-xs font-bold font-sans transition-colors"
                    >
                      Reject: Request Revisions
                    </button>
                    <button
                      onClick={() => handleApprove(selectedPlan._id)}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold font-sans shadow shadow-emerald-500/15"
                    >
                      Approve & Release
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800/40 bg-slate-50 dark:bg-slate-900/25 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans">
                Unique Plan ID: {selectedPlan._id}
              </span>
              
              <div className="flex space-x-2">
                {user?.role === 'teacher' && selectedPlan.status === 'draft' && (
                  <button
                    onClick={() => handleSubmitForApproval(selectedPlan._id)}
                    className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs font-sans shadow shadow-brand-500/15 flex items-center"
                  >
                    <Send className="h-3.5 w-3.5 mr-1" /> Submit for Review
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlan(null);
                    setShowDetailModal(false);
                    setFeedback('');
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/60 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-350 font-sans transition-all"
                >
                  Dismiss
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* ACTIVITY BLUEPRINT DETAIL MODAL */}
      {showActivityModal && selectedActivity && createPortal(
        <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[10vh] overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[80vh] flex flex-col animate-scale-up">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/40 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/35">
              <div>
                <span className="text-[10px] bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400 px-2.5 py-1 rounded-lg font-bold">
                  {selectedActivity.category}
                </span>
                <h3 className="font-bold text-base text-slate-800 dark:text-white font-sans mt-1">
                  {selectedActivity.name}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setSelectedActivity(null);
                  setShowActivityModal(false);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-150 dark:hover:bg-slate-800/60 rounded-full transition-all"
                title="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable details */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              
              <div className="flex space-x-6 text-xs text-slate-500 dark:text-slate-400 font-sans border-b border-slate-100 dark:border-slate-800/45 pb-3">
                <div>
                  <span className="font-semibold block uppercase text-[9px] text-slate-400">Target Age:</span>
                  <span className="font-bold text-slate-700 dark:text-white mt-0.5 block">{selectedActivity.ageGroup}</span>
                </div>
                <div>
                  <span className="font-semibold block uppercase text-[9px] text-slate-400">Duration:</span>
                  <span className="font-bold text-brand-550 dark:text-brand-400 mt-0.5 block">{selectedActivity.duration} Mins</span>
                </div>
              </div>

              {/* Learning Outcome */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 font-sans">Learning Outcome Goal</h4>
                <p className="text-sm text-slate-750 dark:text-slate-300 font-sans leading-relaxed">
                  {selectedActivity.learningOutcome}
                </p>
              </div>

              {/* Materials list */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 font-sans">Materials Checklist</h4>
                <div className="flex flex-wrap gap-1.5">
                  {!selectedActivity.materialsRequired || selectedActivity.materialsRequired.length === 0 ? (
                    <span className="text-xs text-slate-400 font-sans italic">None specified</span>
                  ) : (
                    selectedActivity.materialsRequired.map((mat, i) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 text-xs font-semibold rounded-lg font-sans border border-slate-200/50 dark:border-slate-700/40">
                        {mat}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Instructions steps */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 font-sans">Instructions for Teachers</h4>
                <ol className="space-y-2.5">
                  {(!selectedActivity.instructions || selectedActivity.instructions.length === 0) ? (
                    <li className="text-xs text-slate-400 font-sans italic">None specified</li>
                  ) : (
                    selectedActivity.instructions.map((step, idx) => (
                      <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-700 dark:text-slate-350 font-sans leading-relaxed">
                        <span className="w-5 h-5 rounded-full bg-brand-500 text-white font-bold text-[9px] flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))
                  )}
                </ol>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800/40 bg-slate-50 dark:bg-slate-900/25 flex justify-end">
              <button
                onClick={() => {
                  setSelectedActivity(null);
                  setShowActivityModal(false);
                }}
                className="px-5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800/50 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 font-sans transition-all"
              >
                Dismiss Detail
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default Curriculum;
