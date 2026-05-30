// src/pages/GovernmentJob.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Target,
  Award,
  Clock,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function GovernmentJob() {
  const { currentUser } = useAuth();
  const [exams, setExams] = useState([]);
  const [mockTests, setMockTests] = useState([]);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [examForm, setExamForm] = useState({
    name: '',
    examDate: '',
    applicationDate: '',
    syllabus: '',
    subjects: '',
    status: 'upcoming'
  });
  
  const [testForm, setTestForm] = useState({
    examName: '',
    subject: '',
    marks: '',
    totalMarks: '',
    date: ''
  });

  const examStatuses = [
    { value: 'upcoming', label: 'Upcoming', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    { value: 'applied', label: 'Applied', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    { value: 'preparing', label: 'Preparing', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' }
  ];

  useEffect(() => {
    if (currentUser) {
      fetchExamData();
    }
  }, [currentUser]);

  const fetchExamData = async () => {
    if (!currentUser) return;
    try {
      const examsQuery = query(
        collection(db, 'govtExams'),
        where('userId', '==', currentUser.uid)
      );
      const examsSnapshot = await getDocs(examsQuery);
      const examsList = examsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      examsList.sort((a, b) => (a.examDate || '').localeCompare(b.examDate || ''));
      setExams(examsList);

      const testsQuery = query(
        collection(db, 'mockTests'),
        where('userId', '==', currentUser.uid)
      );
      const testsSnapshot = await getDocs(testsQuery);
      const testsList = testsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      testsList.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      setMockTests(testsList);
    } catch (error) {
      console.error('Error fetching exam data:', error);
      alert(`Could not load government job data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExam = async () => {
    if (!currentUser) {
      alert('You must be logged in.');
      return;
    }
    if (!examForm.name?.trim()) {
      alert('Please enter an exam name.');
      return;
    }
    try {
      const examData = { ...examForm, userId: currentUser.uid };
      if (editingItem?.id && showExamModal) {
        await updateDoc(doc(db, 'govtExams', editingItem.id), {
          ...examData,
          updatedAt: new Date()
        });
      } else {
        const docRef = await addDoc(collection(db, 'govtExams'), {
          ...examData,
          createdAt: new Date()
        });
        setExams((prev) =>
          [...prev, { id: docRef.id, ...examData, createdAt: new Date() }].sort((a, b) =>
            (a.examDate || '').localeCompare(b.examDate || '')
          )
        );
      }
      setShowExamModal(false);
      setEditingItem(null);
      setExamForm({ name: '', examDate: '', applicationDate: '', syllabus: '', subjects: '', status: 'upcoming' });
      await fetchExamData();
    } catch (error) {
      console.error('Error saving exam:', error);
      alert(`Failed to save exam: ${error.message}`);
    }
  };

  const handleSaveTest = async () => {
    if (!currentUser) {
      alert('You must be logged in.');
      return;
    }
    if (!testForm.examName?.trim() || !testForm.marks || !testForm.totalMarks) {
      alert('Please fill exam name, marks, and total marks.');
      return;
    }
    try {
      const percentage = (parseFloat(testForm.marks) / parseFloat(testForm.totalMarks)) * 100;
      const testData = {
        ...testForm,
        marks: parseFloat(testForm.marks),
        totalMarks: parseFloat(testForm.totalMarks),
        percentage,
        userId: currentUser.uid
      };
      if (editingItem?.id && showTestModal) {
        await updateDoc(doc(db, 'mockTests', editingItem.id), {
          ...testData,
          updatedAt: new Date()
        });
      } else {
        const docRef = await addDoc(collection(db, 'mockTests'), {
          ...testData,
          createdAt: new Date()
        });
        setMockTests((prev) =>
          [{ id: docRef.id, ...testData, createdAt: new Date() }, ...prev].sort((a, b) =>
            (b.date || '').localeCompare(a.date || '')
          )
        );
      }
      setShowTestModal(false);
      setEditingItem(null);
      setTestForm({ examName: '', subject: '', marks: '', totalMarks: '', date: '' });
      await fetchExamData();
    } catch (error) {
      console.error('Error saving test:', error);
      alert(`Failed to save test: ${error.message}`);
    }
  };

  const handleDelete = async (collectionName, id) => {
    if (window.confirm('Are you sure you want to delete this?')) {
      try {
        await deleteDoc(doc(db, collectionName, id));
        await fetchExamData();
      } catch (error) {
        console.error('Error deleting:', error);
        alert(`Failed to delete: ${error.message}`);
      }
    }
  };

  const avgScore = mockTests.length > 0 
    ? mockTests.reduce((sum, t) => sum + (t.percentage || 0), 0) / mockTests.length 
    : 0;

  const bestScore = mockTests.length > 0 
    ? Math.max(...mockTests.map(t => t.percentage || 0)) 
    : 0;

  const testData = mockTests.map(t => ({ date: t.date, score: t.percentage })).reverse().slice(-7);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Government Job Preparation</h1>
        <div className="flex gap-2">
          <button onClick={() => { setEditingItem(null); setShowExamModal(true); }} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-1 text-sm">
            <Plus size={16} /> Add Exam
          </button>
          <button onClick={() => { setEditingItem(null); setShowTestModal(true); }} className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-1 text-sm">
            <Plus size={16} /> Add Test
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <GraduationCap className="text-blue-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{exams.length}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Exams</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Award className="text-purple-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{mockTests.length}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Mock Tests</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Target className="text-green-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{avgScore.toFixed(0)}%</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Avg Score</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="text-orange-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{bestScore.toFixed(0)}%</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Best Score</p>
        </div>
      </div>

      {/* Score Progress Chart */}
      {testData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Mock Test Performance</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={testData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#8B5CF6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Weak Topics Section */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-yellow-600 dark:text-yellow-400 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-400">Topics to Focus On</h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">Based on your test performance, focus on: Reasoning, Quantitative Aptitude, and General Knowledge</p>
          </div>
        </div>
      </div>

      {/* Exams List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Exam Tracker</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {exams.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <GraduationCap size={48} className="mx-auto mb-3 opacity-50" />
              <p>No exams added yet</p>
              <button onClick={() => setShowExamModal(true)} className="mt-2 text-blue-600 text-sm">Add your first exam →</button>
            </div>
          ) : (
            exams.map(exam => {
              const status = examStatuses.find(s => s.value === exam.status);
              const daysLeft = exam.examDate ? Math.ceil((new Date(exam.examDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
              return (
                <div key={exam.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <div className="flex justify-between items-start flex-wrap gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{exam.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${status?.color}`}>{status?.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                        {exam.examDate && <span>📅 Exam: {exam.examDate} {daysLeft > 0 && `(${daysLeft} days left)`}</span>}
                        {exam.applicationDate && <span>📝 Apply by: {exam.applicationDate}</span>}
                      </div>
                      {exam.syllabus && <p className="text-sm text-gray-500 mt-1">📚 Syllabus: {exam.syllabus}</p>}
                      {exam.subjects && <p className="text-xs text-gray-400 mt-1">Subjects: {exam.subjects}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingItem(exam); setExamForm(exam); setShowExamModal(true); }} className="p-1 hover:bg-gray-100 rounded">
                        <Edit2 size={16} className="text-gray-500" />
                      </button>
                      <button onClick={() => handleDelete('govtExams', exam.id)} className="p-1 hover:bg-gray-100 rounded">
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

      {/* Mock Tests List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Mock Test History</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {mockTests.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p>No mock tests recorded</p>
              <button onClick={() => setShowTestModal(true)} className="mt-2 text-blue-600 text-sm">Add your first test →</button>
            </div>
          ) : (
            mockTests.map(test => (
              <div key={test.id} className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{test.examName} - {test.subject}</h3>
                  <p className="text-sm text-gray-500">{test.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-semibold ${test.percentage >= 60 ? 'text-green-600' : test.percentage >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {test.marks}/{test.totalMarks} ({test.percentage.toFixed(0)}%)
                  </span>
                  <button onClick={() => handleDelete('mockTests', test.id)} className="p-1">
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Exam Modal */}
      {showExamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b"><h2 className="text-xl font-semibold">{editingItem ? 'Edit Exam' : 'Add Exam'}</h2></div>
            <div className="p-5 space-y-4">
              <input type="text" placeholder="Exam Name (e.g., SSC CGL, UPSC)" value={examForm.name} onChange={(e) => setExamForm({...examForm, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
              <input type="date" placeholder="Exam Date" value={examForm.examDate} onChange={(e) => setExamForm({...examForm, examDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
              <input type="date" placeholder="Application Deadline" value={examForm.applicationDate} onChange={(e) => setExamForm({...examForm, applicationDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
              <textarea placeholder="Syllabus / Topics" value={examForm.syllabus} onChange={(e) => setExamForm({...examForm, syllabus: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 resize-none" rows="3" />
              <input type="text" placeholder="Subjects (comma separated)" value={examForm.subjects} onChange={(e) => setExamForm({...examForm, subjects: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
              <select value={examForm.status} onChange={(e) => setExamForm({...examForm, status: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700">
                {examStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="p-5 border-t flex gap-3">
              <button onClick={handleSaveExam} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
              <button onClick={() => setShowExamModal(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Test Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-5 border-b"><h2 className="text-xl font-semibold">Add Mock Test Score</h2></div>
            <div className="p-5 space-y-4">
              <input type="text" placeholder="Exam Name" value={testForm.examName} onChange={(e) => setTestForm({...testForm, examName: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              <input type="text" placeholder="Subject" value={testForm.subject} onChange={(e) => setTestForm({...testForm, subject: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              <input type="number" placeholder="Marks Obtained" value={testForm.marks} onChange={(e) => setTestForm({...testForm, marks: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              <input type="number" placeholder="Total Marks" value={testForm.totalMarks} onChange={(e) => setTestForm({...testForm, totalMarks: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              <input type="date" placeholder="Test Date" value={testForm.date} onChange={(e) => setTestForm({...testForm, date: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div className="p-5 border-t flex gap-3">
              <button onClick={handleSaveTest} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg">Save</button>
              <button onClick={() => setShowTestModal(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}