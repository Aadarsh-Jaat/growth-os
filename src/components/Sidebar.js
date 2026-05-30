// src/components/Sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  LayoutDashboard,
  CalendarCheck,
  Activity,
  Dumbbell,
  Languages,
  Briefcase,
  Code,
  Package,
  Truck,
  TrendingUp,
  GraduationCap,
  Plane,
  Target,
  Bot,
  BarChart3,
  Calendar,
  User,
  Settings,
  Crown,
  LogOut,
  X,
  Moon,
  Sun,
  TrendingDown,
  PiggyBank
} from 'lucide-react';

const menuItems = [
  { path: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'text-blue-500' },
  { path: '/app/daily-planner', icon: CalendarCheck, label: 'Daily Planner', color: 'text-green-500' },
  { path: '/app/habits', icon: Activity, label: 'Habit Tracker', color: 'text-purple-500' },
  { divider: true },
  { path: '/app/fitness', icon: Dumbbell, label: 'Fitness', color: 'text-orange-500' },
  { path: '/app/english', icon: Languages, label: 'English / IELTS', color: 'text-indigo-500' },
  { path: '/app/career', icon: Briefcase, label: 'Career', color: 'text-cyan-500' },
  { path: '/app/skills', icon: Code, label: 'Coding Skills', color: 'text-emerald-500' },
  { divider: true },
  { path: '/app/wildcore', icon: Package, label: 'Wildcore Brand', color: 'text-pink-500' },
  { path: '/app/transport', icon: Truck, label: 'Transport Co.', color: 'text-amber-500' },
  { divider: true },
  { path: '/app/investing', icon: TrendingUp, label: 'Investing', color: 'text-teal-500' },
  { path: '/app/government-job', icon: GraduationCap, label: 'Govt Job', color: 'text-sky-500' },
  { path: '/app/abroad-planning', icon: Plane, label: 'Abroad', color: 'text-violet-500' },
  { divider: true },
  { path: '/app/goals', icon: Target, label: 'Goals', color: 'text-rose-500' },
  { path: '/app/ai-coach', icon: Bot, label: 'AI Coach', color: 'text-fuchsia-500' },
  { divider: true },
  { path: '/app/weekly-review', icon: BarChart3, label: 'Weekly Review', color: 'text-lime-500' },
  { path: '/app/monthly-review', icon: Calendar, label: 'Monthly Review', color: 'text-orange-500' },
  { divider: true },
  { path: '/app/profile', icon: User, label: 'Profile', color: 'text-gray-500' },
  { path: '/app/settings', icon: Settings, label: 'Settings', color: 'text-gray-500' },
];

export default function Sidebar({ mobile, onClose }) {
  const location = useLocation();
  const { userData, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 shadow-xl">
      {/* Header */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Growth OS
            </h1>
            {userData && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Welcome back!
              </p>
            )}
          </div>
        </div>
        
        {mobile && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} className="dark:text-white" />
          </button>
        )}
      </div>

      {/* User Info (Mobile only) */}
      {mobile && userData && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
              {userData.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">{userData.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{userData.email}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className={`text-xs px-2 py-1 rounded-full ${
              userData.subscription === 'premium'
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {userData.subscription === 'premium' ? '⭐ Premium' : 'Free Plan'}
            </span>
            {userData.subscription !== 'premium' && (
              <Link
                to="/pricing"
                onClick={onClose}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Upgrade →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {menuItems.map((item, index) => {
            if (item.divider) {
              return (
                <div key={`divider-${index}`} className="my-3 border-t border-gray-200 dark:border-gray-700" />
              );
            }
            
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={mobile && onClose}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon 
                  size={20} 
                  className={`${isActive ? item.color : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}
                />
                <span className="text-sm font-medium flex-1">{item.label}</span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center space-x-3">
            {darkMode ? (
              <Sun size={18} className="text-yellow-500" />
            ) : (
              <Moon size={18} className="text-gray-600" />
            )}
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
          </div>
          <span className="text-xs text-gray-400">
            {darkMode ? '☀️' : '🌙'}
          </span>
        </button>

        {/* Upgrade Button (Desktop) */}
        {!mobile && userData?.subscription !== 'premium' && (
          <Link
            to="/pricing"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 hover:from-amber-100 hover:to-orange-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Crown size={18} className="text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                Upgrade to Premium
              </span>
            </div>
            <span className="text-xs text-amber-600">✨</span>
          </Link>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>

        {/* Version Info */}
        <div className="px-3 pt-2">
          <p className="text-xs text-center text-gray-400 dark:text-gray-600">
            Growth OS v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}