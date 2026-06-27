import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Sun, Moon, Search, Check, Shield, Menu, Trash2, CheckCircle2, XCircle, MessageSquare, Clock, Package, AlertTriangle, X, Award, Calendar, Megaphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ onMenuClick }) => {
  const location = useLocation();
  const { user, setUser } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const notificationRef = useRef(null);

  // Determine current page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard Overview';
    if (path === '/curriculum') return 'Curriculum Management';
    if (path.startsWith('/curriculum/')) return 'Curriculum Detail';
    if (path === '/weekly-planner') return 'Weekly Lesson Planner';
    if (path === '/activities') return 'Activities Database';
    if (path === '/materials') return 'Materials & Inventory';
    if (path === '/ai-assistant') return 'AI Lesson Planner Helper';
    if (path === '/analytics') return 'Analytics & Reports';
    if (path === '/parent-portal') return 'Parent Portal View';
    if (path === '/admin-panel') return 'Administration User Panel';
    if (path === '/academic-calendar') return 'Academic Year Calendar';
    if (path === '/settings') return 'Platform Settings';
    return 'Curriculum Planner';
  };

  // Fetch Notifications
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const response = await api.get('/notifications');
      if (response.success && response.data) {
        setNotifications(response.data);
        setUnreadCount(response.data.filter(n => !n.isRead).length);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, [user]);

  // Click outside to close notifications dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      if (response.success) {
        setNotifications(prev => 
          prev.map(n => n._id === id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(c => Math.max(0, c - 1));
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await api.put('/notifications/read-all');
      if (response.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleDeleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      const response = await api.delete(`/notifications/${id}`);
      if (response.success) {
        setNotifications(prev => prev.filter(n => n._id !== id));
        setUnreadCount(prev => {
          const deleted = notifications.find(n => n._id === id);
          if (deleted && !deleted.isRead) {
            return Math.max(0, prev - 1);
          }
          return prev;
        });
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  // Quick Role Switcher for portfolios
  const handleRoleSwitch = (newRole) => {
    if (!user) return;
    const updatedUser = { ...user, role: newRole };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const getNotifConfig = (type, title) => {
    const isApproved = title?.toLowerCase().includes('approved');
    const isRejected = title?.toLowerCase().includes('rejected');
    
    switch (type) {
      case 'approval_status':
        if (isApproved) {
          return {
            Icon: CheckCircle2,
            bgClass: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
          };
        }
        if (isRejected) {
          return {
            Icon: XCircle,
            bgClass: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
          };
        }
        return {
          Icon: CheckCircle2,
          bgClass: 'bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400'
        };
      case 'approval_request':
        return {
          Icon: CheckCircle2,
          bgClass: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
        };
      case 'feedback':
        return {
          Icon: MessageSquare,
          bgClass: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400'
        };
      case 'progress':
        return {
          Icon: Award,
          bgClass: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
        };
      case 'attendance':
        return {
          Icon: Calendar,
          bgClass: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
        };
      case 'meeting':
        return {
          Icon: Calendar,
          bgClass: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400'
        };
      case 'report':
        return {
          Icon: Award,
          bgClass: 'bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400'
        };
      case 'announcement':
        return {
          Icon: Megaphone,
          bgClass: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
        };
      case 'parent_message':
      case 'enquiry':
        return {
          Icon: MessageSquare,
          bgClass: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
        };
      case 'material_request':
      case 'material_shortage':
        return {
          Icon: Package,
          bgClass: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
        };
      case 'deadline':
        return {
          Icon: AlertTriangle,
          bgClass: 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-455'
        };
      case 'activity_reminder':
        return {
          Icon: Clock,
          bgClass: 'bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400'
        };
      default:
        return {
          Icon: Bell,
          bgClass: 'bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400'
        };
    }
  };

  const selectedNotifConfig = selectedNotif ? getNotifConfig(selectedNotif.type, selectedNotif.title) : null;

  return (
    <>
    <header className="h-16 px-4 sm:px-6 glass-panel border-b border-slate-200/50 dark:border-slate-800/30 flex items-center justify-between fixed top-0 right-0 left-0 lg:left-64 z-40 transition-all duration-300">
      {/* Title & Mobile Toggle */}
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 mr-2 text-slate-500 hover:text-brand-500 dark:text-slate-400 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded-xl transition-all duration-200"
          title="Open Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white font-sans tracking-tight truncate">
          {getPageTitle()}
        </h2>
      </div>

      {/* Quick Toolbar */}
      <div className="flex items-center space-x-4">
        {/* Theme Toggler */}
        <button
          onClick={toggleDarkMode}
          className="p-2 text-slate-500 hover:text-brand-500 dark:text-slate-400 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded-xl transition-all duration-200"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications Center */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:text-brand-500 dark:text-slate-400 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded-xl transition-all duration-200 relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] font-bold text-white items-center justify-center font-sans">
                  {unreadCount}
                </span>
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
                className="fixed top-0 right-0 h-screen w-80 sm:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-[100] flex flex-col"
              >
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
                      title="Close"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white font-sans">Notifications</h3>
                  </div>
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-xs text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 font-semibold font-sans transition-colors"
                  >
                    Mark all as read
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-slate-100/50 dark:divide-slate-800/20 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 dark:text-slate-500 font-sans text-xs">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const { Icon, bgClass } = getNotifConfig(notif.type, notif.title);
                      return (
                        <div 
                          key={notif._id} 
                          onClick={() => {
                            setSelectedNotif(notif);
                            setShowNotifications(false);
                            if (!notif.isRead) handleMarkAsRead(notif._id);
                          }}
                          className={`p-4 flex space-x-3 hover:bg-slate-50/75 dark:hover:bg-slate-900/30 transition-all duration-200 border-b border-slate-100 dark:border-slate-800/20 relative cursor-pointer ${
                            notif.isRead 
                              ? 'opacity-70' 
                              : 'bg-brand-500/[0.03] dark:bg-brand-500/[0.01] border-l-2 border-l-brand-500'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bgClass}`}>
                            <Icon className="h-4.5 w-4.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-1">
                              <h4 className={`text-xs font-bold font-sans text-slate-800 dark:text-slate-200 ${!notif.isRead ? 'text-slate-950 dark:text-white font-extrabold' : ''}`}>
                                {notif.title}
                              </h4>
                              <div className="flex items-center space-x-1 flex-shrink-0">
                                {!notif.isRead && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkAsRead(notif._id);
                                    }}
                                    className="text-slate-400 hover:text-emerald-500 transition-colors p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                                    title="Mark read"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                  </button>
                                )}
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteNotification(notif._id, e);
                                  }}
                                  className="text-slate-400 hover:text-rose-500 transition-colors p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                                  title="Delete Notification"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                            {notif.sender?.name && (
                              <span className="text-[10px] text-brand-500 font-bold block mt-0.5">
                                From: {notif.sender.name}{notif.sender.childName ? ` (Parent of ${notif.sender.childName})` : ''}
                              </span>
                            )}
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-sans leading-relaxed break-words font-medium line-clamp-2">
                              {notif.message}
                            </p>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-[10px] text-slate-400 font-sans font-semibold">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="text-[10px] text-brand-500 font-semibold font-sans">Tap to read full →</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>

      {/* Full Notification Message Modal */}
      <AnimatePresence>
        {selectedNotif && selectedNotifConfig && (() => {
          const { Icon, bgClass } = selectedNotifConfig;
          return (
            <motion.div
              key="notif-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
              onClick={() => setSelectedNotif(null)}
            >
              <motion.div
                key="notif-modal-content"
                initial={{ opacity: 0, scale: 0.92, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 16 }}
                transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${bgClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-800 dark:text-white font-sans leading-snug">
                        {selectedNotif.title}
                      </h3>
                       <span className="text-[10px] text-slate-400 font-semibold font-sans block">
                         {new Date(selectedNotif.createdAt).toLocaleString([], {
                           month: 'short', day: 'numeric',
                           hour: '2-digit', minute: '2-digit'
                         })}
                       </span>
                       {selectedNotif.sender?.name && (
                         <span className="text-[10.5px] text-brand-500 font-bold block mt-1">
                           From: {selectedNotif.sender.name}{selectedNotif.sender.childName ? ` (Parent of ${selectedNotif.sender.childName})` : ''}
                         </span>
                       )}
                     </div>
                   </div>
                  <button
                    onClick={() => setSelectedNotif(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex-shrink-0"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Full Message Body */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/40 rounded-2xl">
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
                    {selectedNotif.message}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={(e) => {
                      handleDeleteNotification(selectedNotif._id, e);
                      setSelectedNotif(null);
                    }}
                    className="px-4 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/15 rounded-xl font-bold text-xs font-sans transition-all flex items-center gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                  <button
                    onClick={() => setSelectedNotif(null)}
                    className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold text-xs font-sans shadow-md shadow-brand-500/10 transition-all"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
