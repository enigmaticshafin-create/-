import React, { useState, useRef } from 'react';
import { X, User as UserIcon, Mail, Lock, UserPlus, LogIn, Phone, Camera, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../services/storage';
import { User, Language, Theme } from '../types';
import { translations } from '../translations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
  language: Language;
  theme: Theme;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess, language, theme }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    photoUrl: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[language];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      const user = storage.findUserByEmail(formData.email);
      if (user && user.password === formData.password) {
        onAuthSuccess(user);
        onClose();
      } else {
        alert(language === 'bn' ? "ভুল ইমেল বা পাসওয়ার্ড" : "Invalid email or password");
      }
    } else {
      const existing = storage.findUserByEmail(formData.email);
      if (existing) {
        alert(language === 'bn' ? "এই ইমেলটি ইতিমধ্যে নিবন্ধিত" : "Email already registered");
        return;
      }
      
      const newUser = storage.saveUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        photoUrl: formData.photoUrl,
        role: 'user'
      });
      
      onAuthSuccess(newUser);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto transition-colors ${
            theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
          }`}
        >
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black">
                {isLogin ? t.welcome : t.createAccount}
              </h2>
              <button onClick={onClose} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="flex flex-col items-center mb-6">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-24 h-24 rounded-full border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all overflow-hidden relative group ${
                        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'
                      }`}
                    >
                      {formData.photoUrl ? (
                        <img src={formData.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="text-gray-400" size={32} />
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="text-white" size={20} />
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase mt-2">{t.uploadPhoto}</span>
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      className="hidden"
                      accept="image/*"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t.firstName}</label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          required
                          type="text"
                          value={formData.firstName}
                          onChange={e => setFormData({...formData, firstName: e.target.value})}
                          className={`w-full pl-12 pr-4 py-3 rounded-xl border outline-none transition-all ${
                            theme === 'dark' ? 'bg-gray-800 border-gray-700 focus:border-emerald-500' : 'bg-white border-gray-200 focus:border-emerald-500'
                          }`}
                          placeholder="John"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t.lastName}</label>
                      <input 
                        required
                        type="text"
                        value={formData.lastName}
                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                        className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                          theme === 'dark' ? 'bg-gray-800 border-gray-700 focus:border-emerald-500' : 'bg-white border-gray-200 focus:border-emerald-500'
                        }`}
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t.phone}</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border outline-none transition-all ${
                          theme === 'dark' ? 'bg-gray-800 border-gray-700 focus:border-emerald-500' : 'bg-white border-gray-200 focus:border-emerald-500'
                        }`}
                        placeholder="01XXXXXXXXX"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t.email}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    required
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border outline-none transition-all ${
                      theme === 'dark' ? 'bg-gray-800 border-gray-700 focus:border-emerald-500' : 'bg-white border-gray-200 focus:border-emerald-500'
                    }`}
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t.password}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    required
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border outline-none transition-all ${
                      theme === 'dark' ? 'bg-gray-800 border-gray-700 focus:border-emerald-500' : 'bg-white border-gray-200 focus:border-emerald-500'
                    }`}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2">
                {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                {isLogin ? t.login : t.signup}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-500">
                {isLogin ? (language === 'bn' ? "অ্যাকাউন্ট নেই?" : "Don't have an account?") : (language === 'bn' ? "ইতিমধ্যে অ্যাকাউন্ট আছে?" : "Already have an account?")}
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-2 text-emerald-600 font-bold hover:underline"
                >
                  {isLogin ? t.signup : t.login}
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
