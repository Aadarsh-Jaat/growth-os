// pages/DailyPlanner.js (Complete)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Smile,
  Meh,
  Frown,
  TrendingUp,
  Calendar
} from 'lucide-react';
import TaskModal from '../components/TaskModal';

const categories = [
  'Fitness', 'English', 'Coding / Job', 'Wildcore Perfume Brand',
  'Bhukker Transport Co.', 'Investing', 'Savings', 'Government Job',
  'Abroad Planning', 'Personal Work', 'Family Work'
];

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' }
];

export default function DailyPlanner() {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyNote, setDailyNote] = useState('');
  const [mood, setMood] = useState('');
  const [energy, setEnergy] = useState(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchTasks();
      fetchDailyData();
    }
  }, [currentUser, selectedDate]);

  const sortTasks = (tasksData) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return [...tasksData].sort((a, b) => {
      const pDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (pDiff !== 0) return pDiff;
      const toMs = (t) => {
        if (!t) return 0;
        if (typeof t.toMillis === 'function') return t.toMillis();
        if (t.seconds) return t.seconds * 1000;
        return new Date(t).getTime() || 0;
      };
      return toMs(b.createdAt) - toMs(a.createdAt);
    });
  };

  const fetchTasks = async () => {
    if (!currentUser) return [];
    try {
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', currentUser.uid),
        where('date', '==', selectedDate)
      );
      const snapshot = await getDocs(tasksQuery);
      const tasksData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      const sorted = sortTasks(tasksData);
      setTasks(sorted);
      return sorted;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      alert(`Could not load tasks: ${error.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyData = async () => {
    try {
      const dailyQuery = query(
        collection(db, 'dailyEntries'),
        where('userId', '==', currentUser.uid),
        where('date', '==', selectedDate)
      );
      const snapshot = await getDocs(dailyQuery);
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setDailyNote(data.note || '');
        setMood(data.mood || '');
        setEnergy(data.energy || 5);
      }
    } catch (error) {
      console.error('Error fetching daily data:', error);
    }
  };

  const saveDailyData = async () => {
    try {
      const dailyQuery = query(
        collection(db, 'dailyEntries'),
        where('userId', '==', currentUser.uid),
        where('date', '==', selectedDate)
      );
      const snapshot = await getDocs(dailyQuery);
      
      if (snapshot.empty) {
        await addDoc(collection(db, 'dailyEntries'), {
          userId: currentUser.uid,
          date: selectedDate,
          note: dailyNote,
          mood: mood,
          energy: energy,
          createdAt: new Date()
        });
      } else {
        await updateDoc(doc(db, 'dailyEntries', snapshot.docs[0].id), {
          note: dailyNote,
          mood: mood,
          energy: energy,
          updatedAt: new Date()
        });
      }
      alert('Daily data saved!');
    } catch (error) {
      console.error('Error saving daily data:', error);
    }
  };

  const handleSaveTask = async (taskData) => {
    if (!currentUser) {
      alert('You must be logged in to save tasks.');
      return;
    }
    try {
      if (editingTask) {
        await updateDoc(doc(db, 'tasks', editingTask.id), {
          ...taskData,
          updatedAt: new Date()
        });
      } else {
        const newTask = {
          ...taskData,
          userId: currentUser.uid,
          createdAt: new Date(),
          date: selectedDate,
          status: 'pending'
        };
        const docRef = await addDoc(collection(db, 'tasks'), newTask);
        setTasks((prev) =>
          sortTasks([...prev, { id: docRef.id, ...newTask }])
        );
      }
      setShowModal(false);
      setEditingTask(null);
      await fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
      alert(`Failed to save task: ${error.message}`);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteDoc(doc(db, 'tasks', taskId));
        fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), { status });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const carryForwardTasks = async () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const incompleteTasks = tasks.filter(t => t.status !== 'completed');
    
    for (const task of incompleteTasks) {
      const { id, ...taskWithoutId } = task;
      await addDoc(collection(db, 'tasks'), {
        ...taskWithoutId,
        date: tomorrow,
        createdAt: new Date(),
        status: 'pending'
      });
    }
    alert(`${incompleteTasks.length} tasks carried forward to tomorrow`);
  };

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const skippedTasks = tasks.filter(t => t.status === 'skipped').length;
  const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  const getMoodIcon = () => {
    switch(mood) {
      case 'happy': return <Smile className="text-green-500" size={24} />;
      case 'neutral': return <Meh className="text-yellow-500" size={24} />;
      case 'sad': return <Frown className="text-red-500" size={24} />;
      default: return null;
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
      {/* Date Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar size={20} className="text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <button
            onClick={carryForwardTasks}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Carry Forward
          </button>
        </div>
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 dark:text-gray-400">Completion Rate</span>
            <TrendingUp className="text-blue-500" size={20} />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{completionRate.toFixed(0)}%</div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
            <div className="bg-blue-600 rounded-full h-2" style={{ width: `${completionRate}%` }}></div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 dark:text-gray-400">Completed Tasks</span>
            <CheckCircle className="text-green-500" size={20} />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {completedTasks} / {tasks.length}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 dark:text-gray-400">Skipped Tasks</span>
            <AlertCircle className="text-orange-500" size={20} />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{skippedTasks}</div>
        </div>
      </div>

      {/* Mood & Energy Tracker */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Check-in</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">How are you feeling?</label>
            <div className="flex space-x-4">
              {['happy', 'neutral', 'sad'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={`p-3 rounded-lg transition ${
                    mood === m ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  {m === 'happy' && <Smile size={24} className={mood === m ? 'text-blue-600' : 'text-gray-600'} />}
                  {m === 'neutral' && <Meh size={24} className={mood === m ? 'text-blue-600' : 'text-gray-600'} />}
                  {m === 'sad' && <Frown size={24} className={mood === m ? 'text-blue-600' : 'text-gray-600'} />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Energy Level: {energy}/10</label>
            <input
              type="range"
              min="1"
              max="10"
              value={energy}
              onChange={(e) => setEnergy(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="md:col-span-2">
            <textarea
              value={dailyNote}
              onChange={(e) => setDailyNote(e.target.value)}
              placeholder="Daily notes, reflections, or highlights..."
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
              rows="3"
            />
          </div>

          <button
            onClick={saveDailyData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Save Daily Check-in
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Tasks</h2>
    <div className="flex gap-2">
      {/* Generate Fixed Tasks Button */}
      <button
        onClick={async () => {
          if (!currentUser) return;
          try {
            // Fetch active fixed tasks
            const fixedTasksQuery = query(
              collection(db, 'fixedTasks'),
              where('userId', '==', currentUser.uid),
              where('active', '==', true)
            );
            const snapshot = await getDocs(fixedTasksQuery);
            const today = new Date().toISOString().split('T')[0];
            let addedCount = 0;
            
            for (const doc of snapshot.docs) {
              const task = doc.data();
              
              // Check if task already exists for today
              const existingQuery = query(
                collection(db, 'tasks'),
                where('userId', '==', currentUser.uid),
                where('title', '==', task.title),
                where('date', '==', today)
              );
              const existing = await getDocs(existingQuery);
              
              if (existing.empty) {
                await addDoc(collection(db, 'tasks'), {
                  title: task.title,
                  category: task.category || 'Personal Work',
                  priority: task.priority || 'medium',
                  estimatedTime: task.estimatedTime || '',
                  notes: `🔄 Fixed task - ${task.targetTime ? `Target time: ${task.targetTime}` : 'Complete today!'}`,
                  status: 'pending',
                  date: today,
                  userId: currentUser.uid,
                  isFixedTask: true,
                  fixedTaskId: task.id,
                  createdAt: new Date()
                });
                addedCount++;
              }
            }
            
            if (addedCount > 0) {
              alert(`✅ ${addedCount} fixed tasks added for today!`);
              fetchTasks(); // Refresh the task list
            } else {
              alert(`📋 All fixed tasks are already in your today's list.`);
            }
          } catch (error) {
            console.error('Error generating fixed tasks:', error);
            alert('Failed to generate fixed tasks: ' + error.message);
          }
        }}
        className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        <span>Generate Fixed</span>
      </button>
      
      {/* Existing Add Task Button */}
      <button
        onClick={() => {
          setEditingTask(null);
          setShowModal(true);
        }}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        <Plus size={18} />
        <span>Add Task</span>
      </button>
    </div>
  </div>
</div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {tasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No tasks for today. Click "Add Task" to get started!
            </div>
          ) : (
            tasks.map((task) => {
              const priority = priorities.find(p => p.value === task.priority);
              return (
                <div key={task.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <input
                        type="checkbox"
                        checked={task.status === 'completed'}
                        onChange={() => updateTaskStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className={`font-medium text-gray-900 dark:text-white ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                            {task.title}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded ${priority?.color}`}>
                            {priority?.label}
                          </span>
                          <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                            {task.category}
                          </span>
                        </div>
                        {task.estimatedTime && (
                          <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 mb-1">
                            <Clock size={14} />
                            <span>{task.estimatedTime} mins</span>
                          </div>
                        )}
                        {task.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.notes}</p>
                        )}
                        {task.deadline && (
                          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Due: {new Date(task.deadline).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingTask(task);
                          setShowModal(true);
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                      >
                        <Edit2 size={16} className="text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                  {task.status !== 'completed' && task.status !== 'skipped' && (
                    <div className="ml-8 mt-2 flex space-x-2">
                      <button
                        onClick={() => updateTaskStatus(task.id, 'in progress')}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Start
                      </button>
                      <button
                        onClick={() => updateTaskStatus(task.id, 'skipped')}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        Skip
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Task Modal */}
      {showModal && (
        <TaskModal
          onClose={() => {
            setShowModal(false);
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
          task={editingTask}
          categories={categories}
          priorities={priorities}
        />
      )}
    </div>
  );
}