import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

const Layout = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Route Guard: Redirect to login if user not authenticated
  if (loading) {
    return (
      <div className="min-h-screen h-screen w-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 space-y-6">
        <Logo size="lg" centered={true} />
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#2563EB]"></div>
          <div className="absolute rounded-full h-6 w-6 bg-[#2563EB]/10"></div>
        </div>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 font-sans animate-pulse">
          Verifying school portal credentials...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex transition-colors duration-300">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Panel Content Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen w-full transition-all duration-300">
        {/* Top Navbar */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Dynamic Pages Area */}
        <main className="flex-1 px-4 sm:px-6 pt-24 pb-4 sm:pb-6 overflow-x-hidden bg-transparent w-full">
          <div className="max-w-none mx-auto animate-slide-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
