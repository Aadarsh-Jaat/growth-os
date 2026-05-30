// src/pages/AbroadPlanning.js - WITH CUSTOM COUNTRY INPUT AND ₹ SYMBOL
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { 
  Plane, Target, FileText, Calendar, CheckCircle, 
  XCircle, Plus, Edit2, Trash2, BookOpen, 
  Save, Edit3, IndianRupee
} from 'lucide-react';

export default function AbroadPlanning() {
  const { currentUser } = useAuth();
  const [plan, setPlan] = useState({
    targetCountry: '',
    targetDate: '',
    purpose: 'study',
    budget: '',
    savedAmount: '',
    timeline: ''
  });
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [showCustomCountry, setShowCustomCountry] = useState(false);
  const [customCountry, setCustomCountry] = useState('');
  const [docForm, setDocForm] = useState({ name: '', status: 'pending', deadline: '', notes: '' });

  const presetCountries = [
    'Select Country',
    'Canada', 
    'USA', 
    'UK', 
    'Australia', 
    'Germany', 
    'New Zealand', 
    'Ireland', 
    'France',
    'Other (Enter manually)'
  ];
  
  const purposes = ['study', 'work', 'immigration', 'visit'];

  useEffect(() => {
    if (currentUser) {
      fetchAbroadData();
    }
  }, [currentUser]);

  const fetchAbroadData = async () => {
    if (!currentUser) return;
    
    try {
      console.log('Fetching abroad data for user:', currentUser.uid);
      
      // Fetch plan
      const planQuery = query(collection(db, 'abroadPlans'), where('userId', '==', currentUser.uid));
      const planSnapshot = await getDocs(planQuery);
      if (!planSnapshot.empty) {
        const planData = planSnapshot.docs[0].data();
        setPlan({ 
          id: planSnapshot.docs[0].id,
          targetCountry: planData.targetCountry || '',
          targetDate: planData.targetDate || '',
          purpose: planData.purpose || 'study',
          budget: planData.budget || '',
          savedAmount: planData.savedAmount || '',
          timeline: planData.timeline || ''
        });
        console.log('Plan loaded:', planData);
      } else {
        console.log('No existing plan found');
      }

      // Fetch documents
      const docsQuery = query(collection(db, 'abroadDocuments'), where('userId', '==', currentUser.uid));
      const docsSnapshot = await getDocs(docsQuery);
      const docsData = docsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Documents loaded:', docsData.length);
      setDocuments(docsData);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching abroad data:', error);
      alert('Error loading data: ' + error.message);
      setLoading(false);
    }
  };

  const handleCountryChange = (e) => {
    const value = e.target.value;
    if (value === 'Other (Enter manually)') {
      setShowCustomCountry(true);
      setPlan({...plan, targetCountry: ''});
    } else {
      setShowCustomCountry(false);
      setPlan({...plan, targetCountry: value});
    }
  };

  const handleCustomCountrySubmit = () => {
    if (customCountry.trim()) {
      setPlan({...plan, targetCountry: customCountry.trim()});
      setShowCustomCountry(false);
      setCustomCountry('');
    }
  };

  const handleSavePlan = async () => {
    try {
      // Validate required fields
      if (!plan.targetCountry) {
        alert('Please select or enter a target country');
        return;
      }
      
      const planData = {
        targetCountry: plan.targetCountry,
        targetDate: plan.targetDate || '',
        purpose: plan.purpose,
        budget: parseFloat(plan.budget) || 0,
        savedAmount: parseFloat(plan.savedAmount) || 0,
        timeline: plan.timeline || '',
        userId: currentUser.uid,
        updatedAt: new Date()
      };
      
      console.log('Saving plan:', planData);

      if (plan.id) {
        await updateDoc(doc(db, 'abroadPlans', plan.id), planData);
        console.log('Plan updated successfully');
      } else {
        const docRef = await addDoc(collection(db, 'abroadPlans'), {
          ...planData,
          createdAt: new Date()
        });
        setPlan({ ...plan, id: docRef.id });
        console.log('Plan created with ID:', docRef.id);
      }
      
      setEditingPlan(false);
      await fetchAbroadData();
      alert('Plan saved successfully!');
      
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Failed to save plan: ' + error.message);
    }
  };

  const handleUpdateSavedAmount = async () => {
    const newAmount = prompt('Enter amount saved so far (₹):', plan.savedAmount || '0');
    if (newAmount !== null) {
      const amountNum = parseFloat(newAmount) || 0;
      try {
        const planData = {
          ...plan,
          savedAmount: amountNum,
          updatedAt: new Date()
        };
        delete planData.id;
        
        await updateDoc(doc(db, 'abroadPlans', plan.id), planData);
        setPlan({ ...plan, savedAmount: amountNum });
        alert('Saved amount updated successfully!');
        fetchAbroadData();
      } catch (error) {
        console.error('Error updating saved amount:', error);
        alert('Failed to update saved amount');
      }
    }
  };

  const handleSaveDocument = async () => {
    if (!docForm.name.trim()) {
      alert('Please enter document name');
      return;
    }
    
    try {
      const docData = {
        name: docForm.name.trim(),
        status: docForm.status,
        deadline: docForm.deadline || '',
        notes: docForm.notes || '',
        userId: currentUser.uid,
        updatedAt: new Date()
      };

      console.log('Saving document:', docData);

      if (editingDoc) {
        await updateDoc(doc(db, 'abroadDocuments', editingDoc.id), docData);
        console.log('Document updated successfully');
      } else {
        const docRef = await addDoc(collection(db, 'abroadDocuments'), {
          ...docData,
          createdAt: new Date()
        });
        console.log('Document added with ID:', docRef.id);
      }

      setShowDocModal(false);
      setEditingDoc(null);
      setDocForm({ name: '', status: 'pending', deadline: '', notes: '' });
      await fetchAbroadData();
      alert(editingDoc ? 'Document updated!' : 'Document added!');
      
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Failed to save document: ' + error.message);
    }
  };

  const toggleDocumentStatus = async (doc) => {
    const newStatus = doc.status === 'completed' ? 'pending' : 'completed';
    try {
      await updateDoc(doc(db, 'abroadDocuments', doc.id), { 
        status: newStatus,
        updatedAt: new Date()
      });
      console.log('Document status updated to:', newStatus);
      fetchAbroadData();
    } catch (error) {
      console.error('Error updating document status:', error);
      alert('Failed to update document status');
    }
  };

  const handleDeleteDocument = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDoc(doc(db, 'abroadDocuments', id));
        console.log('Document deleted successfully');
        fetchAbroadData();
        alert('Document deleted!');
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('Failed to delete document');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN').format(amount);
  };

  const completedDocs = documents.filter(d => d.status === 'completed').length;
  const totalDocs = documents.length;
  const savedAmountNum = parseFloat(plan.savedAmount) || 0;
  const budgetNum = parseFloat(plan.budget) || 0;
  const progressPercent = budgetNum > 0 ? (savedAmountNum / budgetNum) * 100 : 0;

  if (loading) {
    return (
      <div className="flex justify-center h-96 items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Abroad Planning</h1>
        <button 
          onClick={() => setEditingPlan(!editingPlan)}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-1 text-sm"
        >
          {editingPlan ? <Save size={16} /> : <Edit3 size={16} />}
          {editingPlan ? 'Save Plan' : 'Edit Plan'}
        </button>
      </div>

      {/* Plan Overview Card */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-semibold">Your Abroad Journey</h2>
          <Plane size={24} className="opacity-70" />
        </div>
        
        {editingPlan ? (
          <div className="space-y-3">
            {/* Country Selection with Custom Option */}
            {!showCustomCountry ? (
              <select 
                value={plan.targetCountry} 
                onChange={handleCountryChange}
                className="w-full px-3 py-2 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700"
              >
                {presetCountries.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            ) : (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter country name" 
                  value={customCountry}
                  onChange={(e) => setCustomCountry(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700"
                />
                <button
                  onClick={handleCustomCountrySubmit}
                  className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowCustomCountry(false);
                    setCustomCountry('');
                  }}
                  className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            )}
            
            <select 
              value={plan.purpose} 
              onChange={(e) => setPlan({...plan, purpose: e.target.value})}
              className="w-full px-3 py-2 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700"
            >
              {purposes.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
            </select>
            
            <input 
              type="date" 
              value={plan.targetDate} 
              onChange={(e) => setPlan({...plan, targetDate: e.target.value})}
              className="w-full px-3 py-2 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700"
              placeholder="Target Date"
            />
            
            <input 
              type="number" 
              placeholder="Estimated Budget (₹)" 
              value={plan.budget} 
              onChange={(e) => setPlan({...plan, budget: e.target.value})}
              className="w-full px-3 py-2 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700"
            />
            
            <input 
              type="text" 
              placeholder="Timeline (e.g., 2 years)" 
              value={plan.timeline} 
              onChange={(e) => setPlan({...plan, timeline: e.target.value})}
              className="w-full px-3 py-2 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700"
            />
            
            <button 
              onClick={handleSavePlan}
              className="w-full mt-2 bg-white text-blue-600 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm opacity-80">Target Country</p>
                <p className="font-semibold text-lg">{plan.targetCountry || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Purpose</p>
                <p className="font-semibold text-lg">{plan.purpose?.toUpperCase() || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Target Date</p>
                <p className="font-semibold">{plan.targetDate || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Timeline</p>
                <p className="font-semibold">{plan.timeline || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Estimated Budget</p>
                <p className="font-semibold">{plan.budget ? `₹${formatCurrency(parseFloat(plan.budget))}` : 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Target Visa Type</p>
                <p className="font-semibold">Student Visa</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <FileText className="text-blue-500" size={24} />
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{completedDocs}/{totalDocs}</div>
              <p className="text-xs text-gray-500">Documents Ready</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
            <div className="bg-green-500 rounded-full h-1.5" style={{ width: `${totalDocs > 0 ? (completedDocs / totalDocs) * 100 : 0}%` }}></div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <IndianRupee className="text-green-500" size={24} />
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">₹{formatCurrency(savedAmountNum)}</div>
              <p className="text-xs text-gray-500">Saved for Abroad</p>
            </div>
          </div>
          {budgetNum > 0 && (
            <>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                <div className="bg-green-500 rounded-full h-1.5" style={{ width: `${Math.min(100, progressPercent)}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{Math.min(100, progressPercent).toFixed(0)}% of budget</p>
            </>
          )}
          <button 
            onClick={handleUpdateSavedAmount}
            className="mt-2 text-xs text-blue-600 hover:text-blue-700"
          >
            + Update saved amount
          </button>
        </div>
      </div>

      {/* Financial Goal Card */}
      {budgetNum > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-400">Savings Goal Progress</p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-300">₹{formatCurrency(savedAmountNum)} / ₹{formatCurrency(budgetNum)}</p>
            </div>
            <Target size={32} className="text-green-600 opacity-50" />
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
            <div className="bg-green-500 rounded-full h-2" style={{ width: `${Math.min(100, progressPercent)}%` }}></div>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">
            Need ₹{formatCurrency(Math.max(0, budgetNum - savedAmountNum))} more to reach your goal
          </p>
        </div>
      )}

      {/* Documents Checklist */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Documents Checklist</h2>
            <p className="text-xs text-gray-500 mt-0.5">Track your application documents</p>
          </div>
          <button 
            onClick={() => {
              setEditingDoc(null);
              setDocForm({ name: '', status: 'pending', deadline: '', notes: '' });
              setShowDocModal(true);
            }} 
            className="text-blue-600 text-sm flex items-center gap-1 hover:text-blue-700"
          >
            <Plus size={14} /> Add Document
          </button>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {documents.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <FileText size={48} className="mx-auto mb-3 opacity-50" />
              <p>No documents added yet</p>
              <button 
                onClick={() => setShowDocModal(true)} 
                className="mt-2 text-blue-600 text-sm"
              >
                Add your first document →
              </button>
            </div>
          ) : (
            documents.map(doc => (
              <div key={doc.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-white">{doc.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        doc.status === 'completed' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                    {doc.deadline && (
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Calendar size={10} /> Due: {doc.deadline}
                      </p>
                    )}
                    {doc.notes && <p className="text-xs text-gray-400 mt-1">{doc.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleDocumentStatus(doc)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                      title={doc.status === 'completed' ? 'Mark as pending' : 'Mark as completed'}
                    >
                      {doc.status === 'completed' ? 
                        <CheckCircle size={18} className="text-green-500" /> : 
                        <XCircle size={18} className="text-gray-400" />
                      }
                    </button>
                    <button 
                      onClick={() => { 
                        setEditingDoc(doc); 
                        setDocForm({ 
                          name: doc.name, 
                          status: doc.status, 
                          deadline: doc.deadline || '', 
                          notes: doc.notes || '' 
                        }); 
                        setShowDocModal(true); 
                      }}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                    >
                      <Edit2 size={14} className="text-gray-500" />
                    </button>
                    <button 
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                    >
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Tips Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200">
        <div className="flex items-start gap-3">
          <BookOpen size={20} className="text-purple-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-purple-800 dark:text-purple-400">Application Timeline Tips</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              • Start visa application 6-8 months before intake<br />
              • IELTS/TOEFL scores valid for 2 years<br />
              • Financial documents need 4 months of bank history<br />
              • Apply to universities 8-12 months in advance
            </p>
          </div>
        </div>
      </div>

      {/* Document Modal */}
      {showDocModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingDoc ? 'Edit Document' : 'Add Document'}
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Document Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g., Passport, IELTS Score, SOP" 
                  value={docForm.name} 
                  onChange={(e) => setDocForm({...docForm, name: e.target.value})} 
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Status</label>
                <select 
                  value={docForm.status} 
                  onChange={(e) => setDocForm({...docForm, status: e.target.value})} 
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Deadline</label>
                <input 
                  type="date" 
                  value={docForm.deadline} 
                  onChange={(e) => setDocForm({...docForm, deadline: e.target.value})} 
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Notes</label>
                <textarea 
                  placeholder="Additional notes or requirements" 
                  value={docForm.notes} 
                  onChange={(e) => setDocForm({...docForm, notes: e.target.value})} 
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none" 
                  rows="2" 
                />
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button 
                onClick={handleSaveDocument} 
                className="flex-1 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {editingDoc ? 'Update' : 'Save'}
              </button>
              <button 
                onClick={() => setShowDocModal(false)} 
                className="flex-1 p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
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