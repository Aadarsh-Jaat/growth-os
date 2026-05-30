// src/pages/Transport.js - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import {
  Truck,
  Users,
  Fuel,
  DollarSign,
  Calendar,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  FileText,
  MapPin,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function Transport() {
  const { currentUser } = useAuth();
  const [trucks, setTrucks] = useState([]);
  const [trips, setTrips] = useState([]);
  const [showTruckModal, setShowTruckModal] = useState(false);
  const [showTripModal, setShowTripModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trips');
  
  const [truckForm, setTruckForm] = useState({
    number: '',
    driver: '',
    driverPhone: '',
    type: '',
    status: 'active',
    insuranceDate: '',
    pollutionDate: '',
    fitnessDate: ''
  });
  
  const [tripForm, setTripForm] = useState({
    truckNumber: '',
    partyName: '',
    fromLocation: '',
    toLocation: '',
    freight: '',
    advance: '',
    driverExpense: '',
    fuelExpense: '',
    status: 'ongoing',
    date: ''
  });

  const truckTypes = ['Open Body', 'Container', 'Trailer', 'Pickup', 'Tipper'];
  const truckStatuses = [
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    { value: 'maintenance', label: 'Maintenance', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    { value: 'idle', label: 'Idle', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' }
  ];
  
  const tripStatuses = [
    { value: 'planned', label: 'Planned', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
    { value: 'ongoing', label: 'Ongoing', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
  ];

  useEffect(() => {
    if (currentUser) {
      fetchTransportData();
    }
  }, [currentUser]);

  const fetchTransportData = async () => {
    if (!currentUser) {
      console.log('No user logged in');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Fetching transport data for user:', currentUser.uid);
      
      // Fetch trucks - removed orderBy to avoid issues
      const trucksQuery = query(
        collection(db, 'transportTrucks'),
        where('userId', '==', currentUser.uid)
      );
      const trucksSnapshot = await getDocs(trucksQuery);
      const trucksData = trucksSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      console.log('Trucks loaded:', trucksData.length);
      setTrucks(trucksData);

      // Fetch trips - removed orderBy to avoid issues
      const tripsQuery = query(
        collection(db, 'transportTrips'),
        where('userId', '==', currentUser.uid)
      );
      const tripsSnapshot = await getDocs(tripsQuery);
      const tripsData = tripsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        freight: Number(doc.data().freight) || 0,
        advance: Number(doc.data().advance) || 0,
        driverExpense: Number(doc.data().driverExpense) || 0,
        fuelExpense: Number(doc.data().fuelExpense) || 0,
        profit: Number(doc.data().profit) || 0,
        pendingAmount: Number(doc.data().pendingAmount) || 0
      }));
      console.log('Trips loaded:', tripsData.length);
      setTrips(tripsData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching transport data:', error);
      alert('Error loading data: ' + error.message);
      setLoading(false);
    }
  };

  const handleSaveTruck = async () => {
    // Validate required fields
    if (!truckForm.number.trim()) {
      alert('Please enter truck number');
      return;
    }
    if (!truckForm.driver.trim()) {
      alert('Please enter driver name');
      return;
    }
    
    try {
      const truckData = {
        number: truckForm.number.trim(),
        driver: truckForm.driver.trim(),
        driverPhone: truckForm.driverPhone || '',
        type: truckForm.type || '',
        status: truckForm.status,
        insuranceDate: truckForm.insuranceDate || '',
        pollutionDate: truckForm.pollutionDate || '',
        fitnessDate: truckForm.fitnessDate || '',
        userId: currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('Saving truck:', truckData);

      if (editingItem) {
        await updateDoc(doc(db, 'transportTrucks', editingItem.id), truckData);
        console.log('Truck updated successfully');
      } else {
        const docRef = await addDoc(collection(db, 'transportTrucks'), truckData);
        console.log('Truck added with ID:', docRef.id);
      }

      setShowTruckModal(false);
      setEditingItem(null);
      setTruckForm({
        number: '',
        driver: '',
        driverPhone: '',
        type: '',
        status: 'active',
        insuranceDate: '',
        pollutionDate: '',
        fitnessDate: ''
      });
      
      await fetchTransportData();
      alert(editingItem ? 'Truck updated successfully!' : 'Truck added successfully!');
      
    } catch (error) {
      console.error('Error saving truck:', error);
      alert('Failed to save truck: ' + error.message);
    }
  };

  const handleSaveTrip = async () => {
    // Validate required fields
    if (!tripForm.truckNumber) {
      alert('Please select a truck');
      return;
    }
    if (!tripForm.partyName.trim()) {
      alert('Please enter party name');
      return;
    }
    if (!tripForm.fromLocation || !tripForm.toLocation) {
      alert('Please enter from and to locations');
      return;
    }
    
    try {
      const freightNum = parseFloat(tripForm.freight) || 0;
      const advanceNum = parseFloat(tripForm.advance) || 0;
      const driverExpenseNum = parseFloat(tripForm.driverExpense) || 0;
      const fuelExpenseNum = parseFloat(tripForm.fuelExpense) || 0;
      
      const profit = freightNum - advanceNum - driverExpenseNum - fuelExpenseNum;
      const pendingAmount = freightNum - advanceNum;
      
      const tripData = {
        truckNumber: tripForm.truckNumber,
        partyName: tripForm.partyName.trim(),
        fromLocation: tripForm.fromLocation.trim(),
        toLocation: tripForm.toLocation.trim(),
        freight: freightNum,
        advance: advanceNum,
        driverExpense: driverExpenseNum,
        fuelExpense: fuelExpenseNum,
        profit: profit,
        pendingAmount: pendingAmount,
        status: tripForm.status,
        date: tripForm.date || new Date().toISOString().split('T')[0],
        userId: currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('Saving trip:', tripData);

      if (editingItem) {
        await updateDoc(doc(db, 'transportTrips', editingItem.id), tripData);
        console.log('Trip updated successfully');
      } else {
        const docRef = await addDoc(collection(db, 'transportTrips'), tripData);
        console.log('Trip added with ID:', docRef.id);
      }

      setShowTripModal(false);
      setEditingItem(null);
      setTripForm({
        truckNumber: '',
        partyName: '',
        fromLocation: '',
        toLocation: '',
        freight: '',
        advance: '',
        driverExpense: '',
        fuelExpense: '',
        status: 'ongoing',
        date: ''
      });
      
      await fetchTransportData();
      alert(editingItem ? 'Trip updated successfully!' : 'Trip added successfully!');
      
    } catch (error) {
      console.error('Error saving trip:', error);
      alert('Failed to save trip: ' + error.message);
    }
  };

  const handleDelete = async (collectionName, id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteDoc(doc(db, collectionName, id));
        console.log('Item deleted successfully');
        await fetchTransportData();
        alert('Item deleted successfully!');
      } catch (error) {
        console.error('Error deleting:', error);
        alert('Failed to delete: ' + error.message);
      }
    }
  };

  const updateTripStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'transportTrips', id), { 
        status: newStatus,
        updatedAt: new Date()
      });
      console.log('Status updated successfully');
      await fetchTransportData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status: ' + error.message);
    }
  };

  const stats = {
    totalTrucks: trucks.length,
    activeTrucks: trucks.filter(t => t.status === 'active').length,
    totalTrips: trips.length,
    completedTrips: trips.filter(t => t.status === 'completed').length,
    ongoingTrips: trips.filter(t => t.status === 'ongoing').length,
    totalFreight: trips.reduce((sum, t) => sum + (Number(t.freight) || 0), 0),
    totalProfit: trips.reduce((sum, t) => sum + (Number(t.profit) || 0), 0),
    totalPending: trips.reduce((sum, t) => sum + (Number(t.pendingAmount) || 0), 0)
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bhukker Transport Co.</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingItem(null);
              setTruckForm({
                number: '',
                driver: '',
                driverPhone: '',
                type: '',
                status: 'active',
                insuranceDate: '',
                pollutionDate: '',
                fitnessDate: ''
              });
              setShowTruckModal(true);
            }}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-1 text-sm"
          >
            <Plus size={16} />
            Add Truck
          </button>
          <button
            onClick={() => {
              setEditingItem(null);
              setTripForm({
                truckNumber: '',
                partyName: '',
                fromLocation: '',
                toLocation: '',
                freight: '',
                advance: '',
                driverExpense: '',
                fuelExpense: '',
                status: 'ongoing',
                date: ''
              });
              setShowTripModal(true);
            }}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-1 text-sm"
          >
            <Plus size={16} />
            Add Trip
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Truck className="text-blue-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTrucks}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Trucks</p>
          <p className="text-xs text-green-600 mt-1">{stats.activeTrucks} Active</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <MapPin className="text-purple-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTrips}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Trips</p>
          <p className="text-xs text-green-600 mt-1">{stats.completedTrips} Completed</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="text-green-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{stats.totalFreight.toLocaleString()}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Freight</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="text-yellow-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{stats.totalProfit.toLocaleString()}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Profit</p>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={18} className="text-orange-600" />
            <span className="text-sm font-medium text-orange-600">Ongoing Trips</span>
          </div>
          <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">{stats.ongoingTrips}</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={18} className="text-red-600" />
            <span className="text-sm font-medium text-red-600">Pending Amount</span>
          </div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-400">₹{stats.totalPending.toLocaleString()}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('trips')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'trips'
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Trips ({trips.length})
        </button>
        <button
          onClick={() => setActiveTab('trucks')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'trucks'
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Trucks ({trucks.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'payments'
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Payments
        </button>
      </div>

      {/* Trips Tab */}
      {activeTab === 'trips' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Trips</h2>
            <p className="text-sm text-gray-500 mt-1">Total trips: {trips.length}</p>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {trips.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Truck size={48} className="mx-auto mb-3 opacity-50" />
                <p>No trips recorded yet.</p>
                <button 
                  onClick={() => setShowTripModal(true)} 
                  className="mt-2 text-green-600 text-sm"
                >
                  Add your first trip →
                </button>
              </div>
            ) : (
              trips.map(trip => {
                const status = tripStatuses.find(s => s.value === trip.status);
                const pendingAmount = (Number(trip.freight) || 0) - (Number(trip.advance) || 0);
                return (
                  <div key={trip.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <div className="flex justify-between items-start flex-wrap gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {trip.fromLocation} → {trip.toLocation}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${status?.color}`}>
                            {status?.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 dark:text-gray-400 mt-2">
                          <span>🚛 Truck: {trip.truckNumber}</span>
                          <span>🏢 Party: {trip.partyName}</span>
                          <span>💰 Freight: ₹{Number(trip.freight).toLocaleString()}</span>
                          <span>📅 Date: {trip.date}</span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm mt-2">
                          <span className="text-green-600">Advance: ₹{Number(trip.advance).toLocaleString()}</span>
                          <span className="text-orange-600">Pending: ₹{pendingAmount.toLocaleString()}</span>
                          <span className="text-purple-600">Profit: ₹{Number(trip.profit).toLocaleString()}</span>
                        </div>
                        {trip.status !== 'completed' && trip.status !== 'cancelled' && (
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={() => updateTripStatus(trip.id, 'completed')}
                              className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                            >
                              Mark Complete
                            </button>
                            <button
                              onClick={() => updateTripStatus(trip.id, 'cancelled')}
                              className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              Cancel Trip
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingItem(trip);
                            setTripForm({
                              truckNumber: trip.truckNumber,
                              partyName: trip.partyName,
                              fromLocation: trip.fromLocation,
                              toLocation: trip.toLocation,
                              freight: trip.freight,
                              advance: trip.advance,
                              driverExpense: trip.driverExpense,
                              fuelExpense: trip.fuelExpense,
                              status: trip.status,
                              date: trip.date
                            });
                            setShowTripModal(true);
                          }}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                        >
                          <Edit2 size={16} className="text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDelete('transportTrips', trip.id)}
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
      )}

      {/* Trucks Tab */}
      {activeTab === 'trucks' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Fleet Management</h2>
            <p className="text-sm text-gray-500 mt-1">Total trucks: {trucks.length}</p>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {trucks.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Truck size={48} className="mx-auto mb-3 opacity-50" />
                <p>No trucks added yet.</p>
                <button 
                  onClick={() => setShowTruckModal(true)} 
                  className="mt-2 text-blue-600 text-sm"
                >
                  Add your first truck →
                </button>
              </div>
            ) : (
              trucks.map(truck => {
                const status = truckStatuses.find(s => s.value === truck.status);
                return (
                  <div key={truck.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <div className="flex justify-between items-start flex-wrap gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{truck.number}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${status?.color}`}>
                            {status?.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mt-2">
                          <span>👨‍✈️ Driver: {truck.driver}</span>
                          <span>📞 Phone: {truck.driverPhone}</span>
                          <span>🚛 Type: {truck.type}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mt-2">
                          {truck.insuranceDate && <span>🔒 Insurance: {truck.insuranceDate}</span>}
                          {truck.pollutionDate && <span>🌿 PUC: {truck.pollutionDate}</span>}
                          {truck.fitnessDate && <span>✅ Fitness: {truck.fitnessDate}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingItem(truck);
                            setTruckForm({
                              number: truck.number,
                              driver: truck.driver,
                              driverPhone: truck.driverPhone || '',
                              type: truck.type || '',
                              status: truck.status,
                              insuranceDate: truck.insuranceDate || '',
                              pollutionDate: truck.pollutionDate || '',
                              fitnessDate: truck.fitnessDate || ''
                            });
                            setShowTruckModal(true);
                          }}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                        >
                          <Edit2 size={16} className="text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDelete('transportTrucks', truck.id)}
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
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Summary</h2>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="font-medium">Total Freight Collected</span>
                <span className="text-xl font-bold text-green-600">₹{stats.totalFreight.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="font-medium">Total Advance Received</span>
                <span className="text-xl font-bold text-blue-600">
                  ₹{(stats.totalFreight - stats.totalPending).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200">
                <span className="font-medium text-red-600">Pending Payments</span>
                <span className="text-xl font-bold text-red-600">₹{stats.totalPending.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <span className="font-medium">Total Expenses</span>
                <span className="text-xl font-bold text-purple-600">
                  ₹{(stats.totalFreight - stats.totalProfit).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="font-medium">Net Profit</span>
                <span className="text-xl font-bold text-green-600">₹{stats.totalProfit.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2">Pending Payments by Party</h3>
              {trips.filter(t => Number(t.pendingAmount) > 0 && t.status !== 'cancelled').map(trip => (
                <div key={trip.id} className="flex justify-between items-center py-2 border-b border-yellow-200">
                  <span>{trip.partyName} ({trip.truckNumber})</span>
                  <span className="font-semibold text-red-600">₹{Number(trip.pendingAmount).toLocaleString()}</span>
                </div>
              ))}
              {trips.filter(t => Number(t.pendingAmount) > 0 && t.status !== 'cancelled').length === 0 && (
                <p className="text-gray-500 text-center py-2">No pending payments</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Truck Modal */}
      {showTruckModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingItem ? 'Edit Truck' : 'Add New Truck'}
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Truck Number *</label>
                <input type="text" placeholder="e.g., HR55AB1234" value={truckForm.number} onChange={(e) => setTruckForm({...truckForm, number: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Driver Name *</label>
                <input type="text" placeholder="Driver name" value={truckForm.driver} onChange={(e) => setTruckForm({...truckForm, driver: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
              </div>
              <input type="tel" placeholder="Driver Phone" value={truckForm.driverPhone} onChange={(e) => setTruckForm({...truckForm, driverPhone: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
              <select value={truckForm.type} onChange={(e) => setTruckForm({...truckForm, type: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700">
                <option value="">Select Type</option>
                {truckTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={truckForm.status} onChange={(e) => setTruckForm({...truckForm, status: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700">
                {truckStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <input type="date" placeholder="Insurance Expiry" value={truckForm.insuranceDate} onChange={(e) => setTruckForm({...truckForm, insuranceDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
              <input type="date" placeholder="Pollution Certificate Expiry" value={truckForm.pollutionDate} onChange={(e) => setTruckForm({...truckForm, pollutionDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
              <input type="date" placeholder="Fitness Certificate Expiry" value={truckForm.fitnessDate} onChange={(e) => setTruckForm({...truckForm, fitnessDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
            </div>
            <div className="p-5 border-t flex gap-3">
              <button onClick={handleSaveTruck} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
              <button onClick={() => setShowTruckModal(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Trip Modal */}
      {showTripModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingItem ? 'Edit Trip' : 'Add New Trip'}
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Truck *</label>
                <select value={tripForm.truckNumber} onChange={(e) => setTripForm({...tripForm, truckNumber: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700">
                  <option value="">Select Truck</option>
                  {trucks.map(t => <option key={t.id} value={t.number}>{t.number} - {t.driver}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Party Name *</label>
                <input type="text" placeholder="Customer/Party name" value={tripForm.partyName} onChange={(e) => setTripForm({...tripForm, partyName: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">From Location *</label>
                <input type="text" placeholder="Pickup location" value={tripForm.fromLocation} onChange={(e) => setTripForm({...tripForm, fromLocation: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">To Location *</label>
                <input type="text" placeholder="Drop location" value={tripForm.toLocation} onChange={(e) => setTripForm({...tripForm, toLocation: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
              </div>
              <input type="number" placeholder="Freight Amount (₹)" value={tripForm.freight} onChange={(e) => setTripForm({...tripForm, freight: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
              <input type="number" placeholder="Advance Received (₹)" value={tripForm.advance} onChange={(e) => setTripForm({...tripForm, advance: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
              <input type="number" placeholder="Driver Expense (₹)" value={tripForm.driverExpense} onChange={(e) => setTripForm({...tripForm, driverExpense: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
              <input type="number" placeholder="Fuel Expense (₹)" value={tripForm.fuelExpense} onChange={(e) => setTripForm({...tripForm, fuelExpense: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
              <input type="date" placeholder="Trip Date" value={tripForm.date} onChange={(e) => setTripForm({...tripForm, date: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
              <select value={tripForm.status} onChange={(e) => setTripForm({...tripForm, status: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700">
                {tripStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="p-5 border-t flex gap-3">
              <button onClick={handleSaveTrip} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg">Save</button>
              <button onClick={() => setShowTripModal(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}