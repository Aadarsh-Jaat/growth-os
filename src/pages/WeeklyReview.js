// src/pages/WeeklyReview.js - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { 
  BarChart3, TrendingUp, TrendingDown, CheckCircle, XCircle, 
  Dumbbell, BookOpen, Briefcase, Target, Award, Zap, Calendar,
  Activity, DollarSign, Clock, Star, Brain, AlertCircle
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
  
  const [skippedTasksDetail, setSkippedTasksDetail] = useState({ total: 0, byCategory: {}, tasks: [] });
  const [dailyPerformance, setDailyPerformance] = useState([]);

  useEffect(() => {
    if (currentUser) {
      fetchWeeklyData();
    }
  }, [currentUser]);

  const fetchWeeklyData = async () => {
    try {
      // Calculate date range for current week (last 7 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      console.log(`Fetching data from ${startDateStr} to ${endDateStr}`);
      
      // 1. Fetch ALL tasks (not just last 100)
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', currentUser.uid)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      let allTasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter to current week only
      const weeklyTasks = allTasks.filter(task => task.date >= startDateStr && task.date <= endDateStr);
      
      const completed = weeklyTasks.filter(t => t.status === 'completed').length;
      const skipped = weeklyTasks.filter(t => t.status === 'skipped').length;
      const total = weeklyTasks.length;
      
      // 2. Calculate daily performance
      const dailyMap = {};
      weeklyTasks.forEach(task => {
        if (!dailyMap[task.date]) {
          dailyMap[task.date] = { date: task.date, completed: 0, skipped: 0, total: 0 };
        }
        dailyMap[task.date].total++;
        if (task.status === 'completed') dailyMap[task.date].completed++;
        if (task.status === 'skipped') dailyMap[task.date].skipped++;
      });
      
      const dailyData = Object.values(dailyMap)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(day => ({
          day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
          date: day.date,
          completed: day.completed,
          skipped: day.skipped,
          total: day.total,
          rate: day.total > 0 ? Math.round((day.completed / day.total) * 100) : 0
        }));
      
      setDailyPerformance(dailyData);
      
      // 3. Category performance
      const categoryStats = {};
      weeklyTasks.forEach(task => {
        if (!categoryStats[task.category]) {
          categoryStats[task.category] = { completed: 0, skipped: 0, total: 0 };
        }
        categoryStats[task.category].total++;
        if (task.status === 'completed') categoryStats[task.category].completed++;
        if (task.status === 'skipped') categoryStats[task.category].skipped++;
      });
      
      let bestCat = '', worstCat = '';
      let bestRate = -1, worstRate = 101;
      Object.entries(categoryStats).forEach(([cat, stats]) => {
        const rate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
        if (rate > bestRate && stats.total >= 2) { bestRate = rate; bestCat = cat; }
        if (rate < worstRate && stats.total >= 2) { worstRate = rate; worstCat = cat; }
      });
      
      // 4. Fetch habits for streak
      const habitsQuery = query(
        collection(db, 'habits'),
        where('userId', '==', currentUser.uid)
      );
      const habitsSnapshot = await getDocs(habitsQuery);
      const habits = habitsSnapshot.docs
        .map(doc => doc.data())
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      
      let streak = 0;
      for (let i = 0; i < habits.length; i++) {
        if (habits[i].completed) streak++;
        else break;
      }
      
      // 5. Fetch workouts
      const workoutsQuery = query(
        collection(db, 'workouts'),
        where('userId', '==', currentUser.uid)
      );
      const workoutsSnapshot = await getDocs(workoutsQuery);
      const weeklyWorkouts = workoutsSnapshot.docs
        .map(doc => doc.data())
        .filter(w => w.date >= startDateStr && w.date <= endDateStr);
      
      // 6. Fetch English sessions
      const englishQuery = query(
        collection(db, 'englishSessions'),
        where('userId', '==', currentUser.uid)
      );
      const englishSnapshot = await getDocs(englishQuery);
      const weeklyEnglish = englishSnapshot.docs
        .map(doc => doc.data())
        .filter(e => e.date >= startDateStr && e.date <= endDateStr);
      const englishHours = weeklyEnglish.reduce((sum, e) => sum + (parseInt(e.timeSpent) || 0), 0) / 60;
      
      // 7. Fetch skipped tasks for detailed analysis
      const skippedTasks = weeklyTasks.filter(t => t.status === 'skipped');
      const byCategory = {};
      skippedTasks.forEach(task => {
        if (!byCategory[task.category]) byCategory[task.category] = [];
        byCategory[task.category].push(task);
      });
      
      setSkippedTasksDetail({
        total: skippedTasks.length,
        byCategory,
        tasks: skippedTasks
      });
      
      // 8. Calculate weekly score
      const completionRate = total > 0 ? (completed / total) * 100 : 0;
      const weeklyScore = Math.min(100, Math.floor(completionRate) + Math.floor(streak / 7 * 20));
      
      // 9. Generate dynamic achievements
      const achievements = [];
      if (completionRate > 70) achievements.push(`✅ Completed ${Math.round(completionRate)}% of tasks (${completed}/${total})`);
      if (weeklyWorkouts.length > 3) achievements.push(`💪 Did ${weeklyWorkouts.length} workouts this week`);
      if (englishHours > 3) achievements.push(`📚 Practiced English for ${Math.round(englishHours)} hours`);
      if (streak > 5) achievements.push(`🔥 Maintained ${streak} day habit streak`);
      if (completed > 20) achievements.push(`🎯 Completed ${completed} tasks - Great consistency!`);
      
      if (achievements.length === 0 && total === 0) {
        achievements.push('📝 Start adding tasks to see your achievements!');
        achievements.push('🎯 Add your first task in Daily Planner');
      } else if (achievements.length === 0 && total > 0) {
        achievements.push('🌟 You completed your first tasks! Keep going!');
      }
      
      // 10. Generate improvements based on skipped tasks
      const improvements = [];
      if (skippedTasks.length > 0) {
        improvements.push(`⚠️ You skipped ${skippedTasks.length} tasks this week`);
        const topCategory = Object.entries(byCategory).sort((a, b) => b[1].length - a[1].length)[0];
        if (topCategory) improvements.push(`📌 Focus on "${topCategory[0]}" category - most skipped`);
      }
      if (completionRate < 50 && total > 0) improvements.push(`📈 Try to complete at least 3 tasks daily`);
      if (weeklyWorkouts.length === 0) improvements.push(`🏃 Start with small workouts - even 10 minutes counts!`);
      if (englishHours === 0) improvements.push(`🗣️ Practice English for 15 minutes daily`);
      
      if (improvements.length === 0 && total > 0) {
        improvements.push('🎯 Set higher targets for next week');
        improvements.push('⭐ You\'re doing great! Add more challenging tasks');
      }
      
      setWeeklyData({
        tasksCompleted: completed,
        tasksSkipped: skipped,
        bestCategory: bestCat || 'N/A',
        weakestCategory: worstCat || 'N/A',
        habitStreaks: streak,
        moneySaved: 0, // Will come from savings goals
        workoutCount: weeklyWorkouts.length,
        englishHours: Math.round(englishHours),
        businessProgress: 65,
        weeklyScore: weeklyScore,
        achievements,
        improvements
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      setLoading(false);
    }
  };

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
           weeklyData.weeklyScore >= 40 ? 'Stay consistent next week 📈' : 
           'Start adding tasks to track your progress! 📝'}
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="text-green-500" size={20} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{weeklyData.tasksCompleted}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="text-red-500" size={20} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{weeklyData.tasksSkipped}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Tasks Skipped</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="text-yellow-500" size={20} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{weeklyData.habitStreaks}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Day Streak</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Dumbbell className="text-blue-500" size={20} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{weeklyData.workoutCount}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Workouts</p>
        </div>
      </div>
      
      {/* Daily Performance Chart */}
      {dailyPerformance.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Daily Task Performance</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" fill="#10B981" name="Completed" />
              <Bar dataKey="skipped" fill="#EF4444" name="Skipped" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      
      {/* Category Performance */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-green-600" size={20} />
            <h3 className="font-semibold text-green-800 dark:text-green-400">Best Category</h3>
          </div>
          <p className="text-lg font-bold text-green-700 dark:text-green-300">{weeklyData.bestCategory}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="text-red-600" size={20} />
            <h3 className="font-semibold text-red-800 dark:text-red-400">Needs Improvement</h3>
          </div>
          <p className="text-lg font-bold text-red-700 dark:text-red-300">{weeklyData.weakestCategory}</p>
        </div>
      </div>
      
      {/* SKIPPED TASKS ANALYSIS - NEW SECTION */}
      {skippedTasksDetail.total > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-red-500" size={20} />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                ⚠️ Skipped Tasks ({skippedTasksDetail.total})
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Tasks you missed this week - review and reschedule them
            </p>
          </div>
          
          {/* By Category Breakdown */}
          <div className="p-4">
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">📊 Skipped by Category</h3>
            <div className="space-y-3">
              {Object.entries(skippedTasksDetail.byCategory).map(([category, tasks]) => (
                <div key={category} className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-red-700 dark:text-red-400">{category}</span>
                    <span className="text-sm text-red-600 font-semibold">{tasks.length} skipped</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tasks.slice(0, 5).map((task, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-white dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400">
                        {task.title.length > 25 ? task.title.substring(0, 22) + '...' : task.title}
                      </span>
                    ))}
                    {tasks.length > 5 && (
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-500">+{tasks.length - 5} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Productivity Insight */}
      {skippedTasksDetail.total > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-amber-200">
          <div className="flex items-start gap-3">
            <Brain size={20} className="text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-400">💡 Productivity Insight</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                You skipped {skippedTasksDetail.total} tasks this week.
                {Object.keys(skippedTasksDetail.byCategory)[0] && 
                  ` Most skipped in "${Object.keys(skippedTasksDetail.byCategory)[0]}" category. 
                  Try scheduling these tasks in the morning when your energy is highest.`}
                {weeklyData.weakestCategory !== 'N/A' && 
                  ` Focus on improving your ${weeklyData.weakestCategory} category next week.`}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Achievements & Improvements */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Award className="text-yellow-500" size={20} />
            <h3 className="font-semibold text-gray-900 dark:text-white">Top Achievements</h3>
          </div>
          <ul className="space-y-2">
            {weeklyData.achievements.map((a, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Target className="text-blue-500" size={20} />
            <h3 className="font-semibold text-gray-900 dark:text-white">Focus for Next Week</h3>
          </div>
          <ul className="space-y-2">
            {weeklyData.improvements.map((i, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Clock size={14} className="text-orange-500" />
                <span>{i}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* AI Weekly Advice */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-5 border border-indigo-200">
        <div className="flex items-start gap-3">
          <Zap className="text-indigo-600 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-indigo-800 dark:text-indigo-400">AI Coach Summary</h3>
            <p className="text-gray-700 dark:text-gray-300 mt-1">
              {weeklyData.tasksCompleted === 0 && weeklyData.tasksSkipped === 0 ? 
                `You haven't added any tasks this week. Start by adding tasks in Daily Planner to track your progress!` :
                weeklyData.tasksSkipped > weeklyData.tasksCompleted ?
                `You skipped ${weeklyData.tasksSkipped} tasks this week. Try to focus on completing at least 3 tasks daily.` :
                `Great progress! You completed ${weeklyData.tasksCompleted} tasks. ${weeklyData.weakestCategory !== 'N/A' ? `Next week, focus on your ${weeklyData.weakestCategory} category.` : 'Keep up the momentum!'}`
              }
              {' '}Remember your ₹1.5 Crore wealth goal - every small step counts! 🚀
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}