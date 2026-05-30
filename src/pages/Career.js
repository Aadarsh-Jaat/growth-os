// src/pages/Career.js - FIXED IMPORTS
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import {
  Briefcase,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  Target,
  Linkedin,
  Github,
  FileText,
  DollarSign,
  Users
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';


export default function Career() {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    platform: '',
    status: 'applied',
    salary: '',
    notes: '',
    followUpDate: ''
  });

  const statuses = [
    { value: 'applied', label: 'Applied', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Send },
    { value: 'shortlisted', label: 'Shortlisted', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Users },
    { value: 'interview', label: 'Interview', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: Calendar },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
    { value: 'selected', label: 'Selected', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle }
  ];

  useEffect(() => {
    if (currentUser) {
      fetchCareerData();
    }
  }, [currentUser]);

  const fetchCareerData = async () => {
    if (!currentUser) {
      console.log('No user logged in');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Fetching applications for user:', currentUser.uid);
      
      // Simplified query without orderBy first to test
      const appsQuery = query(
        collection(db, 'jobApplications'),
        where('userId', '==', currentUser.uid)
      );
      
      const appsSnapshot = await getDocs(appsQuery);
      console.log('Query snapshot size:', appsSnapshot.size);
      
      const appsData = appsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      
      console.log('Applications data:', appsData);
      setApplications(appsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching career data:', error);
      alert('Error loading data: ' + error.message);
      setLoading(false);
    }
  };

  const handleSaveApplication = async () => {
    if (!currentUser) {
      alert('Please login first');
      return;
    }
    
    // Validate required fields
    if (!formData.company.trim()) {
      alert('Please enter company name');
      return;
    }
    if (!formData.role.trim()) {
      alert('Please enter job role');
      return;
    }
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const appData = {
        company: formData.company.trim(),
        role: formData.role.trim(),
        platform: formData.platform || '',
        status: formData.status,
        salary: formData.salary || '',
        notes: formData.notes || '',
        followUpDate: formData.followUpDate || '',
        userId: currentUser.uid,
        applicationDate: today,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('Saving application:', appData);

      if (editingApp) {
        await updateDoc(doc(db, 'jobApplications', editingApp.id), {
          ...appData,
          updatedAt: new Date()
        });
        console.log('Application updated successfully');
      } else {
        const docRef = await addDoc(collection(db, 'jobApplications'), appData);
        console.log('Application added with ID:', docRef.id);
      }

      // Reset form
      setShowModal(false);
      setEditingApp(null);
      setFormData({
        company: '',
        role: '',
        platform: '',
        status: 'applied',
        salary: '',
        notes: '',
        followUpDate: ''
      });
      
      // Refresh the list
      await fetchCareerData();
      
      alert(editingApp ? 'Application updated successfully!' : 'Application added successfully!');
      
    } catch (error) {
      console.error('Error saving application:', error);
      alert('Failed to save application: ' + error.message);
    }
  };

  const handleDeleteApplication = async (id) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await deleteDoc(doc(db, 'jobApplications', id));
        console.log('Application deleted successfully');
        await fetchCareerData();
        alert('Application deleted successfully!');
      } catch (error) {
        console.error('Error deleting application:', error);
        alert('Failed to delete application: ' + error.message);
      }
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'jobApplications', id), { 
        status: newStatus,
        updatedAt: new Date()
      });
      console.log('Status updated successfully');
      await fetchCareerData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status: ' + error.message);
    }
  };

  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === 'applied').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    interview: applications.filter(a => a.status === 'interview').length,
    selected: applications.filter(a => a.status === 'selected').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    conversionRate: applications.length > 0 
      ? Math.round((applications.filter(a => a.status === 'selected').length / applications.length) * 100) 
      : 0
  };

  // Prepare chart data
  const weeklyData = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = applications.filter(a => a.applicationDate === dateStr).length;
      last7Days.push({ date: dateStr.substring(5), count }); // Show MM-DD format
    }
    return last7Days;
  };

  const statusData = [
    { name: 'Applied', value: stats.applied, color: '#3B82F6' },
    { name: 'Shortlisted', value: stats.shortlisted, color: '#F59E0B' },
    { name: 'Interview', value: stats.interview, color: '#8B5CF6' },
    { name: 'Selected', value: stats.selected, color: '#10B981' },
    { name: 'Rejected', value: stats.rejected, color: '#EF4444' }
  ].filter(s => s.value > 0);

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Career & Job Tracker</h1>
        <button
          onClick={() => {
            setEditingApp(null);
            setFormData({
              company: '',
              role: '',
              platform: '',
              status: 'applied',
              salary: '',
              notes: '',
              followUpDate: ''
            });
            setShowModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus size={18} />
          Add Application
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Apps</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600">{stats.applied}</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Applied</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="text-2xl font-bold text-yellow-600">{stats.shortlisted}</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Shortlisted</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="text-2xl font-bold text-purple-600">{stats.interview}</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Interviews</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600">{stats.selected}</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Selected</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="text-2xl font-bold text-purple-600">{stats.conversionRate}%</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Conversion</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Applications Per Week</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Application Status Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <button className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 dark:border-gray-700">
          <Linkedin className="text-blue-600" size={24} />
          <div className="text-left">
            <p className="font-semibold text-gray-900 dark:text-white">Update LinkedIn</p>
            <p className="text-xs text-gray-500">Optimize your profile</p>
          </div>
        </button>
        <button className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 dark:border-gray-700">
          <Github className="text-gray-700 dark:text-gray-300" size={24} />
          <div className="text-left">
            <p className="font-semibold text-gray-900 dark:text-white">GitHub Activity</p>
            <p className="text-xs text-gray-500">Update your portfolio</p>
          </div>
        </button>
        <button className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 dark:border-gray-700">
          <FileText className="text-red-500" size={24} />
          <div className="text-left">
            <p className="font-semibold text-gray-900 dark:text-white">Resume Review</p>
            <p className="text-xs text-gray-500">Get AI feedback</p>
          </div>
        </button>
      </div>

      {/* Applications List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Job Applications</h2>
          <p className="text-sm text-gray-500 mt-1">Total: {applications.length} applications</p>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {applications.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Briefcase size={48} className="mx-auto mb-3 opacity-50" />
              <p>No job applications yet.</p>
              <p className="text-sm mt-1">Click "Add Application" to start tracking your job search!</p>
            </div>
          ) : (
            applications.map(app => {
              const status = statuses.find(s => s.value === app.status);
              return (
                <div key={app.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <div className="flex justify-between items-start flex-wrap gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{app.role}</h3>
                        <span className="text-sm text-gray-600 dark:text-gray-400">at {app.company}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${status?.color}`}>
                          {status?.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          Applied: {app.applicationDate}
                        </span>
                        {app.salary && (
                          <span className="flex items-center gap-1">
                            <DollarSign size={14} />
                            {app.salary}
                          </span>
                        )}
                        {app.platform && (
                          <span className="flex items-center gap-1">
                            <Briefcase size={14} />
                            {app.platform}
                          </span>
                        )}
                        {app.followUpDate && (
                          <span className="flex items-center gap-1 text-orange-600">
                            <Clock size={14} />
                            Follow up: {app.followUpDate}
                          </span>
                        )}
                      </div>
                      {app.notes && (
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">{app.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={app.status}
                        onChange={(e) => updateStatus(app.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${status?.color}`}
                      >
                        {statuses.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          setEditingApp(app);
                          setFormData({
                            company: app.company || '',
                            role: app.role || '',
                            platform: app.platform || '',
                            status: app.status || 'applied',
                            salary: app.salary || '',
                            notes: app.notes || '',
                            followUpDate: app.followUpDate || ''
                          });
                          setShowModal(true);
                        }}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                      >
                        <Edit2 size={16} className="text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleDeleteApplication(app.id)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
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

      {/* Application Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingApp ? 'Edit Application' : 'Add Job Application'}
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Company Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Google, Microsoft"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Job Role *</label>
                <input
                  type="text"
                  placeholder="e.g., Frontend Developer, Product Manager"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Platform</label>
                <input
                  type="text"
                  placeholder="LinkedIn, Indeed, Company Website"
                  value={formData.platform}
                  onChange={(e) => setFormData({...formData, platform: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {statuses.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Salary (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., $100k or ₹15 LPA"
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Follow-up Date</label>
                <input
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({...formData, followUpDate: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Notes</label>
                <textarea
                  placeholder="Interview prep notes, contacts, etc."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                  rows="3"
                />
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={handleSaveApplication}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {editingApp ? 'Update' : 'Save'}
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