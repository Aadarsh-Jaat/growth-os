
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';
import {
  TrendingUp,
  CheckCircle,
  Target,
  Calendar,
  Activity,
  Dumbbell,
  Briefcase,
  TrendingDown,
  Gift,
  Zap,
  Flame,
  BookOpen,
  DollarSign,
  Truck,
  Package
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';

export default function Dashboard() {
  const { currentUser, userData } = useAuth();
  const location = useLocation();
  const [todayTasks, setTodayTasks] = useState([]);
  const [completionRate, setCompletionRate] = useState(0);
  const [streaks, setStreaks] = useState({});
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [recentActivity, setRecentActivity] = useState([]);
  const [totalSaved, setTotalSaved] = useState(0);

  const WEALTH_GOAL = 15000000; // ₹1.5 Crore

  const toMs = (t) => {
    if (!t) return 0;
    if (typeof t.toMillis === 'function') return t.toMillis();
    if (t.seconds) return t.seconds * 1000;
    return new Date(t).getTime() || 0;
  };

  const fetchTotalSaved = async () => {
    if (!currentUser) return;
    try {
      const goalsQuery = query(
        collection(db, 'savingsGoals'),
        where('userId', '==', currentUser.uid)
      );
      const goalsSnapshot = await getDocs(goalsQuery);
      const saved = goalsSnapshot.docs.reduce(
        (sum, d) => sum + (Number(d.data().savedAmount) || 0),
        0
      );
      setTotalSaved(saved);
    } catch (error) {
      console.error('Error fetching savings total:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser, location.pathname]);

  const fetchDashboardData = async () => {
    setLoading(true);
    await fetchTotalSaved();

    try {
      const today = new Date().toISOString().split('T')[0];
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', currentUser.uid),
        where('date', '==', today)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = tasksSnapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt));
      setTodayTasks(tasks);

      const completed = tasks.filter((t) => t.status === 'completed').length;
      const rate = tasks.length > 0 ? (completed / tasks.length) * 100 : 0;
      setCompletionRate(rate);

      const habitsQuery = query(
        collection(db, 'habits'),
        where('userId', '==', currentUser.uid)
      );
      const habitsSnapshot = await getDocs(habitsQuery);
      const habits = habitsSnapshot.docs
        .map((d) => d.data())
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
        .slice(0, 30);

      const habitStreaks = {};
      habits.forEach((habit) => {
        if (!habitStreaks[habit.name]) {
          habitStreaks[habit.name] = 0;
        }
        if (habit.completed) {
          habitStreaks[habit.name]++;
        } else {
          habitStreaks[habit.name] = 0;
        }
      });
      setStreaks(habitStreaks);

      generateAISuggestion(tasks, habits);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const wealthRemaining = Math.max(0, WEALTH_GOAL - totalSaved);
  const wealthProgress = Math.min(100, (totalSaved / WEALTH_GOAL) * 100);

  const generateAISuggestion = (tasks, habits) => {
    const suggestions = [
      "🎯 Today's focus: Complete your high-priority tasks first thing in the morning!",
      "💪 You're doing great! Keep your fitness streak alive today.",
      "📚 Practice English speaking for 15 minutes - consistency beats intensity!",
      "🎨 Work on one Wildcore marketing idea today. Small steps lead to big results.",
      "💰 Review your expenses from last week and identify one area to save more.",
      "🚀 Your career growth depends on daily coding practice. Even 30 minutes counts!",
      "🧘 Take 5 minutes to plan your day. Clarity creates action.",
      "⭐ Remember your ₹10-15 crore goal. Every small action today moves you closer.",
      "📊 Check your weekly review to see your progress and adjust your strategy.",
      "🎯 Focus on completing 3 most important tasks today - quality over quantity!"
    ];
    
    setAiSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)]);
  };

  const performanceData = [
    { day: 'Mon', score: 75, tasks: 8 },
    { day: 'Tue', score: 82, tasks: 10 },
    { day: 'Wed', score: 78, tasks: 7 },
    { day: 'Thu', score: 88, tasks: 12 },
    { day: 'Fri', score: 85, tasks: 9 },
    { day: 'Sat', score: 70, tasks: 6 },
    { day: 'Sun', score: 65, tasks: 5 }
  ];

  const categoryData = [
    { name: 'Fitness', value: 85, color: '#3B82F6', icon: '💪' },
    { name: 'English', value: 60, color: '#10B981', icon: '📚' },
    { name: 'Career', value: 45, color: '#F59E0B', icon: '💼' },
    { name: 'Business', value: 70, color: '#8B5CF6', icon: '🏪' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {userData?.name || 'Growth Seeker'}! 👋
            </h1>
            <p className="opacity-90">Today is a new opportunity to become better than yesterday.</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Zap size={32} className="text-yellow-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="text-green-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{completionRate}%</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Task Completion</p>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div className="bg-green-500 rounded-full h-1.5" style={{ width: `${completionRate}%` }}></div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Flame className="text-orange-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {Object.values(streaks).reduce((a, b) => a + b, 0)}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Streaks</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Dumbbell className="text-blue-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">4</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Workouts This Week</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Target className="text-purple-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              ₹{wealthRemaining.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Remaining of ₹1.5Cr (you saved ₹{totalSaved.toLocaleString('en-IN')} across goals)
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
            <div
              className="bg-purple-600 rounded-full h-1.5"
              style={{ width: `${wealthProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* AI Suggestion Card */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-5 border border-amber-200 dark:border-amber-800">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
            <Zap className="text-amber-600 dark:text-amber-400" size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">AI Coach Suggestion</h3>
            <p className="text-gray-700 dark:text-gray-300">{aiSuggestion}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Tasks</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {todayTasks.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">No tasks for today</p>
                <button className="mt-2 text-sm text-blue-600 hover:text-blue-700">
                  Add some tasks →
                </button>
              </div>
            ) : (
              todayTasks.slice(0, 5).map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{task.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{task.category}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    task.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                    task.status === 'in progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                  }`}>
                    {task.status || 'pending'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Weekly Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Performance Score</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip />
              <Area type="monotone" dataKey="score" stroke="#3B82F6" fillOpacity={1} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Progress</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, value }) => `${name} ${value}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {categoryData.map(cat => (
              <div key={cat.name} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Overview</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Fitness Consistency</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">4/6 days</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-600 rounded-full h-2" style={{ width: '66%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">English Practice Streak</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">5 days</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-600 rounded-full h-2" style={{ width: '71%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Savings Goal</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">₹25,000 / ₹50,000</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-purple-600 rounded-full h-2" style={{ width: '50%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Coding Practice</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">3 hours this week</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-orange-600 rounded-full h-2" style={{ width: '43%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}