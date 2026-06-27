import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  Library, 
  Package, 
  Sparkles, 
  BarChart3, 
  Settings, 
  LogOut,
  Shield,
  Baby,
  CalendarDays,
  Users,
  Building2,
  CreditCard,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import Logo from './Logo';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const getMenuItems = () => {
    const role = user?.role || 'teacher';
    
    if (role === 'parent') {
      return [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Parent Portal', path: '/parent-portal', icon: Baby, highlight: true },
        { name: 'Settings', path: '/settings', icon: Settings },
      ];
    }
    
    if (role === 'admin') {
      return [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'User Directory', path: '/admin-panel?tab=users', icon: Users },
        { name: 'Student Admissions', path: '/admin-panel?tab=students', icon: Baby },
        { name: 'Schools & Branches', path: '/admin-panel?tab=branches', icon: Building2 },
        { name: 'Roles & Permissions', path: '/admin-panel?tab=permissions', icon: Shield },
        { name: 'Curriculum Templates', path: '/curriculum', icon: BookOpen },
        { name: 'Reports & Analytics', path: '/analytics', icon: BarChart3 },
        { name: 'Settings', path: '/settings', icon: Settings },
      ];
    }
    
    if (role === 'coordinator') {
      return [
        { name: 'Dashboard', path: '/coordinator-panel?tab=dashboard', icon: LayoutDashboard },
        { name: 'Curriculum Review Center', path: '/coordinator-panel?tab=reviews', icon: BookOpen },
        { name: 'Academic Calendar', path: '/coordinator-panel?tab=calendar', icon: CalendarDays },
        { name: 'Teacher Performance', path: '/coordinator-panel?tab=performance', icon: Shield },
        { name: 'Classroom Notices', path: '/coordinator-panel?tab=notices', icon: Layers },
        { name: 'Reports & Analytics', path: '/coordinator-panel?tab=reports', icon: BarChart3 },
        { name: 'Settings', path: '/settings', icon: Settings },
      ];
    }
    
    // Default: Teacher
    return [
      { name: 'Dashboard', path: '/', icon: LayoutDashboard },
      { name: 'Student Management', path: '/student-management', icon: Baby },
      { name: 'Curriculum Plans', path: '/curriculum', icon: BookOpen },
      { name: 'Weekly Planner', path: '/weekly-planner', icon: Calendar },
      { name: 'Academic Calendar', path: '/academic-calendar', icon: CalendarDays },
      { name: 'Activities Library', path: '/activities', icon: Library },
      { name: 'Materials Inventory', path: '/materials', icon: Package },
      { name: 'AI Lesson Assistant', path: '/ai-assistant', icon: Sparkles, highlight: true },
      { name: 'Settings', path: '/settings', icon: Settings },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-[60] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`w-64 glass-panel border-r border-slate-200/50 dark:border-slate-800/30 flex flex-col h-screen fixed left-0 top-0 z-[70] transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/30">
        <Logo size="md" />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isLinkActive = (() => {
            if (item.path.includes('?tab=')) {
              const urlParams = new URLSearchParams(location.search);
              const isCoord = item.path.startsWith('/coordinator-panel');
              const defaultTab = isCoord ? 'dashboard' : 'users';
              const currentTab = urlParams.get('tab') || defaultTab;
              const itemParams = new URLSearchParams(item.path.split('?')[1]);
              const itemTab = itemParams.get('tab');
              const basePath = isCoord ? '/coordinator-panel' : '/admin-panel';
              return location.pathname === basePath && currentTab === itemTab;
            }
            return location.pathname === item.path;
          })();

          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={`
                flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative
                ${isLinkActive 
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/15' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
                }
                ${item.highlight ? 'border border-brand-300/30 dark:border-brand-500/20 bg-brand-500/5 dark:bg-brand-500/5' : ''}
              `}
            >
              <Icon className={`h-5 w-5 mr-3.5 transition-transform group-hover:scale-105 duration-200 ${isLinkActive ? 'text-white' : item.highlight ? 'text-brand-500 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`} />
              <span className="font-sans font-medium">{item.name}</span>
              {item.highlight && !isLinkActive && (
                <span className="absolute right-3 top-3.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/30 bg-slate-100/20 dark:bg-slate-900/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-900/30 flex items-center justify-center font-bold text-brand-600 dark:text-brand-400 text-sm flex-shrink-0">
              {user?.name ? user.name.split(' ').map(n=>n[0]).join('') : 'U'}
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate font-sans">
                {user?.name || 'Loading User'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize truncate font-sans">
                {user?.role || 'Guest'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="p-2 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors"
            title="Log Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
