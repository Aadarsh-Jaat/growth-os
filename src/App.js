// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// Layout Components
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import PricingPage from './pages/PricingPage';

// Main Pages
import Dashboard from './pages/Dashboard';
import DailyPlanner from './pages/DailyPlanner';
import HabitTracker from './pages/HabitTracker';
import Fitness from './pages/Fitness';
import English from './pages/English';
import Career from './pages/Career';
import Skills from './pages/Skills';
import Wildcore from './pages/Wildcore';
import Transport from './pages/Transport';
import InvestingSavings from './pages/InvestingSavings';
import GovernmentJob from './pages/GovernmentJob';
import AbroadPlanning from './pages/AbroadPlanning';
import Goals from './pages/Goals';
import AICoach from './pages/AICoach';
import WeeklyReview from './pages/WeeklyReview';
import MonthlyReview from './pages/MonthlyReview';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import FixedTasksManager from './components/FixedTasksManager';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/pricing" element={<PricingPage />} />

            {/* Protected Routes - Main App */}
            <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Navigate to="/app/dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="daily-planner" element={<DailyPlanner />} />
              <Route path="habits" element={<HabitTracker />} />
              <Route path="fixed-tasks" element={<FixedTasksManager />} />
              <Route path="fitness" element={<Fitness />} />
              <Route path="english" element={<English />} />
              <Route path="career" element={<Career />} />
              <Route path="skills" element={<Skills />} />
              <Route path="wildcore" element={<Wildcore />} />
              <Route path="transport" element={<Transport />} />
              <Route path="investing" element={<InvestingSavings />} />
              <Route path="government-job" element={<GovernmentJob />} />
              <Route path="abroad-planning" element={<AbroadPlanning />} />
              <Route path="goals" element={<Goals />} />
              <Route path="ai-coach" element={<AICoach />} />
              <Route path="weekly-review" element={<WeeklyReview />} />
              <Route path="monthly-review" element={<MonthlyReview />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<Navigate to="/admin/dashboard" />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminDashboard />} />
              <Route path="subscriptions" element={<AdminDashboard />} />
              <Route path="analytics" element={<AdminDashboard />} />
              <Route path="settings" element={<AdminDashboard />} />
            </Route>

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;