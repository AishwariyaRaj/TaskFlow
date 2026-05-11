import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyEmail from './pages/Verify'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Workspaces from './pages/Workspaces'
import Dashboard from './pages/Dashboard'
import ProjectList from './pages/ProjectList'
import ProjectBoard from './pages/ProjectBoard'
import MembersPage from './pages/MembersPage'
import Analytics from './pages/Analytics'
import BillingPage from './pages/BillingPage'
import SettingsPage from './pages/SettingsPage'
import Automations from './pages/Automations'
import CalendarView from './pages/CalendarView'
import AcceptInvite from './pages/AcceptInvite'
import LandingPage from './pages/LandingPage'
import { useEffect, useState, createContext, useContext } from 'react';

// Theme context for light/dark mode
const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Routes>
        {/* Landing page before login/signup */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/invites/:token" element={<AcceptInvite />} />

        {/* Workspace Selection */}
        <Route path="/workspaces" element={<Workspaces />} />

        {/* Workspace specific routes */}
        <Route path="/workspaces/:workspaceId" element={<Dashboard />} />
        <Route path="/workspaces/:workspaceId/projects" element={<ProjectList />} />
        <Route path="/workspaces/:workspaceId/projects/:projectId" element={<ProjectBoard />} />
        <Route path="/workspaces/:workspaceId/members" element={<MembersPage />} />
        <Route path="/workspaces/:workspaceId/analytics" element={<Analytics />} />
        <Route path="/workspaces/:workspaceId/billing" element={<BillingPage />} />
        <Route path="/workspaces/:workspaceId/automations" element={<Automations />} />
        <Route path="/workspaces/:workspaceId/calendar" element={<CalendarView />} />
        <Route path="/workspaces/:workspaceId/settings" element={<SettingsPage />} />

        {/* Fallback: redirect unknown routes to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeContext.Provider>
  );
}
