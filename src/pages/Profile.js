// pages/Profile.js (Complete)
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { User, Mail, Phone, Calendar, Target, Crown, Edit2, Save, X, TrendingUp, Clock, Award } from 'lucide-react';

export default function Profile() {
  const { currentUser, userData, updateUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    phone: userData?.phone || '',
    age: userData?.age || '',
    goals: userData?.goals?.join(', ') || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const goalsArray = formData.goals.split(',').map(g => g.trim()).filter(g => g);
      await updateUserData(currentUser.uid, {
        name: formData.name,
        phone: formData.phone,
        age: parseInt(formData.age),
        goals: goalsArray
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
    setSaving(false);
  };

  const getSubscriptionBadge = () => {
    const subscription = userData?.subscription || 'free';
    const status = userData?.subscriptionStatus || 'active';
    
    const colors = {
      premium: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
      free: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300' }
    };
    
    const statusColors = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      trial: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      expired: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    };
    
    return (
      <div className="flex gap-2">
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors[subscription]?.bg || colors.free.bg} ${colors[subscription]?.text || colors.free.text}`}>
          {subscription === 'premium' ? 'Premium' : 'Free'} Plan
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[status] || statusColors.active}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">My Profile</h1>
            <p className="opacity-90">Manage your personal information and goals</p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition flex items-center gap-2"
            >
              <Edit2 size={16} />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600 transition flex items-center gap-2"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: userData?.name || '',
                    phone: userData?.phone || '',
                    age: userData?.age || '',
                    goals: userData?.goals?.join(', ') || ''
                  });
                }}
                className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition flex items-center gap-2"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <User className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Your full name"
                />
              ) : (
                <p className="font-medium text-gray-900 dark:text-white text-lg">{userData?.name || 'Not set'}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Mail className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">Email Address</p>
              <p className="font-medium text-gray-900 dark:text-white">{currentUser?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Phone className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">Phone Number</p>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="+91 98765 43210"
                />
              ) : (
                <p className="font-medium text-gray-900 dark:text-white">{userData?.phone || 'Not set'}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Calendar className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">Age</p>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="25"
                />
              ) : (
                <p className="font-medium text-gray-900 dark:text-white">{userData?.age || 'Not set'} years</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mt-1">
              <Target className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">Life Goals</p>
              {isEditing ? (
                <textarea
                  value={formData.goals}
                  onChange={(e) => setFormData({...formData, goals: e.target.value})}
                  className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="3"
                  placeholder="Enter your goals separated by commas (e.g., Financial Freedom, Career Growth, Health)"
                />
              ) : (
                <div className="mt-1 flex flex-wrap gap-2">
                  {userData?.goals?.length > 0 ? (
                    userData.goals.map((goal, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm">
                        {goal}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No goals set. Click edit to add your life goals.</p>
                  )}
                </div>
              )}
              {!isEditing && !userData?.goals?.length && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Add your goals →
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
              <Crown className="text-yellow-600 dark:text-yellow-400" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">Subscription Plan</p>
              <div className="mt-1 flex flex-wrap gap-2 items-center">
                {getSubscriptionBadge()}
                {userData?.subscription !== 'premium' && (
                  <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition">
                    Upgrade to Premium →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-500" />
          Account Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-gray-500" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
            </div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {userData?.createdAt?.toDate().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) || 'N/A'}
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award size={16} className="text-gray-500" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Account Status</p>
            </div>
            <p className="font-semibold text-green-600 dark:text-green-400">
              {userData?.subscriptionStatus === 'active' ? 'Active' : 
               userData?.subscriptionStatus === 'trial' ? 'Trial Period' : 
               userData?.subscriptionStatus === 'expired' ? 'Expired' : 'Active'}
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target size={16} className="text-gray-500" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Goals Set</p>
            </div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {userData?.goals?.length || 0} goals
            </p>
          </div>
        </div>
      </div>

      {/* Subscription Info */}
      {userData?.subscription === 'premium' && userData?.subscriptionEndDate && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Premium Subscription</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your premium plan is active until {userData.subscriptionEndDate.toDate().toLocaleDateString()}
          </p>
          <button className="mt-3 text-sm text-red-600 hover:text-red-700 dark:text-red-400">
            Cancel Subscription
          </button>
        </div>
      )}
    </div>
  );
}