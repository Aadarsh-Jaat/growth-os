// src/pages/English.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import {
  Languages,
  BookOpen,
  Mic,
  Headphones,
  PenTool,
  MessageCircle,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  Target,
  Sparkles,
  Volume2,
  Award
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function English() {
  const { currentUser } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [vocabulary, setVocabulary] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [aiTopic, setAiTopic] = useState('');
  const [aiQuiz, setAiQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    skill: 'speaking',
    timeSpent: '',
    topic: '',
    newWords: '',
    confidence: 5,
    notes: ''
  });

  const skills = [
    { value: 'speaking', label: 'Speaking', icon: Mic, color: 'text-blue-500' },
    { value: 'listening', label: 'Listening', icon: Headphones, color: 'text-green-500' },
    { value: 'reading', label: 'Reading', icon: BookOpen, color: 'text-purple-500' },
    { value: 'writing', label: 'Writing', icon: PenTool, color: 'text-orange-500' }
  ];

  useEffect(() => {
    if (currentUser) {
      fetchEnglishData();
      generateAITopic();
      generateAIQuiz();
    }
  }, [currentUser]);

  const toMs = (t) => {
    if (!t) return 0;
    if (typeof t.toMillis === 'function') return t.toMillis();
    if (t.seconds) return t.seconds * 1000;
    return new Date(t).getTime() || 0;
  };

  const fetchEnglishData = async () => {
    if (!currentUser) return;
    try {
      const sessionsQuery = query(
        collection(db, 'englishSessions'),
        where('userId', '==', currentUser.uid)
      );
      const sessionsSnapshot = await getDocs(sessionsQuery);
      const sessionsData = sessionsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      sessionsData.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      setSessions(sessionsData);

      const vocabQuery = query(
        collection(db, 'vocabulary'),
        where('userId', '==', currentUser.uid)
      );
      const vocabSnapshot = await getDocs(vocabQuery);
      const vocabData = vocabSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      vocabData.sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt));
      setVocabulary(vocabData);
    } catch (error) {
      console.error('Error fetching English data:', error);
      alert(`Could not load English data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateAITopic = () => {
    const topics = [
      "Describe your favorite hobby and why you enjoy it.",
      "Talk about a memorable trip you've taken.",
      "Discuss the importance of technology in modern life.",
      "Describe a person who has influenced your life.",
      "What are the benefits of learning a second language?",
      "Discuss the impact of social media on society.",
      "Describe your ideal job and why.",
      "Talk about a book or movie that changed your perspective.",
      "What changes would you make to improve education?",
      "Discuss the role of artificial intelligence in the future."
    ];
    setAiTopic(topics[Math.floor(Math.random() * topics.length)]);
  };

  const generateAIQuiz = () => {
    const quizzes = [
      { question: "What is the synonym of 'Happy'?", options: ["Sad", "Joyful", "Angry", "Tired"], answer: "Joyful" },
      { question: "Complete the sentence: She ___ to the store yesterday.", options: ["go", "went", "going", "gone"], answer: "went" },
      { question: "What is the opposite of 'Difficult'?", options: ["Hard", "Easy", "Complex", "Tough"], answer: "Easy" },
      { question: "Choose the correct spelling:", options: ["Recieve", "Receive", "Reiceve", "Receeve"], answer: "Receive" },
      { question: "What does 'eloquent' mean?", options: ["Fluent", "Silent", "Angry", "Confused"], answer: "Fluent" }
    ];
    setAiQuiz(quizzes[Math.floor(Math.random() * quizzes.length)]);
  };

  const handleSaveSession = async () => {
    if (!currentUser) {
      alert('You must be logged in.');
      return;
    }
    if (!formData.timeSpent && !formData.topic?.trim()) {
      alert('Please enter time spent or a topic.');
      return;
    }
    try {
      const date = editingSession?.date || new Date().toISOString().split('T')[0];
      const sessionData = {
        skill: formData.skill,
        timeSpent: formData.timeSpent,
        topic: formData.topic,
        newWords: formData.newWords,
        confidence: Number(formData.confidence) || 5,
        notes: formData.notes,
        userId: currentUser.uid,
        date
      };

      if (editingSession?.id) {
        await updateDoc(doc(db, 'englishSessions', editingSession.id), {
          ...sessionData,
          updatedAt: new Date()
        });
      } else {
        const docRef = await addDoc(collection(db, 'englishSessions'), {
          ...sessionData,
          createdAt: new Date()
        });
        setSessions((prev) =>
          [{ id: docRef.id, ...sessionData, createdAt: new Date() }, ...prev].sort((a, b) =>
            (b.date || '').localeCompare(a.date || '')
          )
        );
      }

      setShowModal(false);
      setEditingSession(null);
      setFormData({
        skill: 'speaking',
        timeSpent: '',
        topic: '',
        newWords: '',
        confidence: 5,
        notes: ''
      });
      await fetchEnglishData();
    } catch (error) {
      console.error('Error saving session:', error);
      alert(`Failed to save session: ${error.message}`);
    }
  };

  const handleDeleteSession = async (id) => {
    if (window.confirm('Delete this session?')) {
      try {
        await deleteDoc(doc(db, 'englishSessions', id));
        setSessions((prev) => prev.filter((s) => s.id !== id));
        await fetchEnglishData();
      } catch (error) {
        console.error('Error deleting session:', error);
        alert(`Failed to delete session: ${error.message}`);
      }
    }
  };

  const stats = {
    totalSessions: sessions.length,
    totalHours: Math.round(sessions.reduce((sum, s) => sum + (parseInt(s.timeSpent) || 0), 0) / 60),
    totalWords: sessions.reduce((sum, s) => sum + (parseInt(s.newWords) || 0), 0),
    avgConfidence: Math.round(sessions.reduce((sum, s) => sum + (parseInt(s.confidence) || 0), 0) / (sessions.length || 1))
  };

  const progressData = sessions.map(s => ({
    date: s.date,
    confidence: s.confidence,
    words: s.newWords
  })).reverse().slice(-7);

  const skillDistribution = sessions.reduce((acc, session) => {
    acc[session.skill] = (acc[session.skill] || 0) + 1;
    return acc;
  }, {});

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">English / IELTS Learning</h1>
        <button
          onClick={() => {
            setEditingSession(null);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus size={18} />
          Log Practice
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="text-blue-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSessions}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Practice Sessions</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="text-green-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalHours}h</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Hours</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Award className="text-purple-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalWords}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Words Learned</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Target className="text-orange-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgConfidence}/10</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Avg Confidence</p>
        </div>
      </div>

      {/* AI Features */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* AI Speaking Topic */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-5 border border-purple-200 dark:border-purple-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <Mic className="text-purple-600 dark:text-purple-400" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">AI Speaking Topic</h3>
              <p className="text-gray-700 dark:text-gray-300">{aiTopic}</p>
              <button 
                onClick={generateAITopic}
                className="mt-3 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 flex items-center gap-1"
              >
                <Sparkles size={14} />
                Generate New Topic
              </button>
            </div>
          </div>
        </div>

        {/* AI Quiz */}
        {aiQuiz && (
          <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Volume2 className="text-green-600 dark:text-green-400" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Quick Vocabulary Quiz</h3>
                <p className="text-gray-700 dark:text-gray-300 font-medium">{aiQuiz.question}</p>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {aiQuiz.options.map((option, idx) => (
                    <button 
                      key={idx}
                      className="text-sm px-3 py-1 bg-white dark:bg-gray-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition text-left"
                      onClick={() => alert(option === aiQuiz.answer ? "✅ Correct!" : `❌ Wrong! Answer: ${aiQuiz.answer}`)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={generateAIQuiz}
                  className="mt-3 text-sm text-green-600 hover:text-green-700 dark:text-green-400 flex items-center gap-1"
                >
                  <Sparkles size={14} />
                  New Quiz
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Learning Progress</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={progressData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip />
            <Line type="monotone" dataKey="confidence" stroke="#8B5CF6" strokeWidth={2} name="Confidence" />
            <Line type="monotone" dataKey="words" stroke="#10B981" strokeWidth={2} name="New Words" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Practice Sessions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Practice Sessions</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {sessions.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No practice sessions yet. Start learning English today!
            </div>
          ) : (
            sessions.map(session => {
              const skillInfo = skills.find(s => s.value === session.skill);
              const Icon = skillInfo?.icon || BookOpen;
              return (
                <div key={session.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon size={16} className={skillInfo?.color} />
                        <h3 className="font-semibold text-gray-900 dark:text-white capitalize">{session.skill}</h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{session.date}</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{session.topic}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>⏱️ {session.timeSpent} min</span>
                        <span>📝 {session.newWords} new words</span>
                        <span>⭐ Confidence: {session.confidence}/10</span>
                      </div>
                      {session.notes && <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{session.notes}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingSession(session);
                          setFormData(session);
                          setShowModal(true);
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                      >
                        <Edit2 size={16} className="text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Practice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingSession ? 'Edit Session' : 'Log Practice Session'}
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Skill</label>
                <select
                  value={formData.skill}
                  onChange={(e) => setFormData({...formData, skill: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  {skills.map(skill => (
                    <option key={skill.value} value={skill.value}>{skill.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Time Spent (minutes)</label>
                <input
                  type="number"
                  placeholder="e.g., 30"
                  value={formData.timeSpent}
                  onChange={(e) => setFormData({...formData, timeSpent: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Topic Practiced</label>
                <input
                  type="text"
                  placeholder="e.g., Introduction, Travel, Work"
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">New Words Learned</label>
                <input
                  type="number"
                  placeholder="Number of new vocabulary words"
                  value={formData.newWords}
                  onChange={(e) => setFormData({...formData, newWords: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Confidence Score: {formData.confidence}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.confidence}
                  onChange={(e) => setFormData({...formData, confidence: e.target.value})}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  placeholder="What did you learn? What needs improvement?"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 resize-none"
                  rows="3"
                />
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={handleSaveSession}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => setShowModal(false)}
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