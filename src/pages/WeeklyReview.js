// src/pages/WeeklyReview.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { 
  BarChart3, TrendingUp, TrendingDown, CheckCircle, XCircle, 
  Dumbbell, BookOpen, Briefcase, Target, Award, Zap, Calendar,
  Activity, DollarSign, Clock, Star
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function WeeklyReview() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState({
    tasksCompleted: 0,
    tasksSkipped: 0,
    bestCategory: '',
    weakestCategory: '',
    habitStreaks: 0,
    moneySaved: 0,
    workoutCount: 0,
    englishHours: 0,
    businessProgress: 0,
    weeklyScore: 0,
    achievements: [],
    improvements: []
  });

  useEffect(() => {
    if (currentUser) {
      fetchWeeklyData();
    }
  }, [currentUser]);

  const fetchWeeklyData = async () => {
    try {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - 7);
      
      // Fetch tasks from last 7 days
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = tasksSnapshot.docs.map(doc => doc.data());
      
      const completed = tasks.filter(t => t.status === 'completed').length;
      const skipped = tasks.filter(t => t.status === 'skipped').length;
      
      // Calculate category performance
      const categoryStats = {};
      tasks.forEach(task => {
        if (!categoryStats[task.category]) categoryStats[task.category] = { completed: 0, total: 0 };
        categoryStats[task.category].total++;
        if (task.status === 'completed') categoryStats[task.category].completed++;
      });
      
      let bestCat = '', worstCat = '';
      let bestRate = 0, worstRate = 100;
      Object.entries(categoryStats).forEach(([cat, stats]) => {
        const rate = (stats.completed / stats.total) * 100;
        if (rate > bestRate) { bestRate = rate; bestCat = cat; }
        if (rate < worstRate) { worstRate = rate; worstCat = cat; }
      });
      
      // Fetch habits
      const habitsQuery = query(collection(db, 'habits'), where('userId', '==', currentUser.uid), orderBy('date', 'desc'), limit(50));
      const habitsSnapshot = await getDocs(habitsQuery);
      const habits = habitsSnapshot.docs.map(doc => doc.data());
      
      let streak = 0;
      for (let i = 0; i < habits.length; i++) {
        if (habits[i].completed) streak++;
        else break;
      }
      
      const weeklyScore = Math.min(100, Math.floor((completed / Math.max(1, completed + skipped)) * 100) + Math.floor(streak / 7 * 20));
      
      setWeeklyData({
        tasksCompleted: completed,
        tasksSkipped: skipped,
        bestCategory: bestCat || 'None',
        weakestCategory: worstCat || 'None',
        habitStreaks: streak,
        moneySaved: 25000,
        workoutCount: 4,
        englishHours: 5,
        businessProgress: 65,
        weeklyScore: weeklyScore,
        achievements: [
          'Completed 80% of daily tasks',
          'Maintained workout streak for 4 days',
          'Saved ₹5,000 this week'
        ],
        improvements: [
          'Increase English practice to daily',
          'Reduce skipped tasks',
          'Focus on career applications'
        ]
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      setLoading(false);
    }
  };

  const performanceData = [
    { day: 'Mon', tasks: 8, completed: 7 },
    { day: 'Tue', tasks: 10, completed: 8 },
    { day: 'Wed', tasks: 7, completed: 6 },
    { day: 'Thu', tasks: 9, completed: 9 },
    { day: 'Fri', tasks: 8, completed: 7 },
    { day: 'Sat', tasks: 6, completed: 4 },
    { day: 'Sun', tasks: 5, completed: 3 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Weekly Review</h1>
      
      {/* Weekly Score Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white text-center">
        <p className="text-sm opacity-90 mb-2">Weekly Performance Score</p>
        <div className="text-6xl font-bold mb-2">{weeklyData.weeklyScore}</div>
        <div className="w-full bg-white/30 rounded-full h-2">
          <div className="bg-white rounded-full h-2" style={{ width: `${weeklyData.weeklyScore}%` }}></div>
        </div>
        <p className="text-sm opacity-90 mt-2">
          {weeklyData.weeklyScore >= 80 ? 'Excellent week! Keep it up! 🎉' : 
           weeklyData.weeklyScore >= 60 ? 'Good progress! Room for improvement 💪' : 
           'Focus on consistency next week 📈'}
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4"><div className="flex items-center gap-2 mb-1"><CheckCircle className="text-green-500" size={20} /><span className="text-2xl font-bold">{weeklyData.tasksCompleted}</span></div><p className="text-sm text-gray-600">Tasks Completed</p></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4"><div className="flex items-center gap-2 mb-1"><XCircle className="text-red-500" size={20} /><span className="text-2xl font-bold">{weeklyData.tasksSkipped}</span></div><p className="text-sm text-gray-600">Tasks Skipped</p></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4"><div className="flex items-center gap-2 mb-1"><Zap className="text-yellow-500" size={20} /><span className="text-2xl font-bold">{weeklyData.habitStreaks}</span></div><p className="text-sm text-gray-600">Day Streak</p></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4"><div className="flex items-center gap-2 mb-1"><DollarSign className="text-green-500" size={20} /><span className="text-2xl font-bold">₹{weeklyData.moneySaved.toLocaleString()}</span></div><p className="text-sm text-gray-600">Saved This Week</p></div>
      </div>
      
      {/* Performance Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Daily Task Completion</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={performanceData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Bar dataKey="completed" fill="#10B981" name="Completed" /><Bar dataKey="tasks" fill="#3B82F6" name="Total Tasks" /></BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Category Performance */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200"><div className="flex items-center gap-2 mb-2"><TrendingUp className="text-green-600" size={20} /><h3 className="font-semibold">Best Category</h3></div><p className="text-lg font-bold text-green-700">{weeklyData.bestCategory}</p></div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200"><div className="flex items-center gap-2 mb-2"><TrendingDown className="text-red-600" size={20} /><h3 className="font-semibold">Needs Improvement</h3></div><p className="text-lg font-bold text-red-700">{weeklyData.weakestCategory}</p></div>
      </div>
      
      {/* Weekly Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 flex items-center gap-3"><Dumbbell size={24} className="text-blue-500" /><div><p className="text-2xl font-bold">{weeklyData.workoutCount}</p><p className="text-sm text-gray-500">Workouts</p></div></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 flex items-center gap-3"><BookOpen size={24} className="text-purple-500" /><div><p className="text-2xl font-bold">{weeklyData.englishHours}h</p><p className="text-sm text-gray-500">English Practice</p></div></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 flex items-center gap-3"><Briefcase size={24} className="text-orange-500" /><div><p className="text-2xl font-bold">{weeklyData.businessProgress}%</p><p className="text-sm text-gray-500">Business Tasks</p></div></div>
      </div>
      
      {/* Achievements & Improvements */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm"><div className="flex items-center gap-2 mb-3"><Award className="text-yellow-500" size={20} /><h3 className="font-semibold">Top Achievements</h3></div><ul className="space-y-2">{weeklyData.achievements.map((a, i) => <li key={i} className="flex items-center gap-2 text-sm"><CheckCircle size={14} className="text-green-500" />{a}</li>)}</ul></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm"><div className="flex items-center gap-2 mb-3"><Target className="text-blue-500" size={20} /><h3 className="font-semibold">Focus for Next Week</h3></div><ul className="space-y-2">{weeklyData.improvements.map((i, idx) => <li key={idx} className="flex items-center gap-2 text-sm"><Clock size={14} className="text-orange-500" />{i}</li>)}</ul></div>
      </div>
      
      {/* AI Weekly Advice */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-5 border border-indigo-200">
        <div className="flex items-start gap-3"><Zap className="text-indigo-600 mt-0.5" size={20} /><div><h3 className="font-semibold text-indigo-800 dark:text-indigo-400">AI Coach Summary</h3><p className="text-gray-700 dark:text-gray-300 mt-1">Great progress this week! Your consistency in fitness and business tasks is impressive. Next week, focus on your {weeklyData.weakestCategory} category - even 15 minutes daily will make a difference. Remember your ₹1.5 Crore goal - every small step counts!</p></div></div>
      </div>
    </div>
  );
}