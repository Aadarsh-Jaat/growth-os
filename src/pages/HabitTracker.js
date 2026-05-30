// pages/HabitTracker.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { Check, Flame, Calendar as CalendarIcon, Target } from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const habits = [
  'Workout', 'Walking', 'Water Intake', 'Sleep', 'English Speaking',
  'Coding', 'Reading', 'Investing Study', 'Savings', 'No Junk Food',
  'No Unnecessary Scrolling'
];

export default function HabitTracker() {
  const { currentUser } = useAuth();
  const [habitData, setHabitData] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [streaks, setStreaks] = useState({});
  const [bestStreaks, setBestStreaks] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchHabitData();
    }
  }, [currentUser, selectedDate]);

  const fetchHabitData = async () => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const habitsQuery = query(
        collection(db, 'habits'),
        where('userId', '==', currentUser.uid)
      );
      const snapshot = await getDocs(habitsQuery);
      const data = {};
      const streakCounts = {};
      const bestStreakCounts = {};
      
      snapshot.docs.forEach(doc => {
        const habit = doc.data();
        const dateKey = habit.date;
        if (!data[dateKey]) data[dateKey] = {};
        data[dateKey][habit.name] = habit.completed;
        
        // Calculate streaks
        if (!streakCounts[habit.name]) streakCounts[habit.name] = 0;
        if (!bestStreakCounts[habit.name]) bestStreakCounts[habit.name] = 0;
        
        if (habit.completed) {
          streakCounts[habit.name]++;
          bestStreakCounts[habit.name] = Math.max(bestStreakCounts[habit.name], streakCounts[habit.name]);
        } else {
          streakCounts[habit.name] = 0;
        }
      });
      
      setHabitData(data);
      setStreaks(streakCounts);
      setBestStreaks(bestStreakCounts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching habits:', error);
      setLoading(false);
    }
  };

  const toggleHabit = async (habitName) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const currentValue = habitData[dateStr]?.[habitName] || false;
    
    try {
      const existingQuery = query(
        collection(db, 'habits'),
        where('userId', '==', currentUser.uid),
        where('name', '==', habitName),
        where('date', '==', dateStr)
      );
      const snapshot = await getDocs(existingQuery);
      
      if (snapshot.empty) {
        await addDoc(collection(db, 'habits'), {
          userId: currentUser.uid,
          name: habitName,
          date: dateStr,
          completed: !currentValue,
          createdAt: new Date()
        });
      } else {
        await updateDoc(doc(db, 'habits', snapshot.docs[0].id), {
          completed: !currentValue,
          updatedAt: new Date()
        });
      }
      
      fetchHabitData();
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };

  const dateStr = selectedDate.toISOString().split('T')[0];
  const todayHabits = habitData[dateStr] || {};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 text-white">
          <Flame size={24} className="mb-2" />
          <div className="text-2xl font-bold">
            {Object.values(streaks).reduce((a, b) => a + b, 0)}
          </div>
          <div className="text-sm opacity-90">Total Streak Days</div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-4 text-white">
          <Check size={24} className="mb-2" />
          <div className="text-2xl font-bold">
            {Object.values(todayHabits).filter(v => v === true).length}
          </div>
          <div className="text-sm opacity-90">Completed Today</div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white">
          <Target size={24} className="mb-2" />
          <div className="text-2xl font-bold">
            {Math.round((Object.values(todayHabits).filter(v => v === true).length / habits.length) * 100)}%
          </div>
          <div className="text-sm opacity-90">Completion Rate</div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-4 text-white">
          <CalendarIcon size={24} className="mb-2" />
          <div className="text-2xl font-bold">
            {Object.keys(habitData).length}
          </div>
          <div className="text-sm opacity-90">Days Tracked</div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Habit Calendar</h2>
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileClassName={({ date, view }) => {
            if (view === 'month') {
              const dateKey = date.toISOString().split('T')[0];
              const dayHabits = habitData[dateKey];
              if (dayHabits) {
                const completedCount = Object.values(dayHabits).filter(v => v === true).length;
                if (completedCount === habits.length) return 'bg-green-500 text-white rounded-full';
                if (completedCount > habits.length / 2) return 'bg-green-200 dark:bg-green-800 rounded-full';
                if (completedCount > 0) return 'bg-yellow-200 dark:bg-yellow-800 rounded-full';
              }
            }
            return '';
          }}
        />
      </div>

      {/* Habits Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {selectedDate.toDateString() === new Date().toDateString() ? "Today's Habits" : selectedDate.toDateString()}
          </h2>
          <div className="text-sm text-gray-500">
            Best Streak: {Math.max(...Object.values(bestStreaks), 0)} days
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {habits.map(habit => {
            const completed = todayHabits[habit] || false;
            const streak = streaks[habit] || 0;
            const bestStreak = bestStreaks[habit] || 0;
            
            return (
              <button
                key={habit}
                onClick={() => toggleHabit(habit)}
                className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                  completed 
                    ? 'bg-green-50 dark:bg-green-900/30 border-2 border-green-500' 
                    : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <div className="text-left">
                  <div className={`font-medium ${completed ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                    {habit}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    🔥 Streak: {streak} days | Best: {bestStreak}
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  completed 
                    ? 'bg-green-500 border-green-500' 
                    : 'border-gray-400 dark:border-gray-500'
                }`}>
                  {completed && <Check size={14} className="text-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}