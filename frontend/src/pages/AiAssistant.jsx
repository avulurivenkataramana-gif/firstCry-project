import React, { useState } from 'react';
import api from '../services/api';
import { 
  Sparkles, 
  BookOpen, 
  Calendar, 
  Layers, 
  Clock, 
  ListChecks, 
  Download, 
  AlertCircle, 
  HelpCircle, 
  Wand2, 
  Check, 
  FileText,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import confetti from 'canvas-confetti';

const AiAssistant = () => {
  const { user } = useAuth();

  if (user?.role !== 'teacher') {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400 font-sans">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-205/50 dark:border-slate-800/15 rounded-2xl p-8 shadow-sm text-left">
          <ShieldAlert className="h-10 w-10 text-red-500 mx-auto mb-4 animate-pulse" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white text-center">Access Denied</h3>
          <p className="text-xs mt-1 text-slate-500 dark:text-slate-400 text-center">You do not have teacher permissions to access the AI Lesson Assistant.</p>
        </div>
      </div>
    );
  }
  const [theme, setTheme] = useState('Rainy Season');
  const [ageGroup, setAgeGroup] = useState('3-4 years');
  const [learningOutcome, setLearningOutcome] = useState('Identify rainbow colors and water cycle');
  const [topic, setTopic] = useState('Rainbow Formations');
  
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [generatedData, setGeneratedData] = useState(null);
  const [activeTab, setActiveTab] = useState('lesson'); // 'lesson', 'story', 'activities', 'worksheets', 'tips'

  const loadingSteps = [
    'Analyzing target child age milestones...',
    'Designing weather and science objectives...',
    'Writing contextual early-learning storyboards...',
    'Composing classroom musical rhymes...',
    'Assembling fine motor worksheets & materials...'
  ];

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedData(null);
    setLoadingStep(0);

    // Simulate stepping through loader stages for visual excellence
    const stepInterval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev < loadingSteps.length - 1) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 450);

    try {
      const response = await api.post('/ai/generate', {
        theme,
        ageGroup,
        learningOutcome,
        topic
      });
      if (response.success && response.data) {
        clearInterval(stepInterval);
        setGeneratedData(response.data);
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      clearInterval(stepInterval);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImportToCalendar = async () => {
    if (!generatedData) return;
    try {
      const body = {
        weekNumber: 1,
        topic: generatedData.meta.topic,
        learningGoal: generatedData.lessonPlan.objectives[1] || generatedData.meta.learningOutcome,
        subjectArea: generatedData.activities[0]?.title.includes('Float') ? 'Science Exploration' : 'Art & Craft',
        activities: [], // Empty linking
        storyTime: generatedData.story.title,
        rhymes: generatedData.rhyme.title,
        assessmentMethod: generatedData.assessments[0] || 'Observe participation',
        duration: generatedData.lessonPlan.duration.includes('30') ? 30 : 45,
        date: new Date('2026-06-15').toISOString().split('T')[0], // target next Monday
        status: 'draft'
      };
      
      const response = await api.post('/lessons', body);
      if (response.success) {
        alert('Lesson Plan imported successfully to next Monday as a Draft! Check the Weekly Planner page.');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
          <Sparkles className="h-6 w-6 mr-2 text-brand-500 animate-pulse-subtle" />
          AI Curriculum Assistant
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
          Generate detailed lesson flows, rhymes, story scripts, worksheet outlines, and materials checklists customized to preschool age groups.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Input form */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/20">
          <h3 className="font-bold text-sm text-slate-850 dark:text-white mb-4 flex items-center">
            <Wand2 className="h-4.5 w-4.5 mr-1.5 text-brand-500" /> Prompt Assistant
          </h3>
          <form onSubmit={handleGenerate} className="space-y-4">
            
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Planning Theme Context
              </label>
              <input
                type="text"
                required
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g. Under the Sea, Seasons, Animals"
                className="w-full px-4 py-2.5 rounded-xl text-xs glass-input"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Target Age Range
              </label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-xs glass-input"
              >
                <option value="2-3 years">2-3 Years (Toddlers)</option>
                <option value="3-4 years">3-4 Years (Nursery)</option>
                <option value="4-5 years">4-5 Years (Kindergarten)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Daily Focus Topic
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Rainbow Colors, Sink/Float Tests"
                className="w-full px-4 py-2.5 rounded-xl text-xs glass-input"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Target Learning Outcome
              </label>
              <textarea
                required
                value={learningOutcome}
                onChange={(e) => setLearningOutcome(e.target.value)}
                placeholder="What skill should the child display by the end of today?"
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl text-xs glass-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl text-xs shadow-lg shadow-brand-500/20 hover:shadow-brand-500/35 transition-all flex items-center justify-center"
            >
              {loading ? 'Generating Curriculums...' : 'Generate Early-Learning Curriculum'}
            </button>
          </form>
        </div>

        {/* Right Output panel */}
        <div className="lg:col-span-2 flex flex-col min-h-[450px]">
          
          {/* 1. Loading Screen */}
          {loading && (
            <div className="glass-card rounded-2xl flex-1 flex flex-col items-center justify-center p-12 text-center select-none border border-slate-200/50 dark:border-slate-800/20">
              <div className="relative flex items-center justify-center mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-500"></div>
                <Sparkles className="absolute h-6 w-6 text-brand-500 animate-pulse-subtle" />
              </div>
              
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Creating Custom Lesson Scheme</h3>
              <p className="text-slate-400 text-xs mt-1 min-h-[16px] animate-pulse">
                {loadingSteps[loadingStep]}
              </p>
            </div>
          )}

          {/* 2. Empty State */}
          {!loading && !generatedData && (
            <div className="glass-card rounded-2xl flex-1 flex flex-col items-center justify-center p-16 text-center border border-slate-200/50 dark:border-slate-800/20">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 rounded-3xl flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-brand-400" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Your generated syllabus details will appear here</h3>
              <p className="text-slate-400 text-xs max-w-sm mt-1 leading-relaxed">
                Input your classroom milestones and themes in the left prompts tab, then click generate to create custom curriculums.
              </p>
            </div>
          )}

          {/* 3. Generated Data Display */}
          {!loading && generatedData && (
            <div className="glass-card rounded-2xl border border-slate-200/50 dark:border-slate-800/20 flex flex-col flex-1 overflow-hidden">
              
              {/* Output Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800/35 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/35">
                <div>
                  <h3 className="font-black text-sm text-slate-850 dark:text-white">
                    {generatedData.lessonPlan.title}
                  </h3>
                  <span className="text-[10px] text-slate-450 dark:text-slate-550 block mt-0.5">
                    Theme: {generatedData.meta.theme} • Target Age: {generatedData.meta.ageGroup}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleImportToCalendar}
                    className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-sm hover:shadow transition-all flex items-center"
                  >
                    <Calendar className="h-3.5 w-3.5 mr-1" /> Import to Calendar
                  </button>
                </div>
              </div>

              {/* Tabs Toggles */}
              <div className="flex items-center space-x-1 border-b border-slate-100 dark:border-slate-800/35 px-4 overflow-x-auto select-none bg-slate-50/20 dark:bg-slate-900/10">
                {[
                  { id: 'lesson', label: 'Lesson Flow', icon: Clock },
                  { id: 'story', label: 'Story & Rhyme', icon: BookOpen },
                  { id: 'activities', label: 'Tactile Activities', icon: Layers },
                  { id: 'worksheets', label: 'Worksheet Blueprint', icon: FileText },
                  { id: 'tips', label: 'Supplies & Tips', icon: ListChecks }
                ].map(t => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`px-4 py-3 text-xs font-bold font-sans whitespace-nowrap transition-all border-b-2 flex items-center space-x-1 ${
                        activeTab === t.id
                          ? 'border-brand-500 text-brand-500 dark:text-brand-400'
                          : 'border-transparent text-slate-450 hover:text-slate-650 hover:border-slate-200'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Panel contents */}
              <div className="flex-1 p-6 overflow-y-auto max-h-[400px]">
                
                {/* A. LESSON FLOW TAB */}
                {activeTab === 'lesson' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Lesson Target Objectives</h4>
                      <ul className="space-y-2">
                        {generatedData.lessonPlan.objectives.map((obj, i) => (
                          <li key={i} className="text-xs text-slate-700 dark:text-slate-350 flex items-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mr-2 mt-1.5 flex-shrink-0"></span>
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-850/45 pt-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Suggested Time Block Schedule</h4>
                      <div className="space-y-3">
                        {generatedData.lessonPlan.flow.map((flow, i) => (
                          <div key={i} className="flex items-center space-x-3.5">
                            <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500 dark:text-slate-400 font-mono">
                              {flow.time}
                            </span>
                            <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                              {flow.activity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* B. STORY & RHYME TAB */}
                {activeTab === 'story' && (
                  <div className="space-y-6">
                    {/* Story section */}
                    <div className="p-4 bg-purple-500/[0.03] dark:bg-slate-900/30 rounded-2xl border border-brand-500/10">
                      <h4 className="text-xs font-bold text-brand-650 dark:text-brand-400 uppercase tracking-wider mb-1 flex items-center">
                        Circle-Time Story: "{generatedData.story.title}"
                      </h4>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-2 whitespace-pre-line font-medium">
                        {generatedData.story.content}
                      </p>
                    </div>

                    {/* Rhymes section */}
                    <div className="p-4 bg-amber-500/[0.03] dark:bg-slate-900/30 rounded-2xl border border-amber-500/10">
                      <h4 className="text-xs font-bold text-amber-650 dark:text-amber-400 uppercase tracking-wider mb-1">
                        Song rehearsal: "{generatedData.rhyme.title}"
                      </h4>
                      <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed mt-2 whitespace-pre-line font-mono font-medium p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                        {generatedData.rhyme.content}
                      </p>
                    </div>
                  </div>
                )}

                {/* C. TACTILE ACTIVITIES TAB */}
                {activeTab === 'activities' && (
                  <div className="space-y-4">
                    {generatedData.activities.map((act, i) => (
                      <div key={i} className="p-4 bg-slate-50 dark:bg-slate-900/15 border border-slate-150 dark:border-slate-850 rounded-2xl">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-extrabold text-xs text-slate-800 dark:text-white">
                            {act.title}
                          </h4>
                          <span className="text-[9px] text-brand-500 font-bold">{act.skills}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1.5 font-medium">
                          {act.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* D. WORKSHEET BLUEPRINT */}
                {activeTab === 'worksheets' && (
                  <div className="space-y-4">
                    {generatedData.worksheets.map((sheet, i) => (
                      <div key={i} className="p-4 bg-slate-50 dark:bg-slate-900/15 border border-slate-150 dark:border-slate-850 rounded-2xl space-y-2">
                        <h4 className="font-extrabold text-xs text-slate-850 dark:text-white">
                          Worksheet: "{sheet.title}"
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          Concept: {sheet.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {sheet.elements.map((el, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-slate-200/50 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-350 font-bold rounded">
                              {el}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* E. SUPPLIES & TIPS */}
                {activeTab === 'tips' && (
                  <div className="space-y-6">
                    {/* Materials */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Classroom Materials Checklist</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {generatedData.materials.map((mat, i) => (
                          <div key={i} className="p-2.5 bg-slate-50 dark:bg-slate-900/15 border border-slate-150 dark:border-slate-850 rounded-xl text-xs text-slate-650 dark:text-slate-350 font-semibold flex items-center">
                            <Check className="h-4 w-4 text-emerald-500 mr-2 flex-shrink-0" />
                            <span>{mat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Engagement Tips */}
                    <div className="border-t border-slate-100 dark:border-slate-850/45 pt-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Classroom Engagement Tips</h4>
                      <ul className="space-y-2">
                        {generatedData.engagementTips.map((tip, i) => (
                          <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start font-medium leading-relaxed">
                            <span className="text-brand-500 font-extrabold mr-2 flex-shrink-0">★</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default AiAssistant;
