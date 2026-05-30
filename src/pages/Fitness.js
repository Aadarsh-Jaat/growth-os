
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import {
  Dumbbell,
  Activity,
  Heart,
  Moon,
  Droplets,
  Ruler,
  Weight,
  TrendingUp,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  BarChart3,
  Target
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function Fitness() {
  const { currentUser } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [weightEntries, setWeightEntries] = useState([]);
  const [sleepData, setSleepData] = useState([]);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    workoutType: '',
    exercises: '',
    sets: '',
    reps: '',
    duration: '',
    calories: '',
    notes: ''
  });

  const workoutTypes = [
    'Strength Training', 'Cardio', 'HIIT', 'Yoga', 'Calisthenics', 
    'Running', 'Cycling', 'Swimming', 'Walking', 'Sports'
  ];

  useEffect(() => {
    if (currentUser) {
      fetchFitnessData();
    }
  }, [currentUser]);

  const sortByDateDesc = (a, b) => (b.date || '').localeCompare(a.date || '');

  const fetchFitnessData = async () => {
    if (!currentUser) return;
    try {
      const workoutsQuery = query(
        collection(db, 'workouts'),
        where('userId', '==', currentUser.uid)
      );
      const workoutsSnapshot = await getDocs(workoutsQuery);
      const workoutsData = workoutsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      workoutsData.sort(sortByDateDesc);
      setWorkouts(workoutsData);

      const weightQuery = query(
        collection(db, 'weightEntries'),
        where('userId', '==', currentUser.uid)
      );
      const weightSnapshot = await getDocs(weightQuery);
      const weights = weightSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      weights.sort(sortByDateDesc);
      setWeightEntries(weights);

      const sleepQuery = query(
        collection(db, 'sleepEntries'),
        where('userId', '==', currentUser.uid)
      );
      const sleepSnapshot = await getDocs(sleepQuery);
      const sleep = sleepSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      sleep.sort(sortByDateDesc);
      setSleepData(sleep);
    } catch (error) {
      console.error('Error fetching fitness data:', error);
      alert(`Could not load fitness data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkout = async () => {
    if (!currentUser) {
      alert('You must be logged in.');
      return;
    }
    if (!formData.workoutType) {
      alert('Please select a workout type.');
      return;
    }
    try {
      const date = editingWorkout?.date || new Date().toISOString().split('T')[0];
      const workoutData = {
        workoutType: formData.workoutType,
        exercises: formData.exercises,
        sets: formData.sets,
        reps: formData.reps,
        duration: formData.duration,
        calories: formData.calories,
        notes: formData.notes,
        userId: currentUser.uid,
        date
      };

      if (editingWorkout?.id) {
        await updateDoc(doc(db, 'workouts', editingWorkout.id), {
          ...workoutData,
          updatedAt: new Date()
        });
      } else {
        const docRef = await addDoc(collection(db, 'workouts'), {
          ...workoutData,
          createdAt: new Date()
        });
        setWorkouts((prev) =>
          [{ id: docRef.id, ...workoutData, createdAt: new Date() }, ...prev].sort(sortByDateDesc)
        );
      }

      setShowWorkoutModal(false);
      setEditingWorkout(null);
      setFormData({
        workoutType: '',
        exercises: '',
        sets: '',
        reps: '',
        duration: '',
        calories: '',
        notes: ''
      });
      await fetchFitnessData();
    } catch (error) {
      console.error('Error saving workout:', error);
      alert(`Failed to save workout: ${error.message}`);
    }
  };

  const handleDeleteWorkout = async (id) => {
    if (window.confirm('Delete this workout?')) {
      try {
        await deleteDoc(doc(db, 'workouts', id));
        setWorkouts((prev) => prev.filter((w) => w.id !== id));
        await fetchFitnessData();
      } catch (error) {
        console.error('Error deleting workout:', error);
        alert(`Failed to delete workout: ${error.message}`);
      }
    }
  };

  const stats = {
    totalWorkouts: workouts.length,
    totalMinutes: workouts.reduce((sum, w) => sum + (parseInt(w.duration) || 0), 0),
    avgCalories: Math.round(workouts.reduce((sum, w) => sum + (parseInt(w.calories) || 0), 0) / (workouts.length || 1)),
    consistency: Math.round((workouts.length / 30) * 100)
  };

  const weightProgressData = [...weightEntries].reverse().map(w => ({
    date: w.date,
    weight: w.weight
  }));

  const workoutChartData = workouts.reduce((acc, workout) => {
    const date = workout.date;
    if (!acc[date]) acc[date] = 0;
    acc[date]++;
    return acc;
  }, {});

  const workoutData = Object.entries(workoutChartData).map(([date, count]) => ({ date, count })).slice(-7);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fitness Tracker</h1>
        <button
          onClick={() => {
            setEditingWorkout(null);
            setShowWorkoutModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus size={18} />
          Log Workout
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Dumbbell className="text-blue-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalWorkouts}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Workouts</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Activity className="text-green-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalMinutes}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Minutes Active</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Heart className="text-red-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgCalories}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Avg Calories</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Target className="text-purple-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.consistency}%</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Consistency</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weight Progress</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weightProgressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Workout Frequency</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={workoutData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Workout History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Workout History</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {workouts.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No workouts logged yet. Start tracking your fitness journey!
            </div>
          ) : (
            workouts.map(workout => (
              <div key={workout.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{workout.workoutType}</h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{workout.date}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                      {workout.duration && <span>⏱️ {workout.duration} min</span>}
                      {workout.calories && <span>🔥 {workout.calories} cal</span>}
                      {workout.sets && workout.reps && <span>💪 {workout.sets} x {workout.reps}</span>}
                    </div>
                    {workout.notes && <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{workout.notes}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingWorkout(workout);
                        setFormData(workout);
                        setShowWorkoutModal(true);
                      }}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                    >
                      <Edit2 size={16} className="text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDeleteWorkout(workout.id)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Workout Modal */}
      {showWorkoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingWorkout ? 'Edit Workout' : 'Log Workout'}
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <select
                value={formData.workoutType}
                onChange={(e) => setFormData({...formData, workoutType: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Select Workout Type</option>
                {workoutTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
              
              <input
                type="text"
                placeholder="Exercises (e.g., Bench Press, Squats)"
                value={formData.exercises}
                onChange={(e) => setFormData({...formData, exercises: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
              
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Sets"
                  value={formData.sets}
                  onChange={(e) => setFormData({...formData, sets: e.target.value})}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
                <input
                  type="number"
                  placeholder="Reps"
                  value={formData.reps}
                  onChange={(e) => setFormData({...formData, reps: e.target.value})}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Duration (minutes)"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
                <input
                  type="number"
                  placeholder="Calories Burned"
                  value={formData.calories}
                  onChange={(e) => setFormData({...formData, calories: e.target.value})}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <textarea
                placeholder="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 resize-none"
                rows="3"
              />
            </div>
            <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={handleSaveWorkout}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => setShowWorkoutModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}