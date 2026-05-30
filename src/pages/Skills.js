// src/pages/Skills.js - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import {
  Code,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  Target,
  CheckCircle,
  Clock,
  BookOpen
} from 'lucide-react';

const skillCategories = [
  { name: 'HTML', icon: '🌐', level: 70, target: 90 },
  { name: 'CSS', icon: '🎨', level: 65, target: 90 },
  { name: 'JavaScript', icon: '⚡', level: 60, target: 85 },
  { name: 'React', icon: '⚛️', level: 55, target: 85 },
  { name: 'Firebase', icon: '🔥', level: 50, target: 80 },
  { name: 'Next.js', icon: '▲', level: 40, target: 75 },
  { name: 'Tailwind', icon: '🎨', level: 70, target: 90 },
  { name: 'Git/GitHub', icon: '📦', level: 65, target: 85 },
  { name: 'AI Tools', icon: '🤖', level: 55, target: 80 },
  { name: 'Business Automation', icon: '⚙️', level: 45, target: 75 }
];

export default function Skills() {
  const { currentUser } = useAuth();
  const [skills, setSkills] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dailyPractice, setDailyPractice] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    currentLevel: '',
    targetLevel: '',
    resources: '',
    dailyPracticeTime: '',
    project: ''
  });

  useEffect(() => {
    if (currentUser) {
      fetchSkills();
      fetchDailyPractice();
    }
  }, [currentUser]);

  const fetchSkills = async () => {
    try {
      const skillsQuery = query(
        collection(db, 'skills'),
        where('userId', '==', currentUser.uid)
      );
      const snapshot = await getDocs(skillsQuery);
      if (snapshot.empty) {
        // Initialize with default skills
        for (const skill of skillCategories) {
          await addDoc(collection(db, 'skills'), {
            name: skill.name,
            icon: skill.icon,
            level: skill.level,
            target: skill.target,
            userId: currentUser.uid,
            createdAt: new Date()
          });
        }
        setSkills(skillCategories);
      } else {
        const skillsData = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          level: Number(doc.data().level) || 0,
          target: Number(doc.data().target) || 100
        }));
        setSkills(skillsData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching skills:', error);
      setLoading(false);
    }
  };

  const fetchDailyPractice = async () => {
    try {
      const practiceQuery = query(
        collection(db, 'dailyPractice'),
        where('userId', '==', currentUser.uid),
        where('date', '==', new Date().toISOString().split('T')[0])
      );
      const snapshot = await getDocs(practiceQuery);
      if (!snapshot.empty) {
        setDailyPractice(snapshot.docs[0].data().minutes);
      }
    } catch (error) {
      console.error('Error fetching daily practice:', error);
    }
  };

  const updateSkillLevel = async (skillId, newLevel) => {
    try {
      const skillToUpdate = skills.find(s => s.id === skillId);
      if (!skillToUpdate) return;
      
      const updatedLevel = Math.min(Math.max(newLevel, 0), skillToUpdate.target);
      await updateDoc(doc(db, 'skills', skillId), { level: updatedLevel });
      setSkills(skills.map(s => s.id === skillId ? { ...s, level: updatedLevel } : s));
    } catch (error) {
      console.error('Error updating skill:', error);
      alert('Failed to update skill level');
    }
  };

  const handleSaveSkill = async () => {
    // Validate inputs
    if (!formData.name.trim()) {
      alert('Please enter skill name');
      return;
    }
    
    const currentLevelNum = parseInt(formData.currentLevel) || 0;
    const targetLevelNum = parseInt(formData.targetLevel) || 100;
    
    if (currentLevelNum > targetLevelNum) {
      alert('Current level cannot be greater than target level');
      return;
    }
    
    try {
      const skillData = {
        name: formData.name.trim(),
        icon: '💻',
        level: currentLevelNum,
        target: targetLevelNum,
        resources: formData.resources || '',
        dailyPracticeTime: formData.dailyPracticeTime || '',
        project: formData.project || '',
        userId: currentUser.uid,
        updatedAt: new Date()
      };

      if (editingSkill) {
        await updateDoc(doc(db, 'skills', editingSkill.id), skillData);
        setSkills(skills.map(s => s.id === editingSkill.id ? { ...s, ...skillData } : s));
      } else {
        const docRef = await addDoc(collection(db, 'skills'), {
          ...skillData,
          createdAt: new Date()
        });
        setSkills([...skills, { id: docRef.id, ...skillData }]);
      }

      setShowModal(false);
      setEditingSkill(null);
      setFormData({
        name: '',
        currentLevel: '',
        targetLevel: '',
        resources: '',
        dailyPracticeTime: '',
        project: ''
      });
      
      alert(editingSkill ? 'Skill updated successfully!' : 'Skill added successfully!');
    } catch (error) {
      console.error('Error saving skill:', error);
      alert('Failed to save skill: ' + error.message);
    }
  };

  const handleDeleteSkill = async (id) => {
    if (window.confirm('Are you sure you want to delete this skill?')) {
      try {
        await deleteDoc(doc(db, 'skills', id));
        setSkills(skills.filter(s => s.id !== id));
        alert('Skill deleted successfully!');
      } catch (error) {
        console.error('Error deleting skill:', error);
        alert('Failed to delete skill');
      }
    }
  };

  // Calculate total progress safely
  const totalProgress = skills.length > 0 
    ? skills.reduce((sum, s) => {
        const progress = (s.level / s.target) * 100;
        return sum + (isNaN(progress) ? 0 : progress);
      }, 0) / skills.length
    : 0;

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Coding & Skills Tracker</h1>
        <button
          onClick={() => {
            setEditingSkill(null);
            setFormData({
              name: '',
              currentLevel: '',
              targetLevel: '',
              resources: '',
              dailyPracticeTime: '',
              project: ''
            });
            setShowModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus size={18} />
          Add Skill
        </button>
      </div>

      {/* Overall Progress */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Overall Skill Progress</h2>
          <Target size={24} />
        </div>
        <div className="text-3xl font-bold mb-2">{Math.round(totalProgress)}%</div>
        <div className="w-full bg-white/30 rounded-full h-3">
          <div className="bg-white rounded-full h-3" style={{ width: `${Math.min(100, totalProgress)}%` }}></div>
        </div>
        <p className="text-sm opacity-90 mt-2">Keep practicing daily to reach your goals!</p>
      </div>

      {/* Daily Practice */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="text-blue-500" size={20} />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Practice</h2>
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{dailyPractice} min</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-blue-600 rounded-full h-2" style={{ width: `${Math.min(100, (dailyPractice / 60) * 100)}%` }}></div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Goal: 60 minutes/day</p>
      </div>

      {/* Skills Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {skills.map((skill) => {
          const progressPercent = skill.target > 0 ? (skill.level / skill.target) * 100 : 0;
          const isValidProgress = !isNaN(progressPercent) && isFinite(progressPercent);
          
          return (
            <div key={skill.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{skill.icon || '💻'}</span>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{skill.name}</h3>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingSkill(skill);
                      setFormData({
                        name: skill.name,
                        currentLevel: skill.level,
                        targetLevel: skill.target,
                        resources: skill.resources || '',
                        dailyPracticeTime: skill.dailyPracticeTime || '',
                        project: skill.project || ''
                      });
                      setShowModal(true);
                    }}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <Edit2 size={14} className="text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleDeleteSkill(skill.id)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {isValidProgress ? Math.round(progressPercent) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 rounded-full h-2 transition-all"
                    style={{ width: `${isValidProgress ? Math.min(100, progressPercent) : 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Current: {skill.level}%</span>
                <span className="text-gray-500 dark:text-gray-400">Target: {skill.target}%</span>
              </div>
              
              {skill.project && (
                <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <BookOpen size={14} />
                  <span>{skill.project}</span>
                </div>
              )}
              
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => updateSkillLevel(skill.id, skill.level + 5)}
                  className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded hover:bg-green-200"
                >
                  +5%
                </button>
                <button
                  onClick={() => updateSkillLevel(skill.id, skill.level - 5)}
                  className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200"
                >
                  -5%
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Skill Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingSkill ? 'Edit Skill' : 'Add New Skill'}
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Skill Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Python, Docker, AWS"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Current Level (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g., 50"
                  value={formData.currentLevel}
                  onChange={(e) => setFormData({...formData, currentLevel: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Target Level (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g., 90"
                  value={formData.targetLevel}
                  onChange={(e) => setFormData({...formData, targetLevel: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Learning Resources</label>
                <input
                  type="text"
                  placeholder="Udemy, YouTube, Coursera, etc."
                  value={formData.resources}
                  onChange={(e) => setFormData({...formData, resources: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Daily Practice (minutes)</label>
                <input
                  type="number"
                  placeholder="e.g., 30"
                  value={formData.dailyPracticeTime}
                  onChange={(e) => setFormData({...formData, dailyPracticeTime: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Related Project</label>
                <input
                  type="text"
                  placeholder="Portfolio website, E-commerce app, etc."
                  value={formData.project}
                  onChange={(e) => setFormData({...formData, project: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button 
                onClick={handleSaveSkill} 
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {editingSkill ? 'Update' : 'Save'}
              </button>
              <button 
                onClick={() => setShowModal(false)} 
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
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