import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Plus, 
  Search, 
  Heart, 
  Clock, 
  Tag, 
  BookOpen, 
  Check, 
  AlertCircle,
  X,
  FileText,
  Bookmark,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

const Activities = () => {
  const { user } = useAuth();

  if (user?.role !== 'teacher') {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400 font-sans">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-205/50 dark:border-slate-800/15 rounded-2xl p-8 shadow-sm text-left">
          <ShieldAlert className="h-10 w-10 text-red-500 mx-auto mb-4 animate-pulse" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white text-center">Access Denied</h3>
          <p className="text-xs mt-1 text-slate-500 dark:text-slate-400 text-center">You do not have teacher permissions to access the Activities Library.</p>
        </div>
      </div>
    );
  }
  
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  
  // Link to curriculum states
  const [userPlans, setUserPlans] = useState([]);
  const [showAddToCurriculumModal, setShowAddToCurriculumModal] = useState(false);
  const [activityToLink, setActivityToLink] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [linkingLoading, setLinkingLoading] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Art & Craft');
  const [ageGroup, setAgeGroup] = useState('3-4 years');
  const [duration, setDuration] = useState(30);
  const [materials, setMaterials] = useState('');
  const [instructions, setInstructions] = useState('');
  const [learningOutcome, setLearningOutcome] = useState('');

  const categories = [
    'Art & Craft',
    'Language Development',
    'Mathematics',
    'Science Exploration',
    'Music & Dance',
    'Storytelling',
    'Outdoor Activities',
    'Fine Motor Skills',
    'Gross Motor Skills'
  ];

  const ageGroups = ['2-3 years (Toddlers)', '3-4 years (Nursery)', '4-5 years (LKG)', '5-6 years (UKG)'];

  const fetchActivities = async () => {
    try {
      let endpoint = '/activities';
      const params = [];
      if (categoryFilter !== 'all') params.push(`category=${categoryFilter}`);
      if (search) params.push(`search=${search}`);
      if (favoritesOnly) params.push('favoritesOnly=true');
      
      if (params.length > 0) {
        endpoint += `?${params.join('&')}`;
      }
      
      const response = await api.get(endpoint);
      if (response.success && response.data) {
        setActivities(response.data);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [categoryFilter, search, favoritesOnly, user?.role]);

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    try {
      const body = {
        name,
        category,
        ageGroup,
        duration,
        materialsRequired: materials.split('\n').filter(Boolean),
        instructions: instructions.split('\n').filter(Boolean),
        learningOutcome
      };
      
      const response = await api.post('/activities', body);
      if (response.success) {
        fetchActivities();
        resetForm();
        setShowCreateModal(false);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      const response = await api.post(`/activities/${id}/toggle-favorite`);
      if (response.success) {
        // Optimistically update
        setActivities(prev => 
          prev.map(act => {
            if (act._id === id) {
              const favoriteBy = act.favoriteBy || [];
              const index = favoriteBy.indexOf(user._id);
              if (index === -1) {
                return { ...act, favoriteBy: [...favoriteBy, user._id] };
              } else {
                return { ...act, favoriteBy: favoriteBy.filter(fid => fid !== user._id) };
              }
            }
            return act;
          })
        );
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const resetForm = () => {
    setName('');
    setCategory('Art & Craft');
    setAgeGroup('3-4 years');
    setDuration(30);
    setMaterials('');
    setInstructions('');
    setLearningOutcome('');
  };

  const handleOpenLinkModal = async (activity) => {
    setActivityToLink(activity);
    setSelectedPlanId('');
    try {
      const response = await api.get('/curriculum');
      if (response.success && response.data) {
        const filtered = response.data.filter(p => 
          p.createdBy && 
          (p.createdBy._id === user._id || p.createdBy === user._id)
        );
        setUserPlans(filtered);
        if (filtered.length > 0) {
          setSelectedPlanId(filtered[0]._id);
        }
      }
      setShowAddToCurriculumModal(true);
    } catch (err) {
      alert('Failed to load your curriculum plans: ' + err.message);
    }
  };

  const handleLinkActivity = async (e) => {
    e.preventDefault();
    if (!selectedPlanId || !activityToLink) return;
    setLinkingLoading(true);
    try {
      const planRes = await api.get(`/curriculum/${selectedPlanId}`);
      if (planRes.success && planRes.data) {
        const currentActivities = planRes.data.activities || [];
        const alreadyLinked = currentActivities.some(act => 
          (act._id || act) === activityToLink._id
        );
        
        if (alreadyLinked) {
          alert('This activity is already linked to the selected curriculum plan.');
          setShowAddToCurriculumModal(false);
          return;
        }
        
        const updatedActivityIds = [...currentActivities.map(a => a._id || a), activityToLink._id];
        
        const updateRes = await api.put(`/curriculum/${selectedPlanId}`, {
          activities: updatedActivityIds
        });
        
        if (updateRes.success) {
          alert('Activity added successfully to curriculum.');
          setShowAddToCurriculumModal(false);
        }
      }
    } catch (err) {
      alert('Failed to link activity: ' + err.message);
    } finally {
      setLinkingLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white font-sans">Institutional Activities Library</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-sans mt-0.5">
            Access a bank of vetted early childhood learning blueprints. Star activities to add to your favorites.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 transition-all font-sans"
        >
          <Plus className="h-4.5 w-4.5 mr-1.5" /> Add Custom Activity
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by keyword or material..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm glass-input font-sans"
            />
          </div>

          {/* Favorites Star Switch */}
          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`flex items-center justify-center py-2 px-4 rounded-xl border text-xs font-bold transition-all duration-150 font-sans ${
              favoritesOnly
                ? 'bg-rose-500/10 border-rose-400 text-rose-600 dark:bg-rose-950/45 dark:text-rose-400 shadow-sm'
                : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40 text-slate-500 dark:text-slate-400'
            }`}
          >
            <Heart className={`h-4 w-4 mr-1.5 ${favoritesOnly ? 'fill-rose-500 text-rose-500' : ''}`} />
            Starred Only
          </button>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 select-none">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold font-sans whitespace-nowrap transition-all ${
              categoryFilter === 'all'
                ? 'bg-brand-500 text-white'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}
          >
            All Areas
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold font-sans whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of activities */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-48 glass-card rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="glass-card rounded-3xl p-16 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bookmark className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white font-sans">No activities logged</h3>
          <p className="text-slate-400 text-xs font-sans max-w-sm mx-auto mt-1">
            Try choosing a different category or click Add Custom Activity to input a new lesson resource.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((act) => {
            const isFav = act.favoriteBy && act.favoriteBy.includes(user?._id);
            return (
              <div 
                key={act._id} 
                className="glass-card p-5 rounded-2xl flex flex-col justify-between border-t border-slate-200 dark:border-slate-800 relative group"
              >
                {/* Favorite Star Button */}
                <button
                  onClick={() => handleToggleFavorite(act._id)}
                  className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors z-10"
                >
                  <Heart className={`h-4.5 w-4.5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] uppercase font-bold text-brand-500 bg-brand-50/70 dark:bg-brand-950/20 px-2 py-0.5 rounded-md">
                      {act.category}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-base text-slate-800 dark:text-white font-sans group-hover:text-brand-500 transition-colors">
                      {act.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-sans leading-relaxed mt-1 line-clamp-2">
                      {act.learningOutcome}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 text-[10px] text-slate-400 dark:text-slate-500 font-sans pt-1">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" /> {act.duration} mins
                    </span>
                    <span className="flex items-center">
                      <Tag className="h-3 w-3 mr-1" /> {act.ageGroup}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/35 flex justify-between items-center">
                  <button
                    onClick={() => handleOpenLinkModal(act)}
                    className="text-xs bg-brand-500 hover:bg-brand-600 text-white font-bold px-3 py-1.5 rounded-xl flex items-center transition-all shadow-xs"
                  >
                    Add To Curriculum
                  </button>
                  <button
                    onClick={() => setSelectedActivity(act)}
                    className="text-xs text-brand-500 hover:text-brand-600 font-bold font-sans flex items-center"
                  >
                    Open Blueprint <ChevronRight className="h-4 w-4 ml-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE ACTIVITY MODAL */}
      {showCreateModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[80vh] flex flex-col animate-scale-up">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/40 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/35">
              <div>
                <h3 className="font-bold text-base text-slate-800 dark:text-white font-sans">Add Activity Template</h3>
                <p className="text-xs text-slate-400 dark:text-slate-400 font-sans">Store custom lesson blocks inside the institution catalog.</p>
              </div>
              <button 
                onClick={() => {
                  resetForm();
                  setShowCreateModal(false);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-semibold text-sm"
              >
                Close
              </button>
            </div>

            {/* Scrollable Form */}
            <form onSubmit={handleCreateActivity} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-sans">
                  Activity Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Muddy Puddle Sensory Play"
                  className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-sans">
                    Category Area
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm glass-input font-sans"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-sans">
                    Target Age Group
                  </label>
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm glass-input font-sans"
                  >
                    {ageGroups.map(ag => <option key={ag} value={ag.split(' ')[0]}>{ag}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-sans">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  required
                  min={5}
                  max={120}
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-sans">
                  Learning Outcome Goal
                </label>
                <input
                  type="text"
                  required
                  value={learningOutcome}
                  onChange={(e) => setLearningOutcome(e.target.value)}
                  placeholder="e.g. Explains weather cycle changes in their own words"
                  className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-1 font-sans">
                  Materials Required (One per line)
                </label>
                <textarea
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  placeholder="e.g. Sponges&#10;White Paint&#10;Glitter"
                  rows={2}
                  className="w-full px-4 py-2 rounded-xl text-sm glass-input font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-1 font-sans">
                  Teaching Instructions (One step per line)
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Dab sponge into white paint.&#10;Gently press sponge on blue chart paper."
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl text-sm glass-input font-sans"
                />
              </div>

            </form>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800/40 bg-slate-50 dark:bg-slate-900/25 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowCreateModal(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-white font-sans"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateActivity}
                disabled={!name || !learningOutcome}
                className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold font-sans shadow shadow-brand-500/15"
              >
                Save to Database
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* DETAIL DRAWER / MODAL */}
      {selectedActivity && createPortal(
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] overflow-y-auto">
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
                onClick={() => setSelectedActivity(null)}
                className="text-slate-500 hover:text-slate-600 dark:hover:text-white font-semibold text-sm"
              >
                Close
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
                  {selectedActivity.materialsRequired.length === 0 ? (
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
                  {selectedActivity.instructions.map((step, idx) => (
                    <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-700 dark:text-slate-350 font-sans leading-relaxed">
                      <span className="w-5 h-5 rounded-full bg-brand-500 text-white font-bold text-[9px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800/40 bg-slate-50 dark:bg-slate-900/25 flex justify-end">
              <button
                onClick={() => setSelectedActivity(null)}
                className="px-5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800/50 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 font-sans transition-all"
              >
                Dismiss Detail
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* ADD TO CURRICULUM PLAN MODAL */}
      {showAddToCurriculumModal && activityToLink && createPortal(
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] overflow-y-auto animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-scale-up">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/40 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/35 text-left">
              <div>
                <h3 className="font-bold text-base text-slate-800 dark:text-white font-sans">Add Activity to Curriculum</h3>
                <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">Select a curriculum plan to link "{activityToLink.name}"</p>
              </div>
              <button 
                onClick={() => setShowAddToCurriculumModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleLinkActivity} className="p-6 space-y-4 text-left">
              {userPlans.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs italic">
                  You have not created any curriculum plans yet. Click "+ Create Curriculum" on the Curriculum page to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">
                      Select Curriculum Plan
                    </label>
                    <select
                      value={selectedPlanId}
                      onChange={(e) => setSelectedPlanId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-xs glass-input font-sans text-slate-800 dark:text-white"
                      required
                    >
                      {userPlans.map(plan => (
                        <option key={plan._id} value={plan._id}>
                          {plan.title} ({plan.month} - {plan.themeName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Activity Preview</span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white block">{activityToLink.name}</span>
                    <span className="text-[10px] text-slate-400 block">Category: {activityToLink.category} • Duration: {activityToLink.duration} mins</span>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/40 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddToCurriculumModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/60 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-300"
                >
                  Cancel
                </button>
                {userPlans.length > 0 && (
                  <button
                    type="submit"
                    disabled={linkingLoading}
                    className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold font-sans shadow shadow-brand-500/15"
                  >
                    {linkingLoading ? 'Linking...' : 'Add To Curriculum'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default Activities;
