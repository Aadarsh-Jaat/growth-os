// src/pages/Wildcore.js - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import {
  Package,
  ShoppingCart,
  Users,
  Calendar,
  Instagram,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  MessageCircle,
  Image
} from 'lucide-react';

export default function Wildcore() {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [contentIdeas, setContentIdeas] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    price: '',
    costPrice: '',
    stock: '',
    notes: ''
  });
  const [contentForm, setContentForm] = useState({
    idea: '',
    type: 'reel',
    caption: '',
    status: 'draft',
    date: ''
  });

  useEffect(() => {
    if (currentUser) {
      fetchWildcoreData();
      generateAISuggestion();
    }
  }, [currentUser]);

  const fetchWildcoreData = async () => {
    if (!currentUser) {
      console.log('No user logged in');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Fetching Wildcore data for user:', currentUser.uid);
      
      // Fetch products
      const productsQuery = query(
        collection(db, 'wildcoreProducts'),
        where('userId', '==', currentUser.uid)
      );
      const productsSnapshot = await getDocs(productsQuery);
      const productsData = productsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        price: Number(doc.data().price) || 0,
        costPrice: Number(doc.data().costPrice) || 0,
        stock: Number(doc.data().stock) || 0,
        profit: Number(doc.data().profit) || 0
      }));
      console.log('Products loaded:', productsData.length);
      setProducts(productsData);

      // Fetch content ideas
      const contentQuery = query(
        collection(db, 'wildcoreContent'),
        where('userId', '==', currentUser.uid)
      );
      const contentSnapshot = await getDocs(contentQuery);
      const contentData = contentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Content ideas loaded:', contentData.length);
      setContentIdeas(contentData);

      // Fetch orders (optional)
      const ordersQuery = query(
        collection(db, 'wildcoreOrders'),
        where('userId', '==', currentUser.uid)
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching Wildcore data:', error);
      alert('Error loading data: ' + error.message);
      setLoading(false);
    }
  };

  const generateAISuggestion = () => {
    const suggestions = [
      "📱 Post a reel showing how to layer different perfume notes for a signature scent.",
      "🎁 Run a 'Buy 2 Get 1 Free' promotion on your bestsellers this weekend.",
      "📸 Share customer reviews with photos - social proof drives sales!",
      "💡 Create content around 'Best perfumes for summer/winter' - seasonal content performs well.",
      "🤝 Collaborate with micro-influencers in the fragrance niche for authentic promotion.",
      "🎨 Highlight the unique packaging and presentation of Wildcore perfumes.",
      "📝 Write a blog post about 'How to choose the perfect fragrance for your personality'."
    ];
    setAiSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)]);
  };

  const handleSaveProduct = async () => {
    // Validate required fields
    if (!productForm.name.trim()) {
      alert('Please enter product name');
      return;
    }
    if (!productForm.price) {
      alert('Please enter price');
      return;
    }
    
    try {
      const priceNum = parseFloat(productForm.price) || 0;
      const costPriceNum = parseFloat(productForm.costPrice) || 0;
      const stockNum = parseInt(productForm.stock) || 0;
      const profitNum = priceNum - costPriceNum;
      
      const productData = {
        name: productForm.name.trim(),
        category: productForm.category || '',
        price: priceNum,
        costPrice: costPriceNum,
        stock: stockNum,
        profit: profitNum,
        notes: productForm.notes || '',
        userId: currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('Saving product:', productData);

      if (editingItem) {
        await updateDoc(doc(db, 'wildcoreProducts', editingItem.id), productData);
        console.log('Product updated successfully');
      } else {
        const docRef = await addDoc(collection(db, 'wildcoreProducts'), productData);
        console.log('Product added with ID:', docRef.id);
      }

      setShowProductModal(false);
      setEditingItem(null);
      setProductForm({
        name: '',
        category: '',
        price: '',
        costPrice: '',
        stock: '',
        notes: ''
      });
      
      await fetchWildcoreData();
      alert(editingItem ? 'Product updated successfully!' : 'Product added successfully!');
      
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product: ' + error.message);
    }
  };

  const handleSaveContent = async () => {
    if (!contentForm.idea.trim()) {
      alert('Please enter content idea');
      return;
    }
    
    try {
      const contentData = {
        idea: contentForm.idea.trim(),
        type: contentForm.type,
        caption: contentForm.caption || '',
        status: contentForm.status,
        date: contentForm.date || '',
        userId: currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('Saving content:', contentData);

      if (editingItem) {
        await updateDoc(doc(db, 'wildcoreContent', editingItem.id), contentData);
        console.log('Content updated successfully');
      } else {
        const docRef = await addDoc(collection(db, 'wildcoreContent'), contentData);
        console.log('Content added with ID:', docRef.id);
      }

      setShowContentModal(false);
      setEditingItem(null);
      setContentForm({
        idea: '',
        type: 'reel',
        caption: '',
        status: 'draft',
        date: ''
      });
      
      await fetchWildcoreData();
      alert(editingItem ? 'Content updated successfully!' : 'Content added successfully!');
      
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save content: ' + error.message);
    }
  };

  const handleDeleteItem = async (collectionName, id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteDoc(doc(db, collectionName, id));
        console.log('Item deleted successfully');
        await fetchWildcoreData();
        alert('Item deleted successfully!');
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item: ' + error.message);
      }
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  const totalProfit = products.reduce((sum, p) => sum + ((Number(p.price) - Number(p.costPrice)) * (Number(p.stock) || 0)), 0);
  const totalProducts = products.length;
  const lowStock = products.filter(p => Number(p.stock) < 10).length;

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wildcore Perfume Brand</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingItem(null);
              setProductForm({
                name: '',
                category: '',
                price: '',
                costPrice: '',
                stock: '',
                notes: ''
              });
              setShowProductModal(true);
            }}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-1 text-sm"
          >
            <Plus size={16} />
            Add Product
          </button>
          <button
            onClick={() => {
              setEditingItem(null);
              setContentForm({
                idea: '',
                type: 'reel',
                caption: '',
                status: 'draft',
                date: ''
              });
              setShowContentModal(true);
            }}
            className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-1 text-sm"
          >
            <Instagram size={16} />
            Add Content
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Package className="text-blue-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{totalProducts}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Products</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="text-green-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{totalRevenue.toLocaleString()}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="text-purple-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{totalProfit.toLocaleString()}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Profit</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="text-red-500" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{lowStock}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Low Stock Items</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'products'
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'content'
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Content ({contentIdeas.length})
        </button>
      </div>

      {/* AI Suggestion */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl p-5 border border-pink-200 dark:border-pink-800">
        <div className="flex items-start gap-3">
          <Sparkles className="text-pink-600 dark:text-pink-400 mt-1" size={20} />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">AI Marketing Suggestion</h3>
            <p className="text-gray-700 dark:text-gray-300">{aiSuggestion}</p>
            <button onClick={generateAISuggestion} className="mt-2 text-sm text-pink-600 hover:text-pink-700 dark:text-pink-400">
              Generate New Idea →
            </button>
          </div>
        </div>
      </div>

      {/* Products Section */}
      {activeTab === 'products' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Product Catalog</h2>
            <p className="text-sm text-gray-500 mt-1">Total products: {products.length}</p>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {products.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Package size={48} className="mx-auto mb-3 opacity-50" />
                <p>No products added yet.</p>
                <button 
                  onClick={() => setShowProductModal(true)} 
                  className="mt-2 text-blue-600 text-sm"
                >
                  Add your first product →
                </button>
              </div>
            ) : (
              products.map(product => (
                <div key={product.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                      {product.category && (
                        <span className="text-xs text-gray-500">{product.category}</span>
                      )}
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span className="font-medium text-green-600">₹{Number(product.price).toLocaleString()}</span>
                        <span>Cost: ₹{Number(product.costPrice).toLocaleString()}</span>
                        <span>Profit: ₹{Number(product.profit).toLocaleString()}</span>
                        <span className={Number(product.stock) < 10 ? 'text-red-500' : ''}>
                          Stock: {Number(product.stock)} units
                        </span>
                      </div>
                      {product.notes && <p className="text-sm text-gray-500 mt-2">{product.notes}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { 
                          setEditingItem(product); 
                          setProductForm({
                            name: product.name,
                            category: product.category || '',
                            price: product.price,
                            costPrice: product.costPrice,
                            stock: product.stock,
                            notes: product.notes || ''
                          }); 
                          setShowProductModal(true); 
                        }} 
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Edit2 size={16} className="text-gray-500" />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem('wildcoreProducts', product.id)} 
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Content Ideas Section */}
      {activeTab === 'content' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Content Calendar</h2>
            <p className="text-sm text-gray-500 mt-1">Total ideas: {contentIdeas.length}</p>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {contentIdeas.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Instagram size={48} className="mx-auto mb-3 opacity-50" />
                <p>No content ideas yet.</p>
                <button 
                  onClick={() => setShowContentModal(true)} 
                  className="mt-2 text-purple-600 text-sm"
                >
                  Add your first content idea →
                </button>
              </div>
            ) : (
              contentIdeas.map(content => (
                <div key={content.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {content.type === 'reel' ? <Instagram size={16} className="text-pink-500" /> : <Image size={16} className="text-blue-500" />}
                        <h3 className="font-semibold text-gray-900 dark:text-white">{content.idea}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          content.status === 'published' ? 'bg-green-100 text-green-700' :
                          content.status === 'draft' ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {content.status}
                        </span>
                      </div>
                      {content.caption && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{content.caption}</p>}
                      {content.date && <p className="text-xs text-gray-500 mt-1">📅 Scheduled: {content.date}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { 
                          setEditingItem(content); 
                          setContentForm({
                            idea: content.idea,
                            type: content.type,
                            caption: content.caption || '',
                            status: content.status,
                            date: content.date || ''
                          }); 
                          setShowContentModal(true); 
                        }} 
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Edit2 size={16} className="text-gray-500" />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem('wildcoreContent', content.id)} 
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingItem ? 'Edit Product' : 'Add New Product'}
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Product Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g., Wild Oud, Royal Rose" 
                  value={productForm.name} 
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})} 
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Category</label>
                <input 
                  type="text" 
                  placeholder="e.g., Luxury, Everyday, Special Edition" 
                  value={productForm.category} 
                  onChange={(e) => setProductForm({...productForm, category: e.target.value})} 
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Selling Price (₹) *</label>
                <input 
                  type="number" 
                  placeholder="e.g., 1999" 
                  value={productForm.price} 
                  onChange={(e) => setProductForm({...productForm, price: e.target.value})} 
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Cost Price (₹)</label>
                <input 
                  type="number" 
                  placeholder="e.g., 1200" 
                  value={productForm.costPrice} 
                  onChange={(e) => setProductForm({...productForm, costPrice: e.target.value})} 
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Stock Quantity</label>
                <input 
                  type="number" 
                  placeholder="e.g., 50" 
                  value={productForm.stock} 
                  onChange={(e) => setProductForm({...productForm, stock: e.target.value})} 
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Notes</label>
                <textarea 
                  placeholder="Any additional information" 
                  value={productForm.notes} 
                  onChange={(e) => setProductForm({...productForm, notes: e.target.value})} 
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none" 
                  rows="3" 
                />
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button 
                onClick={handleSaveProduct} 
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {editingItem ? 'Update' : 'Save'}
              </button>
              <button 
                onClick={() => setShowProductModal(false)} 
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Modal */}
      {showContentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingItem ? 'Edit Content' : 'Add Content Idea'}
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Content Idea *</label>
                <textarea 
                  placeholder="Describe your reel/post idea..." 
                  value={contentForm.idea} 
                  onChange={(e) => setContentForm({...contentForm, idea: e.target.value})} 
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none" 
                  rows="3" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Content Type</label>
                <select 
                  value={contentForm.type} 
                  onChange={(e) => setContentForm({...contentForm, type: e.target.value})} 
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="reel">Reel / Video</option>
                  <option value="post">Post / Image</option>
                  <option value="story">Story</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Caption</label>
                <textarea 
                  placeholder="Write the caption for this post" 
                  value={contentForm.caption} 
                  onChange={(e) => setContentForm({...contentForm, caption: e.target.value})} 
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none" 
                  rows="2" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Schedule Date</label>
                <input 
                  type="date" 
                  value={contentForm.date} 
                  onChange={(e) => setContentForm({...contentForm, date: e.target.value})} 
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Status</label>
                <select 
                  value={contentForm.status} 
                  onChange={(e) => setContentForm({...contentForm, status: e.target.value})} 
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button 
                onClick={handleSaveContent} 
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                {editingItem ? 'Update' : 'Save'}
              </button>
              <button 
                onClick={() => setShowContentModal(false)} 
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