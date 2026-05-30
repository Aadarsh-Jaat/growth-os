// src/pages/InvestingSavings.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import {
  TrendingUp,
  PiggyBank,
  DollarSign,
  Target,
  Shield,
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Sparkles,
  Wallet,
  LineChart,
  BarChart3,
  Home,
  GraduationCap,
  Briefcase,
  Heart
} from 'lucide-react';
import { LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function InvestingSavings() {
  const { currentUser } = useAuth();
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiAdvice, setAiAdvice] = useState('');
  const [activeTab, setActiveTab] = useState('goals');
  
  const [goalForm, setGoalForm] = useState({
    name: '',
    targetAmount: '',
    savedAmount: '',
    targetDate: '',
    category: ''
  });
  
  const [transactionForm, setTransactionForm] = useState({
    type: 'expense',
    category: '',
    amount: '',
    date: '',
    description: ''
  });

  const goalCategories = [
    'Emergency Fund', 'Sister Marriage', 'Personal Fund', 
    'Parents Fund', 'Business Fund', 'Abroad Fund', 'Wealth Goal'
  ];

  const expenseCategories = [
    'Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 
    'Healthcare', 'Education', 'Investment', 'Savings', 'Other'
  ];

  const wealthGoal = 15000000; // ₹1.5 Crore

  useEffect(() => {
    if (currentUser) {
      fetchFinanceData();
      generateAIAdvice();
    }
  }, [currentUser]);

  const toMs = (t) => {
    if (!t) return 0;
    if (typeof t.toMillis === 'function') return t.toMillis();
    if (t.seconds) return t.seconds * 1000;
    return new Date(t).getTime() || 0;
  };

  const fetchFinanceData = async () => {
    if (!currentUser) return;
    try {
      const goalsQuery = query(
        collection(db, 'savingsGoals'),
        where('userId', '==', currentUser.uid)
      );
      const goalsSnapshot = await getDocs(goalsQuery);
      const goals = goalsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      goals.sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt));
      setSavingsGoals(goals);

      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', currentUser.uid)
      );
      const transactionsSnapshot = await getDocs(transactionsQuery);
      const txs = transactionsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      txs.sort((a, b) => (b.date || '').localeCompare(a.date || '') || toMs(b.createdAt) - toMs(a.createdAt));
      setTransactions(txs.slice(0, 50));
    } catch (error) {
      console.error('Error fetching finance data:', error);
      alert(`Could not load investing data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateAIAdvice = () => {
    const adviceList = [
      "💰 Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings",
      "📊 Review your expenses from last week - small cuts add up!",
      "🎯 Your emergency fund should cover 6 months of expenses",
      "📈 Start with index funds for long-term wealth building",
      "🏦 Automate your savings - set up auto-transfer on salary day",
      "📚 Learn one investing concept this week: SIP, CAGR, or Diversification",
      "⚠️ You're spending more on dining out - try cooking at home 3 more days this week",
      "💎 Remember your ₹1.5 Crore goal! Every ₹100 saved today is ₹300 in 10 years"
    ];
    setAiAdvice(adviceList[Math.floor(Math.random() * adviceList.length)]);
  };

  const handleSaveGoal = async () => {
    if (!currentUser) {
      alert('You must be logged in.');
      return;
    }
    if (!goalForm.name?.trim() || !goalForm.targetAmount) {
      alert('Please enter a goal name and target amount.');
      return;
    }
    const targetAmount = parseFloat(goalForm.targetAmount);
    const savedAmount = parseFloat(goalForm.savedAmount) || 0;
    if (Number.isNaN(targetAmount) || targetAmount <= 0) {
      alert('Please enter a valid target amount.');
      return;
    }
    try {
      const goalData = {
        name: goalForm.name.trim(),
        category: goalForm.category,
        targetAmount,
        savedAmount,
        targetDate: goalForm.targetDate,
        remainingAmount: targetAmount - savedAmount,
        progress: (savedAmount / targetAmount) * 100,
        userId: currentUser.uid
      };

      if (editingItem?.id) {
        await updateDoc(doc(db, 'savingsGoals', editingItem.id), {
          ...goalData,
          updatedAt: new Date()
        });
      } else {
        const docRef = await addDoc(collection(db, 'savingsGoals'), {
          ...goalData,
          createdAt: new Date()
        });
        setSavingsGoals((prev) => [{ id: docRef.id, ...goalData, createdAt: new Date() }, ...prev]);
        setActiveTab('goals');
      }

      setShowGoalModal(false);
      setEditingItem(null);
      setGoalForm({
        name: '',
        targetAmount: '',
        savedAmount: '',
        targetDate: '',
        category: ''
      });
      await fetchFinanceData();
    } catch (error) {
      console.error('Error saving goal:', error);
      alert(`Failed to save goal: ${error.message}`);
    }
  };

  const handleSaveTransaction = async () => {
    if (!currentUser) {
      alert('You must be logged in.');
      return;
    }
    if (!transactionForm.amount || !transactionForm.category) {
      alert('Please enter amount and category.');
      return;
    }
    const amount = parseFloat(transactionForm.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    try {
      const transactionData = {
        type: transactionForm.type,
        category: transactionForm.category,
        amount,
        description: transactionForm.description,
        date: transactionForm.date || new Date().toISOString().split('T')[0],
        userId: currentUser.uid
      };

      if (editingItem?.id) {
        await updateDoc(doc(db, 'transactions', editingItem.id), {
          ...transactionData,
          updatedAt: new Date()
        });
      } else {
        const docRef = await addDoc(collection(db, 'transactions'), {
          ...transactionData,
          createdAt: new Date()
        });
        setTransactions((prev) => [
          { id: docRef.id, ...transactionData, createdAt: new Date() },
          ...prev
        ]);
        setActiveTab('transactions');
      }

      setShowTransactionModal(false);
      setEditingItem(null);
      setTransactionForm({
        type: 'expense',
        category: '',
        amount: '',
        date: '',
        description: ''
      });
      await fetchFinanceData();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert(`Failed to save transaction: ${error.message}`);
    }
  };

  const handleDelete = async (collectionName, id) => {
    if (window.confirm('Are you sure you want to delete this?')) {
      try {
        await deleteDoc(doc(db, collectionName, id));
        fetchFinanceData();
      } catch (error) {
        console.error('Error deleting:', error);
        alert('Failed to delete.');
      }
    }
  };

  const totalSaved = savingsGoals.reduce((sum, goal) => sum + (goal.savedAmount || 0), 0);
  const totalTarget = savingsGoals.reduce((sum, goal) => sum + (goal.targetAmount || 0), 0);
  const totalProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
  
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const monthlyBalance = totalIncome - totalExpense;

  const expenseData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const pieData = Object.entries(expenseData).map(([name, value]) => ({ name, value, color: `#${Math.floor(Math.random()*16777215).toString(16)}` }));

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Investing & Savings</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingItem(null);
              setShowGoalModal(true);
            }}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-1 text-sm"
          >
            <Plus size={16} />
            Add Goal
          </button>
          <button
            onClick={() => {
              setEditingItem(null);
              setShowTransactionModal(true);
            }}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-1 text-sm"
          >
            <Plus size={16} />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Wealth Goal Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold mb-1">🎯 10-Year Wealth Goal</h2>
            <p className="text-3xl font-bold">₹1.5 Crore</p>
            <p className="text-sm opacity-90 mt-1">Current Progress: ₹{(totalSaved / 100000).toFixed(1)}L / ₹150L</p>
          </div>
          <Target size={48} className="opacity-50" />
        </div>
        <div className="w-full bg-white/30 rounded-full h-3 mt-4">
          <div className="bg-white rounded-full h-3" style={{ width: `${(totalSaved / 15000000) * 100}%` }}></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <PiggyBank className="text-green-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{(totalSaved / 1000).toFixed(0)}K</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Saved</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Target className="text-purple-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{savingsGoals.length}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Goals</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="text-blue-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{(monthlyBalance / 1000).toFixed(0)}K</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Balance</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="text-yellow-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{totalProgress.toFixed(0)}%</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</p>
        </div>
      </div>

      {/* AI Advice */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800">
        <div className="flex items-start gap-3">
          <Sparkles className="text-indigo-600 dark:text-indigo-400 mt-0.5" size={18} />
          <div>
            <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">AI Financial Tip</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{aiAdvice}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('goals')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'goals'
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Savings Goals
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'transactions'
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Transactions
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'insights'
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Insights
        </button>
      </div>

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="grid gap-4">
          {savingsGoals.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
              <PiggyBank size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-gray-500 dark:text-gray-400">No savings goals yet</p>
              <button onClick={() => setShowGoalModal(true)} className="mt-2 text-blue-600 text-sm">Create your first goal →</button>
            </div>
          ) : (
            savingsGoals.map(goal => (
              <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{goal.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{goal.category}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingItem(goal); setGoalForm(goal); setShowGoalModal(true); }} className="p-1 hover:bg-gray-100 rounded">
                      <Edit2 size={16} className="text-gray-500" />
                    </button>
                    <button onClick={() => handleDelete('savingsGoals', goal.id)} className="p-1 hover:bg-gray-100 rounded">
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="text-gray-900 dark:text-white font-medium">{goal.progress?.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 rounded-full h-2" style={{ width: `${goal.progress}%` }}></div>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Saved: ₹{goal.savedAmount?.toLocaleString()}</span>
                  <span className="text-gray-600 dark:text-gray-400">Target: ₹{goal.targetAmount?.toLocaleString()}</span>
                </div>
                {goal.targetDate && <p className="text-xs text-gray-500 mt-2">Target Date: {goal.targetDate}</p>}
              </div>
            ))
          )}
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Wallet size={48} className="mx-auto mb-3 opacity-50" />
                <p>No transactions yet</p>
              </div>
            ) : (
              transactions.map(t => (
                <div key={t.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{t.description || t.category}</p>
                    <p className="text-xs text-gray-500">{t.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                    </span>
                    <button onClick={() => handleDelete('transactions', t.id)} className="p-1">
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Monthly Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Income</span>
                <span className="text-green-600">+₹{totalIncome.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Expenses</span>
                <span className="text-red-600">-₹{totalExpense.toLocaleString()}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Net Savings</span>
                <span className={monthlyBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                  ₹{monthlyBalance.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {pieData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Expense Breakdown</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-5 border-b"><h2 className="text-xl font-semibold">{editingItem ? 'Edit Goal' : 'Add Savings Goal'}</h2></div>
            <div className="p-5 space-y-4">
              <input type="text" placeholder="Goal Name" value={goalForm.name} onChange={(e) => setGoalForm({...goalForm, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              <select value={goalForm.category} onChange={(e) => setGoalForm({...goalForm, category: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                <option value="">Select Category</option>
                {goalCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="number" placeholder="Target Amount (₹)" value={goalForm.targetAmount} onChange={(e) => setGoalForm({...goalForm, targetAmount: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              <input type="number" placeholder="Saved Amount (₹)" value={goalForm.savedAmount} onChange={(e) => setGoalForm({...goalForm, savedAmount: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              <input type="date" placeholder="Target Date" value={goalForm.targetDate} onChange={(e) => setGoalForm({...goalForm, targetDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div className="p-5 border-t flex gap-3">
              <button onClick={handleSaveGoal} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
              <button onClick={() => setShowGoalModal(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-5 border-b"><h2 className="text-xl font-semibold">Add Transaction</h2></div>
            <div className="p-5 space-y-4">
              <select value={transactionForm.type} onChange={(e) => setTransactionForm({...transactionForm, type: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              <select value={transactionForm.category} onChange={(e) => setTransactionForm({...transactionForm, category: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                <option value="">Select Category</option>
                {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="number" placeholder="Amount (₹)" value={transactionForm.amount} onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              <input type="date" placeholder="Date" value={transactionForm.date} onChange={(e) => setTransactionForm({...transactionForm, date: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              <input type="text" placeholder="Description" value={transactionForm.description} onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div className="p-5 border-t flex gap-3">
              <button onClick={handleSaveTransaction} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg">Save</button>
              <button onClick={() => setShowTransactionModal(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}