import React, { useState, useEffect, useRef } from 'react';
import { X, Package, ClipboardList, Plus, CheckCircle, Image as ImageIcon, Trash2, ShieldCheck, Upload, Settings, MessageCircle, Facebook, Mail, Type, Users as UsersIcon, MapPin, ExternalLink, Calendar, Phone, Search, UserCheck, UserX, DollarSign, CreditCard } from 'lucide-react';
import { Product, Order, SiteSettings, User, Language, Theme } from '../types';
import { storage } from '../services/storage';
import { translations } from '../translations';
import { motion, AnimatePresence } from 'motion/react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  theme: Theme;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, language, theme }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'users' | 'settings'>('orders');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(storage.getSettings());
  const [searchId, setSearchId] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const t = translations[language];
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    category: 'General'
  });

  useEffect(() => {
    if (isOpen) {
      setProducts(storage.getProducts());
      setOrders(storage.getOrders());
      setUsers(storage.getUsers());
      setSettings(storage.getSettings());
    }
  }, [isOpen]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentSettings = storage.getSettings();
    if (loginData.email === currentSettings.adminEmail && loginData.password === currentSettings.adminPassword) {
      setIsAuthenticated(true);
    } else {
      alert(language === 'bn' ? "ভুল ইমেল বা পাসওয়ার্ড" : "Invalid email or password");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.imageUrl) {
      alert(language === 'bn' ? "দয়া করে একটি ছবি আপলোড করুন" : "Please upload an image");
      return;
    }
    
    storage.saveProduct({
      ...newProduct,
      price: Number(newProduct.price),
      createdAt: new Date().toISOString()
    } as any);
    
    setProducts(storage.getProducts());
    setNewProduct({ name: '', description: '', price: '', imageUrl: '', category: 'General' });
    alert(language === 'bn' ? "পণ্য সফলভাবে যোগ করা হয়েছে!" : "Product added successfully!");
  };

  const handleUpdateStatus = (orderId: string, status: Order['status']) => {
    storage.updateOrderStatus(orderId, status);
    setOrders(storage.getOrders());
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm(language === 'bn' ? "আপনি কি নিশ্চিত যে আপনি এই পণ্যটি মুছে ফেলতে চান?" : "Are you sure you want to delete this product?")) {
      storage.deleteProduct(productId);
      setProducts(storage.getProducts());
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storage.updateSettings(settings);
    alert(language === 'bn' ? "সেটিংস সফলভাবে আপডেট করা হয়েছে!" : "Settings updated successfully!");
  };

  const toggleUserRole = (userId: string, currentRole: 'user' | 'admin') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    storage.updateUser(userId, { role: newRole });
    setUsers(storage.getUsers());
  };

  const filteredUsers = users.filter(u => u.customId.includes(searchId));

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[120] flex flex-col transition-colors ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-900 text-white">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-emerald-400" />
          <h2 className="text-xl font-bold">{t.adminPanel}</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X size={24} />
        </button>
      </div>

      {!isAuthenticated ? (
        <div className={`flex-1 flex items-center justify-center p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-8 rounded-3xl shadow-xl w-full max-w-md border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
          >
            <h3 className="text-2xl font-bold mb-6 text-center">{language === 'bn' ? 'অ্যাডমিন অ্যাক্সেস' : 'Admin Access'}</h3>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t.email}</label>
                <input 
                  type="email"
                  required
                  value={loginData.email}
                  onChange={e => setLoginData({...loginData, email: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500' : 'bg-white border-gray-200 focus:border-emerald-500'
                  }`}
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t.password}</label>
                <input 
                  type="password"
                  required
                  value={loginData.password}
                  onChange={e => setLoginData({...loginData, password: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500' : 'bg-white border-gray-200 focus:border-emerald-500'
                  }`}
                  placeholder="••••••••"
                />
              </div>
              <button className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all">
                {t.login}
              </button>
            </form>
          </motion.div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className={`w-64 border-r p-4 flex flex-col gap-2 transition-colors ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'orders' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-gray-500 hover:bg-white/10'}`}
            >
              <ClipboardList size={20} />
              {t.orders}
            </button>
            <button 
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'products' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-gray-500 hover:bg-white/10'}`}
            >
              <Package size={20} />
              {t.products}
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-gray-500 hover:bg-white/10'}`}
            >
              <UsersIcon size={20} />
              {t.profiles}
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'settings' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-gray-500 hover:bg-white/10'}`}
            >
              <Settings size={20} />
              {t.settings}
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8">
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">{t.orders}</h3>
                <div className="grid gap-4">
                  {orders.length === 0 ? (
                    <p className="text-gray-400 italic">No orders yet.</p>
                  ) : orders.map(order => (
                    <div key={order.id} className={`border rounded-2xl p-6 shadow-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-lg">{order.customerName}</h4>
                          <p className="text-gray-500 text-sm">{order.customerPhone} • {order.customerEmail}</p>
                          <p className="text-gray-500 text-sm mt-1">{order.address}</p>
                          {order.location && (
                            <a 
                              href={`https://www.google.com/maps?q=${order.location.lat},${order.location.lng}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold mt-2 hover:underline"
                            >
                              <MapPin size={12} />
                              {language === 'bn' ? 'জিপিএস অবস্থান দেখুন' : 'View GPS Location'}
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <select 
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order.id!, e.target.value as any)}
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider outline-none border-none cursor-pointer ${
                              order.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                              order.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                              order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-gray-100 text-gray-700'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Completed">Completed</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                          <span className="text-[10px] text-gray-400 font-bold">{new Date(order.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className={`border-t border-b py-4 my-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-50'}`}>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm py-1">
                            <span className="text-gray-500">{item.name} x {item.quantity}</span>
                            <span className="font-bold">৳{item.price * item.quantity}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm py-1 text-emerald-600 font-bold">
                          <span>{t.deliveryCharge} ({order.deliveryChargeType === 'upfront' ? t.upfront : t.later})</span>
                          <span>৳{order.deliveryCharge}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black">Total: ৳{order.totalAmount + order.deliveryCharge}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold">{t.addProducts}</h3>
                  <form onSubmit={handleAddProduct} className={`border rounded-2xl p-6 shadow-sm space-y-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{language === 'bn' ? 'পণ্যের নাম' : 'Product Name'}</label>
                      <input 
                        required
                        type="text"
                        value={newProduct.name}
                        onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                        className={`w-full px-4 py-2 rounded-lg border outline-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{language === 'bn' ? 'দাম (৳)' : 'Price (৳)'}</label>
                        <input 
                          required
                          type="number"
                          value={newProduct.price}
                          onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                          className={`w-full px-4 py-2 rounded-lg border outline-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{language === 'bn' ? 'ক্যাটাগরি' : 'Category'}</label>
                        <select 
                          value={newProduct.category}
                          onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                          className={`w-full px-4 py-2 rounded-lg border outline-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                        >
                          <option>General</option>
                          <option>Clothing</option>
                          <option>Food</option>
                          <option>Handicrafts</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{language === 'bn' ? 'পণ্যের ছবি' : 'Product Image'}</label>
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 transition-all overflow-hidden relative ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-emerald-50'}`}
                      >
                        {newProduct.imageUrl ? (
                          <img src={newProduct.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <Upload className="text-gray-400 mb-2" />
                            <span className="text-sm text-gray-400">{language === 'bn' ? 'গ্যালারি থেকে আপলোড করুন' : 'Click to upload from gallery'}</span>
                          </>
                        )}
                        <input 
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          className="hidden"
                          accept="image/*"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{language === 'bn' ? 'বিবরণ' : 'Description'}</label>
                      <textarea 
                        required
                        value={newProduct.description}
                        onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                        className={`w-full px-4 py-2 rounded-lg border outline-none h-24 resize-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                      />
                    </div>
                    <button className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                      <Plus size={20} />
                      {language === 'bn' ? 'পণ্য যোগ করুন' : 'Add Product'}
                    </button>
                  </form>
                </div>

                <div className="space-y-6">
                  <h3 className="text-2xl font-bold">{t.inventory}</h3>
                  <div className="space-y-4">
                    {products.length === 0 ? (
                      <p className="text-gray-400 italic">No products in inventory.</p>
                    ) : products.map(product => (
                      <div key={product.id} className={`border rounded-xl p-4 flex gap-4 items-center shadow-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                        <img src={product.imageUrl} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
                        <div className="flex-1">
                          <h4 className="font-bold">{product.name}</h4>
                          <p className="text-emerald-600 font-bold">৳{product.price}</p>
                        </div>
                        <button 
                          onClick={() => handleDeleteProduct(product.id!)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="text-2xl font-bold">{t.profiles}</h3>
                  <div className="relative max-w-sm w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text"
                      placeholder={t.searchById}
                      value={searchId}
                      onChange={e => setSearchId(e.target.value)}
                      className={`w-full pl-12 pr-4 py-2 rounded-xl border outline-none focus:border-emerald-500 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredUsers.length === 0 ? (
                    <p className="text-gray-400 italic">No users found.</p>
                  ) : filteredUsers.map(user => (
                    <div key={user.id} className={`border rounded-2xl p-6 shadow-sm flex flex-col items-center text-center ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                      <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-emerald-100 mb-4 overflow-hidden">
                        {user.photoUrl ? (
                          <img src={user.photoUrl} alt={user.firstName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-emerald-600 font-black text-2xl">
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                        )}
                      </div>
                      <h4 className="font-bold text-lg">{user.firstName} {user.lastName}</h4>
                      <div className="flex items-center gap-2 mb-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                          {user.role}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400">ID: {user.customId}</span>
                      </div>

                      <div className="space-y-2 w-full text-left mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Mail size={14} />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Phone size={14} />
                          {user.phone || 'No phone'}
                        </div>
                      </div>

                      <button 
                        onClick={() => toggleUserRole(user.id, user.role)}
                        className={`w-full py-2 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                          user.role === 'admin' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        }`}
                      >
                        {user.role === 'admin' ? <UserX size={16} /> : <UserCheck size={16} />}
                        {user.role === 'admin' ? t.makeUser : t.makeAdmin}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="max-w-3xl mx-auto space-y-8">
                <h3 className="text-2xl font-bold">{t.settings}</h3>
                <form onSubmit={handleSaveSettings} className={`border rounded-2xl p-8 shadow-sm space-y-8 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                  
                  {/* Admin Credentials */}
                  <div className="space-y-6">
                    <h4 className="font-bold text-lg flex items-center gap-2 text-emerald-600">
                      <ShieldCheck size={20} />
                      {t.adminCredentials}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{language === 'bn' ? 'অ্যাডমিন ইমেল' : 'Admin Email'}</label>
                        <input 
                          type="email"
                          value={settings.adminEmail}
                          onChange={e => setSettings({...settings, adminEmail: e.target.value})}
                          className={`w-full px-4 py-3 rounded-xl border outline-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{language === 'bn' ? 'অ্যাডমিন পাসওয়ার্ড' : 'Admin Password'}</label>
                        <input 
                          type="text"
                          value={settings.adminPassword}
                          onChange={e => setSettings({...settings, adminPassword: e.target.value})}
                          className={`w-full px-4 py-3 rounded-xl border outline-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Settings */}
                  <div className="space-y-6 pt-8 border-t border-gray-700">
                    <h4 className="font-bold text-lg flex items-center gap-2 text-emerald-600">
                      <DollarSign size={20} />
                      {t.deliverySettings}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t.deliveryCharge} (৳)</label>
                        <input 
                          type="number"
                          value={settings.deliveryCharge}
                          onChange={e => setSettings({...settings, deliveryCharge: Number(e.target.value)})}
                          className={`w-full px-4 py-3 rounded-xl border outline-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t.chargeType}</label>
                        <select 
                          value={settings.deliveryChargeType}
                          onChange={e => setSettings({...settings, deliveryChargeType: e.target.value as any})}
                          className={`w-full px-4 py-3 rounded-xl border outline-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                        >
                          <option value="upfront">{t.upfront}</option>
                          <option value="later">{t.later}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 pt-8 border-t border-gray-700">
                    <h4 className="font-bold text-lg flex items-center gap-2 text-emerald-600">
                      <ImageIcon size={20} />
                      {t.branding}
                    </h4>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{language === 'bn' ? 'ওয়েবসাইট লোগো' : 'Website Logo'}</label>
                      <div 
                        onClick={() => logoInputRef.current?.click()}
                        className={`w-24 h-24 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 transition-all overflow-hidden relative ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-emerald-50'}`}
                      >
                        {settings.logoUrl ? (
                          <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <Upload className="text-gray-400 mb-2" />
                            <span className="text-[10px] text-gray-400">Upload Logo</span>
                          </>
                        )}
                        <input 
                          type="file"
                          ref={logoInputRef}
                          onChange={handleLogoUpload}
                          className="hidden"
                          accept="image/*"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 pt-8 border-t border-gray-700">
                    <h4 className="font-bold text-lg flex items-center gap-2 text-emerald-600">
                      <MessageCircle size={20} />
                      {language === 'bn' ? 'যোগাযোগের তথ্য' : 'Contact Information'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">WhatsApp Number</label>
                        <input 
                          type="text"
                          value={settings.whatsapp}
                          onChange={e => setSettings({...settings, whatsapp: e.target.value})}
                          className={`w-full px-4 py-3 rounded-xl border outline-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Facebook Link</label>
                        <input 
                          type="text"
                          value={settings.facebook}
                          onChange={e => setSettings({...settings, facebook: e.target.value})}
                          className={`w-full px-4 py-3 rounded-xl border outline-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Contact Email</label>
                        <input 
                          type="email"
                          value={settings.email}
                          onChange={e => setSettings({...settings, email: e.target.value})}
                          className={`w-full px-4 py-3 rounded-xl border outline-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 pt-8 border-t border-gray-700">
                    <h4 className="font-bold text-lg flex items-center gap-2 text-emerald-600">
                      <Type size={20} />
                      {t.heroContent}
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Main Title</label>
                        <input 
                          type="text"
                          value={settings.heroTitle}
                          onChange={e => setSettings({...settings, heroTitle: e.target.value})}
                          className={`w-full px-4 py-3 rounded-xl border outline-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Subtitle</label>
                        <textarea 
                          value={settings.heroSubtitle}
                          onChange={e => setSettings({...settings, heroSubtitle: e.target.value})}
                          className={`w-full px-4 py-3 rounded-xl border outline-none h-24 resize-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Shop Button Text</label>
                        <input 
                          type="text"
                          value={settings.shopButtonText}
                          onChange={e => setSettings({...settings, shopButtonText: e.target.value})}
                          className={`w-full px-4 py-3 rounded-xl border outline-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                        />
                      </div>
                    </div>
                  </div>

                  <button className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all">
                    {t.saveChanges}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
