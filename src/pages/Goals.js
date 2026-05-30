// src/pages/Goals.js
import { Activity } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Target, Plus, Edit2, Trash2, TrendingUp, Calendar, CheckCircle, Clock, Award, Heart, Briefcase, Home, GraduationCap } from 'lucide-react';

export default function Goals() {
  const { currentUser } = useAuth();
  const [goals, setGoals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({ 
    title: '', 
    reason: '', 
    deadline: '', 
    progress: 0, 
    milestones: '', 
    status: 'active',
    category: 'personal'
  });

  const categories = [
    { value: 'personal', label: 'Personal', icon: Heart },
    { value: 'career', label: 'Career', icon: Briefcase },
    { value: 'financial', label: 'Financial', icon: TrendingUp },
    { value: 'health', label: 'Health', icon: Activity },
    { value: 'family', label: 'Family', icon: Home },
    { value: 'education', label: 'Education', icon: GraduationCap }
  ];

  useEffect(() => {
    if (currentUser) fetchGoals();
  }, [currentUser]);

  const fetchGoals = async () => {
    try {
      const q = query(collection(db, 'goals'), where('userId', '==', currentUser.uid));
      const snapshot = await getDocs(q);
      setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    } catch (error) { 
      console.error('Error fetching goals:', error); 
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const milestonesArray = formData.milestones ? formData.milestones.split(',').map(m => m.trim()) : [];
      const data = { 
        ...formData, 
        milestones: milestonesArray,
        progress: parseInt(formData.progress) || 0,
        userId: currentUser.uid, 
        updatedAt: new Date() 
      };
      
      if (editingGoal) {
        await updateDoc(doc(db, 'goals', editingGoal.id), data);
      } else {
        await addDoc(collection(db, 'goals'), { ...data, createdAt: new Date() });
      }
      
      setShowModal(false); 
      setEditingGoal(null); 
      setFormData({ title: '', reason: '', deadline: '', progress: 0, milestones: '', status: 'active', category: 'personal' });
      fetchGoals();
    } catch (error) { 
      console.error('Error saving goal:', error);
      alert('Failed to save goal. Please try again.');
    }
  };

  const handleDelete = async (id) => { 
    if (window.confirm('Are you sure you want to delete this goal?')) { 
      await deleteDoc(doc(db, 'goals', id)); 
      fetchGoals(); 
    } 
  };

  const updateProgress = async (id, newProgress) => {
    try {
      await updateDoc(doc(db, 'goals', id), { progress: Math.min(100, Math.max(0, newProgress)) });
      fetchGoals();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const filteredGoals = goals.filter(goal => filter === 'all' || goal.status === filter);
  const activeGoals = goals.filter(g => g.status === 'active').length;
  const completedGoals = goals.filter(g => g.progress === 100).length;
  const avgProgress = goals.length > 0 ? goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length : 0;

  if (loading) {
    return (
      <div className="flex justify-center h-96 items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Life Goals</h1>
        <button onClick={() => { setEditingGoal(null); setFormData({ title: '', reason: '', deadline: '', progress: 0, milestones: '', status: 'active', category: 'personal' }); setShowModal(true); }} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
          <Plus size={18} /> Add Goal
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Target className="text-blue-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{goals.length}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Goals</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Activity className="text-green-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{activeGoals}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Goals</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="text-purple-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{completedGoals}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="text-orange-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(avgProgress)}%</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Avg Progress</p>
        </div>
      </div>

      {/* Wealth Goal Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-5 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-sm opacity-90">🎯 10-YEAR WEALTH GOAL</h2>
            <p className="text-2xl font-bold mt-1">₹1.5 Crore</p>
            <p className="text-sm opacity-90 mt-1">Target: December 2034</p>
          </div>
          <Award size={48} className="opacity-50" />
        </div>
        <div className="w-full bg-white/30 rounded-full h-2 mt-3">
          <div className="bg-white rounded-full h-2" style={{ width: '15%' }}></div>
        </div>
        <p className="text-xs opacity-80 mt-2">₹25,00,000 saved of ₹1,50,00,000 (17% achieved)</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 font-medium transition ${filter === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>All Goals</button>
        <button onClick={() => setFilter('active')} className={`px-4 py-2 font-medium transition ${filter === 'active' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Active</button>
        <button onClick={() => setFilter('completed')} className={`px-4 py-2 font-medium transition ${filter === 'completed' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Completed</button>
      </div>

      {/* Goals Grid */}
      <div className="grid gap-4">
        {filteredGoals.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
            <Target size={48} className="mx-auto mb-3 opacity-50 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">No goals found</p>
            <button onClick={() => setShowModal(true)} className="mt-2 text-blue-600 text-sm">Create your first goal →</button>
          </div>
        ) : (
          filteredGoals.map(goal => {
            const CategoryIcon = categories.find(c => c.value === goal.category)?.icon || Target;
            const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;
            return (
              <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <CategoryIcon size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{goal.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{goal.reason}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingGoal(goal); setFormData({ ...goal, milestones: goal.milestones?.join(', ') || '' }); setShowModal(true); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      <Edit2 size={16} className="text-gray-500" />
                    </button>
                    <button onClick={() => handleDelete(goal.id)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="text-gray-900 dark:text-white font-medium">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 rounded-full h-2 transition-all" style={{ width: `${goal.progress}%` }}></div>
                  </div>
                </div>
                
                {/* Goal Details */}
                <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {goal.deadline && (
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      Due: {goal.deadline} {daysLeft !== null && daysLeft > 0 && `(${daysLeft} days left)`}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    Status: {goal.status === 'active' ? 'In Progress' : 'Completed'}
                  </span>
                </div>
                
                {/* Milestones */}
                {goal.milestones && goal.milestones.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Key Milestones:</p>
                    <div className="flex flex-wrap gap-1">
                      {goal.milestones.map((m, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Progress Update Buttons */}
                {goal.progress < 100 && (
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => updateProgress(goal.id, goal.progress + 10)} className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded hover:bg-green-200">
                      +10%
                    </button>
                    <button onClick={() => updateProgress(goal.id, goal.progress + 5)} className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200">
                      +5%
                    </button>
                    <button onClick={() => updateProgress(goal.id, 100)} className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded hover:bg-purple-200">
                      Complete
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingGoal ? 'Edit Goal' : 'Add New Goal'}
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Goal Title *</label>
                <input type="text" placeholder="e.g., Build Emergency Fund" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" required />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Category</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                  {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Why this goal? (Motivation)</label>
                <textarea placeholder="What makes this goal important to you?" value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 resize-none" rows="2" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Target Date</label>
                <input type="date" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Current Progress (%)</label>
                <input type="range" min="0" max="100" value={formData.progress} onChange={(e) => setFormData({...formData, progress: e.target.value})} className="w-full" />
                <div className="text-center text-sm mt-1">{formData.progress}%</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Key Milestones (comma separated)</label>
                <input type="text" placeholder="e.g., Save ₹50K, Complete course, Apply for job" value={formData.milestones} onChange={(e) => setFormData({...formData, milestones: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button onClick={handleSave} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Save Goal</button>
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}