// src/components/BottomNav.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Activity,
  Bot,
  User,
  Dumbbell,
  Briefcase,
  Target
} from 'lucide-react';

const navItems = [
  { path: '/app/dashboard', icon: LayoutDashboard, label: 'Home' },
  { path: '/app/daily-planner', icon: CalendarCheck, label: 'Tasks' },
  { path: '/app/habits', icon: Activity, label: 'Habits' },
  { path: '/app/ai-coach', icon: Bot, label: 'AI Coach' },
  { path: '/app/profile', icon: User, label: 'Profile' },
];

// Secondary nav items that appear when you scroll or in certain contexts
const quickActions = [
  { path: '/app/fitness', icon: Dumbbell, label: 'Workout' },
  { path: '/app/career', icon: Briefcase, label: 'Career' },
  { path: '/app/goals', icon: Target, label: 'Goals' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden z-30">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon 
                  size={22} 
                  className={isActive ? 'transform scale-110' : ''}
                />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute -top-1 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Action FAB (Floating Action Button) - Optional */}
      <div className="fixed bottom-20 right-4 md:hidden z-20">
        <button
          className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center"
          onClick={() => {
            // Show quick action menu or navigate to add task
            window.location.href = '/app/daily-planner';
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Spacer to prevent content from being hidden behind bottom nav */}
      <div className="h-16 md:hidden" />
    </>
  );
}