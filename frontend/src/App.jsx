import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Curriculum from './pages/Curriculum';
import WeeklyPlanner from './pages/WeeklyPlanner';
import Activities from './pages/Activities';
import Materials from './pages/Materials';
import AiAssistant from './pages/AiAssistant';
import Analytics from './pages/Analytics';
import ParentPortal from './pages/ParentPortal';
import AdminPanel from './pages/AdminPanel';
import CoordinatorPanel from './pages/CoordinatorPanel';
import Settings from './pages/Settings';
import AcademicCalendar from './pages/AcademicCalendar';
import StudentManagement from './pages/StudentManagement';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected SaaS Layout Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="curriculum" element={<Curriculum />} />
              <Route path="weekly-planner" element={<WeeklyPlanner />} />
              <Route path="student-management" element={<StudentManagement />} />
              <Route path="activities" element={<Activities />} />
              <Route path="materials" element={<Materials />} />
              <Route path="ai-assistant" element={<AiAssistant />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="parent-portal" element={<ParentPortal />} />
              <Route path="admin-panel" element={<AdminPanel />} />
              <Route path="coordinator-panel" element={<CoordinatorPanel />} />
              <Route path="academic-calendar" element={<AcademicCalendar />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
