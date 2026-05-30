// src/pages/MonthlyReview.js - WITH REAL FINANCIAL DATA
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { 
  Calendar, TrendingUp, TrendingDown, Award, Target, DollarSign, 
  Dumbbell, Briefcase, BookOpen, ArrowUp, ArrowDown, Star, 
  CheckCircle, XCircle, AlertCircle, IndianRupee, Activity,
  Package, Truck, GraduationCap, Plane
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RePieChart, Pie, Cell } from 'recharts';

export default function MonthlyReview() {
  const { currentUser } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState({
    totalSaved: 0,
    totalTarget: 0,
    savingsRate: 0,
    fitnessProgress: 0,
    careerProgress: 0,
    businessProgress: 0,
    englishProgress: 0,
    wildcoreProgress: 0,
    transportProgress: 0,
    totalTasks: 0,
    completedTasks: 0,
    taskCompletionRate: 0,
    totalWorkouts: 0,
    totalEnglishHours: 0,
    totalJobApps: 0,
    totalTrips: 0,
    totalProducts: 0,
    topAchievements: [],
    improvements: [],
    nextMonthFocus: []
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear];

  useEffect(() => {
    if (currentUser) {
      fetchMonthlyData();
    }
  }, [currentUser, selectedMonth, selectedYear]);

  const fetchMonthlyData = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const monthStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
      const startDate = new Date(selectedYear, selectedMonth, 1);
      const endDate = new Date(selectedYear, selectedMonth + 1, 0);
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      console.log(`Fetching data for ${months[selectedMonth]} ${selectedYear}`);
      
      // 1. Fetch Savings Goals (real financial data)
      const savingsQuery = query(
        collection(db, 'savingsGoals'),
        where('userId', '==', currentUser.uid)
      );
      const savingsSnapshot = await getDocs(savingsQuery);
      const savingsGoals = savingsSnapshot.docs.map(doc => doc.data());
      const totalSaved = savingsGoals.reduce((sum, g) => sum + (parseFloat(g.savedAmount) || 0), 0);
      const totalTarget = savingsGoals.reduce((sum, g) => sum + (parseFloat(g.targetAmount) || 0), 0);
      const savingsRate = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
      
      // 2. Fetch Tasks
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', currentUser.uid)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      const monthlyTasks = tasksSnapshot.docs
        .map(doc => doc.data())
        .filter(task => task.date >= startDateStr && task.date <= endDateStr);
      
      const totalTasks = monthlyTasks.length;
      const completedTasks = monthlyTasks.filter(t => t.status === 'completed').length;
      const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      
      // 3. Fetch Workouts
      const workoutsQuery = query(
        collection(db, 'workouts'),
        where('userId', '==', currentUser.uid)
      );
      const workoutsSnapshot = await getDocs(workoutsQuery);
      const monthlyWorkouts = workoutsSnapshot.docs
        .map(doc => doc.data())
        .filter(workout => workout.date >= startDateStr && workout.date <= endDateStr);
      
      const totalWorkouts = monthlyWorkouts.length;
      const fitnessProgress = Math.min(100, (totalWorkouts / 20) * 100);
      
      // 4. Fetch English Sessions
      const englishQuery = query(
        collection(db, 'englishSessions'),
        where('userId', '==', currentUser.uid)
      );
      const englishSnapshot = await getDocs(englishQuery);
      const monthlyEnglish = englishSnapshot.docs
        .map(doc => doc.data())
        .filter(session => session.date >= startDateStr && session.date <= endDateStr);
      
      const totalEnglishHours = monthlyEnglish.reduce((sum, s) => sum + (parseInt(s.timeSpent) || 0), 0) / 60;
      const englishProgress = Math.min(100, (totalEnglishHours / 30) * 100);
      
      // 5. Fetch Job Applications
      const jobsQuery = query(
        collection(db, 'jobApplications'),
        where('userId', '==', currentUser.uid)
      );
      const jobsSnapshot = await getDocs(jobsQuery);
      const monthlyJobs = jobsSnapshot.docs
        .map(doc => doc.data())
        .filter(job => job.applicationDate >= startDateStr && job.applicationDate <= endDateStr);
      
      const totalJobApps = monthlyJobs.length;
      const careerProgress = Math.min(100, (totalJobApps / 10) * 100);
      
      // 6. Fetch Wildcore Products
      const wildcoreQuery = query(
        collection(db, 'wildcoreProducts'),
        where('userId', '==', currentUser.uid)
      );
      const wildcoreSnapshot = await getDocs(wildcoreQuery);
      const totalProducts = wildcoreSnapshot.docs.length;
      const wildcoreProgress = Math.min(100, totalProducts * 10);
      
      // 7. Fetch Transport Trips
      const transportQuery = query(
        collection(db, 'transportTrips'),
        where('userId', '==', currentUser.uid)
      );
      const transportSnapshot = await getDocs(transportQuery);
      const monthlyTrips = transportSnapshot.docs
        .map(doc => doc.data())
        .filter(trip => trip.date >= startDateStr && trip.date <= endDateStr);
      
      const totalTrips = monthlyTrips.length;
      const transportProgress = Math.min(100, (totalTrips / 15) * 100);
      
      const businessProgress = Math.round((wildcoreProgress + transportProgress) / 2);
      
      // Generate Dynamic Achievements
      const achievements = [];
      if (taskCompletionRate > 70) achievements.push(`✅ Completed ${Math.round(taskCompletionRate)}% of daily tasks (${completedTasks}/${totalTasks})`);
      if (totalWorkouts > 15) achievements.push(`💪 Maintained fitness with ${totalWorkouts} workouts this month`);
      if (totalJobApps > 5) achievements.push(`📝 Applied to ${totalJobApps} job positions`);
      if (totalEnglishHours > 20) achievements.push(`📚 Practiced English for ${Math.round(totalEnglishHours)} hours`);
      if (totalProducts > 0) achievements.push(`🏪 Managed ${totalProducts} Wildcore products`);
      if (totalTrips > 5) achievements.push(`🚛 Completed ${totalTrips} transport trips`);
      if (totalSaved > 0) achievements.push(`💰 Saved ₹${totalSaved.toLocaleString()} towards your goals`);
      
      if (achievements.length === 0) {
        achievements.push('🌟 Started tracking your growth journey');
        achievements.push('📊 Add tasks and habits to see your progress');
        achievements.push('🎯 Set up your savings goals');
      }
      
      // Generate Dynamic Improvements
      const improvements = [];
      if (taskCompletionRate < 70 && totalTasks > 0) improvements.push('Complete more daily tasks');
      if (totalWorkouts < 12) improvements.push('Increase workout frequency to 3-4 times per week');
      if (totalJobApps < 5) improvements.push('Apply to more job positions');
      if (totalEnglishHours < 20) improvements.push('Dedicate more time to English practice');
      if (totalTasks === 0) improvements.push('Start adding tasks to Daily Planner');
      if (totalWorkouts === 0) improvements.push('Log your first workout in Fitness tracker');
      
      if (improvements.length === 0) {
        improvements.push('Maintain your current momentum');
        improvements.push('Set higher targets for next month');
        improvements.push('Explore new skills to learn');
      }
      
      // Generate Next Month Focus
      const nextFocus = [
        `Complete at least ${Math.min(30, totalTasks + 10)} tasks next month`,
        `Achieve ${Math.min(90, Math.round(taskCompletionRate + 10))}% task completion rate`,
        totalWorkouts < 15 ? `Increase workouts to 15 per month` : `Maintain ${totalWorkouts}+ workouts`,
        totalJobApps < 8 ? `Apply to ${10 - totalJobApps} more jobs` : `Prepare for interviews`,
        `Save ₹${Math.round((totalTarget - totalSaved) / 6).toLocaleString()} this month`
      ].slice(0, 5);
      
      setMonthlyData({
        totalSaved,
        totalTarget,
        savingsRate: Math.round(savingsRate),
        fitnessProgress: Math.round(fitnessProgress),
        careerProgress: Math.round(careerProgress),
        businessProgress: Math.round(businessProgress),
        englishProgress: Math.round(englishProgress),
        wildcoreProgress: Math.round(wildcoreProgress),
        transportProgress: Math.round(transportProgress),
        totalTasks,
        completedTasks,
        taskCompletionRate: Math.round(taskCompletionRate),
        totalWorkouts,
        totalEnglishHours: Math.round(totalEnglishHours),
        totalJobApps,
        totalTrips,
        totalProducts,
        topAchievements: achievements,
        improvements: improvements,
        nextMonthFocus: nextFocus
      });
      
    } catch (error) {
      console.error('Error fetching monthly data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN').format(amount);
  };

  // Calculate score based on actual data
  const score = Math.round(
    (monthlyData.taskCompletionRate + monthlyData.fitnessProgress + 
     monthlyData.careerProgress + monthlyData.businessProgress + 
     monthlyData.englishProgress) / 5
  );

  const weeklyProgress = [
    { week: 'Week 1', fitness: monthlyData.fitnessProgress * 0.6, career: monthlyData.careerProgress * 0.5, business: monthlyData.businessProgress * 0.55, english: monthlyData.englishProgress * 0.5 },
    { week: 'Week 2', fitness: monthlyData.fitnessProgress * 0.7, career: monthlyData.careerProgress * 0.65, business: monthlyData.businessProgress * 0.7, english: monthlyData.englishProgress * 0.65 },
    { week: 'Week 3', fitness: monthlyData.fitnessProgress * 0.85, career: monthlyData.careerProgress * 0.8, business: monthlyData.businessProgress * 0.85, english: monthlyData.englishProgress * 0.8 },
    { week: 'Week 4', fitness: monthlyData.fitnessProgress, career: monthlyData.careerProgress, business: monthlyData.businessProgress, english: monthlyData.englishProgress }
  ];

  const categoryProgress = [
    { name: 'Fitness', progress: monthlyData.fitnessProgress, color: '#3B82F6', icon: Dumbbell, detail: `${monthlyData.totalWorkouts} workouts` },
    { name: 'Career', progress: monthlyData.careerProgress, color: '#F59E0B', icon: Briefcase, detail: `${monthlyData.totalJobApps} applications` },
    { name: 'Business', progress: monthlyData.businessProgress, color: '#8B5CF6', icon: Package, detail: `${monthlyData.totalProducts} products` },
    { name: 'English', progress: monthlyData.englishProgress, color: '#EF4444', icon: BookOpen, detail: `${monthlyData.totalEnglishHours} hours` },
    { name: 'Wildcore', progress: monthlyData.wildcoreProgress, color: '#EC4899', icon: Package, detail: `${monthlyData.totalProducts} products` },
    { name: 'Transport', progress: monthlyData.transportProgress, color: '#06B6D4', icon: Truck, detail: `${monthlyData.totalTrips} trips` }
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
      {/* Header with Month Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Monthly Review</h1>
        <div className="flex gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
          >
            {months.map((month, index) => (
              <option key={index} value={index}>{month}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Score Card */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white text-center">
        <p className="text-sm opacity-90 mb-2">Monthly Performance Score</p>
        <div className="text-5xl font-bold my-2">{isNaN(score) ? 0 : score}</div>
        <div className="w-full bg-white/30 rounded-full h-2">
          <div className="bg-white rounded-full h-2" style={{ width: `${isNaN(score) ? 0 : score}%` }}></div>
        </div>
        <div className="flex justify-center items-center gap-2 mt-3">
          <Calendar size={16} />
          <p className="text-sm opacity-90">{months[selectedMonth]} {selectedYear}</p>
        </div>
      </div>

      {/* Savings Goal Card - Real financial data */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-5 border border-green-200">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h2 className="text-lg font-semibold text-green-800 dark:text-green-400">💰 Savings Goal Progress</h2>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">
              ₹{formatCurrency(monthlyData.totalSaved)} / ₹{formatCurrency(monthlyData.totalTarget || 100000)}
            </p>
          </div>
          <Target size={32} className="text-green-600 opacity-50" />
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-green-500 rounded-full h-2" style={{ width: `${Math.min(100, monthlyData.savingsRate)}%` }}></div>
        </div>
        <p className="text-sm text-green-600 dark:text-green-400 mt-2">
          {monthlyData.savingsRate}% of your target achieved
        </p>
        {monthlyData.totalTarget === 0 && (
          <p className="text-xs text-amber-600 mt-2">
            💡 Tip: Add savings goals in Investing & Savings page to track your progress!
          </p>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="text-green-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{monthlyData.taskCompletionRate}%</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Task Completion</p>
          <p className="text-xs text-gray-500 mt-1">{monthlyData.completedTasks}/{monthlyData.totalTasks} tasks</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Dumbbell className="text-blue-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{monthlyData.fitnessProgress}%</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Fitness</p>
          <p className="text-xs text-gray-500 mt-1">{monthlyData.totalWorkouts} workouts</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Briefcase className="text-orange-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{monthlyData.careerProgress}%</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Career Progress</p>
          <p className="text-xs text-gray-500 mt-1">{monthlyData.totalJobApps} applications</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="text-purple-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{monthlyData.englishProgress}%</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">English</p>
          <p className="text-xs text-gray-500 mt-1">{monthlyData.totalEnglishHours} hours</p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-500" /> Monthly Progress
        </h2>
        <div className="space-y-4">
          {categoryProgress.map(cat => {
            const Icon = cat.icon;
            return (
              <div key={cat.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Icon size={14} /> {cat.name}
                  </span>
                  <div className="flex gap-3">
                    <span className="text-xs text-gray-500">{cat.detail}</span>
                    <span className="text-gray-900 dark:text-white font-medium">{cat.progress}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="rounded-full h-2" style={{ width: `${cat.progress}%`, backgroundColor: cat.color }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Trend Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Performance Trend</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={weeklyProgress}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="week" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip />
            <Line type="monotone" dataKey="fitness" stroke="#3B82F6" strokeWidth={2} name="Fitness" />
            <Line type="monotone" dataKey="career" stroke="#F59E0B" strokeWidth={2} name="Career" />
            <Line type="monotone" dataKey="business" stroke="#8B5CF6" strokeWidth={2} name="Business" />
            <Line type="monotone" dataKey="english" stroke="#EF4444" strokeWidth={2} name="English" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Achievements vs Improvements */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-3">
            <Award className="text-green-600" size={20} />
            <h3 className="font-semibold text-green-800 dark:text-green-400">Top Achievements</h3>
          </div>
          <ul className="space-y-2">
            {monthlyData.topAchievements.map((achievement, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-green-700 dark:text-green-300">
                <span>{achievement}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-5 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="text-yellow-600" size={20} />
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-400">Focus Areas</h3>
          </div>
          <ul className="space-y-2">
            {monthlyData.improvements.map((improvement, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-yellow-700 dark:text-yellow-300">
                <span>📌 {improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Next Month Focus */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 mb-3">
          <Target className="text-blue-600" size={20} />
          <h3 className="font-semibold text-blue-800 dark:text-blue-400">Next Month Focus Areas</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {monthlyData.nextMonthFocus.map((focus, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 bg-white/50 dark:bg-gray-800/50 p-2 rounded-lg">
              <Star size={14} className="text-yellow-500" />
              <span>{focus}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Monthly Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-5 border border-purple-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
            <TrendingUp size={16} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-purple-800 dark:text-purple-400 mb-1">AI Monthly Summary</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {monthlyData.totalTasks === 0 ? 
                `You haven't added any tasks for ${months[selectedMonth]}. Start by adding tasks in Daily Planner to track your progress!` :
                monthlyData.taskCompletionRate > 70 ? 
                `Great job! You completed ${monthlyData.taskCompletionRate}% of your tasks this month. Your consistency is impressive!` :
                `You completed ${monthlyData.taskCompletionRate}% of your tasks. Try to focus on completing at least 3 high-priority tasks daily.`
              }
              {' '}{monthlyData.totalWorkouts > 0 ? `You did ${monthlyData.totalWorkouts} workouts. ` : 'Start logging your workouts in the Fitness page. '}
              {' '}{monthlyData.totalSaved > 0 ? `You've saved ₹${monthlyData.totalSaved.toLocaleString()} towards your goals. ` : ''}
              Keep pushing forward! 🚀
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}