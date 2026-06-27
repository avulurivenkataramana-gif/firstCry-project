import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  User, 
  Lock, 
  Bell, 
  Moon, 
  Check, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const Settings = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [classroom, setClassroom] = useState(user?.classroom || '');
  
  // Passwords
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Notification States
  const [notifyApprovals, setNotifyApprovals] = useState(true);
  const [notifyMaterials, setNotifyMaterials] = useState(true);
  const [notifyDeadlines, setNotifyDeadlines] = useState(false);
  
  const [saveStatus, setSaveStatus] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user) return;
    setErrorStatus(null);
    setProfileLoading(true);
    
    try {
      await updateProfile({
        name,
        email,
        phoneNumber: phone,
        classroom
      });
      triggerSuccess('Account details saved successfully!');
    } catch (err) {
      setErrorStatus(err.message || 'Failed to save profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;
    setErrorStatus(null);
    setPasswordLoading(true);
    
    try {
      await changePassword(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      triggerSuccess('Password changed successfully!');
    } catch (err) {
      setErrorStatus(err.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const triggerSuccess = (msg) => {
    setSaveStatus(msg);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="space-y-6 pb-12 font-sans max-w-4xl">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
          Configure profile details, change security passwords, and toggle notification alerts.
        </p>
      </div>

      {/* Success banner */}
      {saveStatus && (
        <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-xl text-xs font-semibold flex items-center space-x-2 border border-emerald-500/15 animate-fade-in">
          <ShieldCheck className="h-4.5 w-4.5" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Error banner */}
      {errorStatus && (
        <div className="p-3 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold flex items-center space-x-2 border border-red-500/15 animate-fade-in">
          <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
          <span>{errorStatus}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Profile Card */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Account Details Form */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/20">
            <h3 className="font-bold text-sm text-slate-850 dark:text-white mb-4 flex items-center">
              <User className="h-4.5 w-4.5 mr-1.5 text-brand-500" /> Account Information
            </h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-xs glass-input"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-xs glass-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-xs glass-input"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Classroom Target</label>
                  <input
                    type="text"
                    value={classroom}
                    onChange={(e) => setClassroom(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-xs glass-input"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow transition-all flex items-center gap-1.5"
                >
                  {profileLoading ? (
                    <><div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white" /> Saving...</>
                  ) : 'Save Profile Info'}
                </button>
              </div>

            </form>
          </div>

          {/* Security Form */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/20">
            <h3 className="font-bold text-sm text-slate-850 dark:text-white mb-4 flex items-center">
              <Lock className="h-4.5 w-4.5 mr-1.5 text-brand-500" /> Platform Security
            </h3>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Current Password</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl text-xs glass-input"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl text-xs glass-input"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={!oldPassword || !newPassword || passwordLoading}
                  className="bg-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 hover:bg-slate-950 disabled:opacity-60 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow transition-all flex items-center gap-1.5"
                >
                  {passwordLoading ? (
                    <><div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white" /> Updating...</>
                  ) : 'Reset Portal Password'}
                </button>
              </div>

            </form>
          </div>

        </div>

        {/* Sidebar panels */}
        <div className="space-y-6">
          
          {/* Theme card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/20 space-y-4">
            <h3 className="font-bold text-sm text-slate-850 dark:text-white flex items-center">
              <Moon className="h-4.5 w-4.5 mr-1.5 text-brand-500" /> Visual Appearance
            </h3>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-350 font-semibold">
                Dark Mode Settings
              </span>
              
              <button
                onClick={toggleDarkMode}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                  darkMode ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              >
                <span className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                  darkMode ? 'translate-x-5' : 'translate-x-0'
                }`}></span>
              </button>
            </div>
          </div>

          {/* Notifications config */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/20 space-y-4">
            <h3 className="font-bold text-sm text-slate-855 dark:text-white flex items-center">
              <Bell className="h-4.5 w-4.5 mr-1.5 text-brand-500" /> Notifications
            </h3>

            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notifyApprovals}
                  onChange={(e) => setNotifyApprovals(e.target.checked)}
                  className="rounded text-brand-500 focus:ring-brand-500 border-slate-300 dark:bg-slate-900"
                />
                <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold font-sans">
                  Syllabus Approvals
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notifyMaterials}
                  onChange={(e) => setNotifyMaterials(e.target.checked)}
                  className="rounded text-brand-500 focus:ring-brand-500 border-slate-300 dark:bg-slate-900"
                />
                <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold font-sans">
                  Inventory Stock Warnings
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notifyDeadlines}
                  onChange={(e) => setNotifyDeadlines(e.target.checked)}
                  className="rounded text-brand-500 focus:ring-brand-500 border-slate-300 dark:bg-slate-900"
                />
                <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold font-sans">
                  Syllabus Deadlines
                </span>
              </label>
            </div>
            
            <div className="pt-2">
              <button
                onClick={() => triggerSuccess('Notification alerts modified.')}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-800/10 text-slate-600 dark:text-slate-300 font-bold py-2 rounded-xl text-xs transition-colors"
              >
                Save Notification Prefs
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Settings;
