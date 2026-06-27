import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie
} from 'recharts';
import { 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  TrendingUp, 
  Calendar, 
  Award,
  Layers,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Analytics = () => {
  const { user } = useAuth();

  if (user?.role !== 'admin' && user?.role !== 'coordinator') {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400 font-sans">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-205/50 dark:border-slate-800/15 rounded-2xl p-8 shadow-sm text-left">
          <ShieldAlert className="h-10 w-10 text-red-500 mx-auto mb-4 animate-pulse" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white text-center">Access Denied</h3>
          <p className="text-xs mt-1 text-slate-500 dark:text-slate-400 text-center">You do not have administrative or coordinator permissions to view Analytics & Reports.</p>
        </div>
      </div>
    );
  }
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      if (response.success && response.data) {
        setData(response.data);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Excel Export Handler (Client-side CSV generator)
  const handleExportExcel = () => {
    if (!data) return;
    
    // Assemble report rows
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'FirstCry Intellitots - Curriculum Planning Report\r\n';
    csvContent += 'Generated on: ' + new Date().toLocaleDateString() + '\r\n\r\n';
    
    // Section 1: KPI Stats
    csvContent += '--- KEY METRICS ---\r\n';
    csvContent += `Completion Rate,${data.kpis.curriculumCompletionPercentage}%\r\n`;
    csvContent += `Total Curriculums,${data.kpis.totalCurriculums}\r\n`;
    csvContent += `Active Lesson Plans,${data.kpis.activeLessonPlans}\r\n`;
    csvContent += `Pending Review,${data.kpis.pendingApprovals}\r\n\r\n`;
    
    // Section 2: Teacher Performance
    csvContent += '--- TEACHER SCORECARD ---\r\n';
    csvContent += 'Teacher Name,Classroom,Plans Created,Plans Approved,Performance Score\r\n';
    data.teacherPerformance.slice(0, 1).forEach(t => {
      csvContent += `"${t.name}","${t.classroom}",${t.plansCreated},${t.plansApproved},${t.performanceScore}%\r\n`;
    });
    
    // Section 3: Skill Coverage
    csvContent += '\r\n--- SKILL COVERAGE ---\r\n';
    csvContent += 'Subject Area,Coverage Score (out of 100)\r\n';
    data.charts.curriculumCoverage.forEach(s => {
      csvContent += `"${s.subject}",${s.A}\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `intellitots_curriculum_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
        <div className="h-64 glass-card rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const teacherPerformance = data?.teacherPerformance || [];

  const COLORS = ['#8d44ff', '#3B82F6', '#10B981', '#fbbf24', '#EF4444', '#EC4899', '#14B8A6'];

  return (
    <div className="space-y-6 pb-12 print:p-0 font-sans">
      
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Analytics & Reports</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Generate and export institutional dashboards, completion rates, and teacher scorecard metrics.
          </p>
        </div>

        {/* Exporters */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow transition-all"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1.5" /> Export Excel
          </button>
          
          <button
            onClick={handlePrintPDF}
            className="flex items-center justify-center bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow transition-all dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <Printer className="h-4 w-4 mr-1.5" /> Print PDF Report
          </button>
        </div>
      </div>

      {/* Printable Report Header (Hidden on screen, shown on print) */}
      <div className="hidden print:block text-center border-b pb-6 mb-6">
        <h1 className="text-2xl font-black text-slate-800">FirstCry Intellitots Preschool Portal</h1>
        <h2 className="text-base font-bold text-slate-500 mt-1">Institutional Curriculum Planning & Progress Report</h2>
        <span className="text-xs text-slate-400 block mt-2">Generated on: {new Date().toLocaleDateString()}</span>
      </div>

      {/* KPI Stats card row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        <div className="glass-card p-5 rounded-2xl flex items-center space-x-4">
          <div className="bg-brand-500/10 text-brand-500 p-3 rounded-xl dark:bg-brand-500/5">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-450 uppercase block">Completion</span>
            <span className="text-lg font-black text-slate-800 dark:text-white">{kpis.curriculumCompletionPercentage}%</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center space-x-4">
          <div className="bg-sky-500/10 text-sky-500 p-3 rounded-xl dark:bg-sky-500/5">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-455 uppercase block">Syllabus Count</span>
            <span className="text-lg font-black text-slate-800 dark:text-white">{kpis.totalCurriculums}</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center space-x-4">
          <div className="bg-amber-500/10 text-amber-500 p-3 rounded-xl dark:bg-amber-500/5">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-450 uppercase block">Pending Review</span>
            <span className="text-lg font-black text-slate-800 dark:text-white">{kpis.pendingApprovals}</span>
          </div>
        </div>

      </div>

      {/* Visualizations row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Monthly Release volume */}
        <div className="glass-card p-6 rounded-2xl flex flex-col print:border print:shadow-none">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4">
            Curriculum Planning Volume History
          </h3>
          <div className="flex-1 min-h-[260px]">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={charts.monthlyProgress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="Approved" stroke="#10B981" fill="#10B981" fillOpacity={0.15} />
                <Area type="monotone" dataKey="Submitted" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.05} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly planning pie distribution */}
        <div className="glass-card p-6 rounded-2xl flex flex-col print:border print:shadow-none">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4">
            Weekly Lesson Plan Status Mix
          </h3>
          <div className="flex-1 min-h-[260px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={charts.weeklyPlanningStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.weeklyPlanningStatus?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Teacher Scorecard */}
      <div className="glass-card p-6 rounded-2xl flex flex-col print:border print:shadow-none">
        <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4">
          Teacher Activity & Planning Scorecard
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/40 text-slate-400 dark:text-slate-505 uppercase font-semibold">
                <th className="pb-3 pl-2">Teacher Name</th>
                <th className="pb-3">Classroom Assignment</th>
                <th className="pb-3 text-center">Syllabus Outlined</th>
                <th className="pb-3 text-center">Lessons Approved</th>
                <th className="pb-3 pr-2 text-right">Performance Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
              {teacherPerformance.slice(0, 1).map((t) => (
                <tr key={t._id}>
                  <td className="py-3.5 pl-2 font-bold text-slate-800 dark:text-white">{t.name}</td>
                  <td className="py-3.5 text-slate-500 dark:text-slate-400">{t.classroom}</td>
                  <td className="py-3.5 text-center font-semibold text-slate-655 dark:text-slate-350">{t.plansCreated}</td>
                  <td className="py-3.5 text-center font-semibold text-emerald-500">{t.plansApproved}</td>
                  <td className="py-3.5 pr-2 text-right font-extrabold text-brand-500 dark:text-brand-400">{t.performanceScore}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Analytics;
