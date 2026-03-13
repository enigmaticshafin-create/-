import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus, CheckCircle2, MapPin, Phone, Navigation, DollarSign } from 'lucide-react';
import { CartItem, SiteSettings, Language, Theme } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../services/storage';
import { translations } from '../translations';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  language: Language;
  theme: Theme;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

export const Cart: React.FC<CartProps> = ({ isOpen, onClose, items, language, theme, onUpdateQuantity, onRemove, onClear }) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1);
  const [settings, setSettings] = useState<SiteSettings>(storage.getSettings());
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    location: null as { lat: number, lng: number } | null
  });
  const [isLocating, setIsLocating] = useState(false);

  const t = translations[language];

  useEffect(() => {
    if (isOpen) {
      setSettings(storage.getSettings());
    }
  }, [isOpen]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + settings.deliveryCharge;

  const handleGetLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          });
          setIsLocating(false);
          alert(t.locationCaptured);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLocating(false);
          alert(language === 'bn' ? "অবস্থান পাওয়া যায়নি। দয়া করে ম্যানুয়ালি ঠিকানা লিখুন।" : "Could not get location. Please enter address manually.");
        }
      );
    } else {
      alert(language === 'bn' ? "আপনার ব্রাউজার জিওলোকেশন সাপোর্ট করে না।" : "Geolocation is not supported by your browser.");
      setIsLocating(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    try {
      storage.saveOrder({
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        address: formData.address,
        location: formData.location ? { lat: formData.location.lat, lng: formData.location.lng } : undefined,
        items: items.map(item => ({
          productId: item.id!,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount: subtotal,
        deliveryCharge: settings.deliveryCharge,
        deliveryChargeType: settings.deliveryChargeType,
        status: 'Pending',
        createdAt: new Date().toISOString()
      });

      setOrderComplete(true);
      onClear();
      setTimeout(() => {
        setOrderComplete(false);
        setIsCheckingOut(false);
        setCheckoutStep(1);
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Checkout error:", error);
      alert(language === 'bn' ? "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।" : "Something went wrong. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex justify-end">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`relative w-full max-w-md h-full shadow-2xl flex flex-col transition-colors ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
        >
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-900 text-white">
            <div className="flex items-center gap-3">
              <ShoppingBag className="text-emerald-400" />
              <h2 className="text-xl font-bold">{t.cart}</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {orderComplete ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-2xl font-bold mb-2">{t.orderPlaced}</h3>
                <p className="text-gray-500">{t.thanks}</p>
              </div>
            ) : isCheckingOut ? (
              <div className="space-y-8">
                <div className="flex justify-between items-center mb-8">
                  <button 
                    onClick={() => setIsCheckingOut(false)}
                    className="text-emerald-600 font-bold text-sm hover:underline"
                  >
                    ← {language === 'bn' ? 'কার্টে ফিরে যান' : 'Back to Cart'}
                  </button>
                  <div className="flex gap-2">
                    {[1, 2, 3].map(step => (
                      <div 
                        key={step} 
                        className={`w-2 h-2 rounded-full ${checkoutStep >= step ? 'bg-emerald-600' : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                </div>

                <form onSubmit={handleCheckout} className="space-y-6">
                  {checkoutStep === 1 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                      <h3 className="text-xl font-bold">{t.step1}</h3>
                      <p className="text-sm text-gray-500">{language === 'bn' ? 'আপনার ডেলিভারি লোকেশন দিন।' : 'Please provide your delivery location.'}</p>
                      
                      <button 
                        type="button"
                        onClick={handleGetLocation}
                        disabled={isLocating}
                        className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold border-2 border-dashed transition-all ${
                          theme === 'dark' ? 'bg-gray-800 border-gray-700 text-emerald-400 hover:bg-gray-700' : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        <MapPin size={20} />
                        {isLocating ? t.locating : formData.location ? t.locationCaptured : t.shareLocation}
                      </button>

                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t.address}</label>
                        <textarea 
                          required
                          value={formData.address}
                          onChange={e => setFormData({...formData, address: e.target.value})}
                          className={`w-full px-4 py-3 rounded-xl border outline-none h-24 resize-none ${
                            theme === 'dark' ? 'bg-gray-800 border-gray-700 focus:border-emerald-500' : 'bg-white border-gray-200 focus:border-emerald-500'
                          }`}
                          placeholder="House, Street, Area..."
                        />
                      </div>

                      <button 
                        type="button"
                        onClick={() => setCheckoutStep(2)}
                        className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all"
                      >
                        {t.next}
                      </button>
                    </motion.div>
                  )}

                  {checkoutStep === 2 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                      <h3 className="text-xl font-bold">{t.step2}</h3>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t.fullName}</label>
                        <input 
                          required
                          type="text"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          className={`w-full px-4 py-3 rounded-xl border outline-none ${
                            theme === 'dark' ? 'bg-gray-800 border-gray-700 focus:border-emerald-500' : 'bg-white border-gray-200 focus:border-emerald-500'
                          }`}
                          placeholder="John Doe"
                        />
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
                            className={`w-full pl-12 pr-4 py-3 rounded-xl border outline-none ${
                              theme === 'dark' ? 'bg-gray-800 border-gray-700 focus:border-emerald-500' : 'bg-white border-gray-200 focus:border-emerald-500'
                            }`}
                            placeholder="01XXXXXXXXX"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t.email}</label>
                        <input 
                          required
                          type="email"
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          className={`w-full px-4 py-3 rounded-xl border outline-none ${
                            theme === 'dark' ? 'bg-gray-800 border-gray-700 focus:border-emerald-500' : 'bg-white border-gray-200 focus:border-emerald-500'
                          }`}
                          placeholder="name@example.com"
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={() => setCheckoutStep(3)}
                        className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all"
                      >
                        {t.next}
                      </button>
                    </motion.div>
                  )}

                  {checkoutStep === 3 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                      <h3 className="text-xl font-bold">{t.step3}</h3>
                      <div className={`p-4 rounded-2xl space-y-3 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">{t.fullName}:</span>
                          <span className="font-bold">{formData.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">{t.phone}:</span>
                          <span className="font-bold">{formData.phone}</span>
                        </div>
                        <div className="flex flex-col text-sm gap-1">
                          <span className="text-gray-500">{t.address}:</span>
                          <span className="font-bold">{formData.address}</span>
                        </div>
                        {formData.location && (
                          <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
                            <Navigation size={14} />
                            {t.locationCaptured}
                          </div>
                        )}
                      </div>
                      <div className={`border-t pt-4 ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
                        <div className="space-y-2 mb-6">
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>Subtotal:</span>
                            <span>৳{subtotal}</span>
                          </div>
                          <div className="flex justify-between text-sm text-emerald-600 font-bold">
                            <span>{t.deliveryCharge} ({settings.deliveryChargeType === 'upfront' ? t.upfront : t.later}):</span>
                            <span>৳{settings.deliveryCharge}</span>
                          </div>
                          <div className="flex justify-between text-lg font-black pt-2 border-t border-dashed border-gray-200">
                            <span>{t.total}:</span>
                            <span>৳{total}</span>
                          </div>
                        </div>
                        <button 
                          type="submit"
                          className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all"
                        >
                          {t.placeOrder}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </form>
              </div>
            ) : items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <ShoppingBag size={64} className="mb-4" />
                <p className="text-lg font-bold">{t.emptyCart}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.id} className={`flex gap-4 p-4 rounded-2xl border shadow-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <img src={item.imageUrl} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />
                    <div className="flex-1">
                      <h4 className="font-bold">{item.name}</h4>
                      <p className="text-emerald-600 font-bold mb-2">৳{item.price}</p>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => onUpdateQuantity(item.id!, -1)}
                          className={`p-1 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="font-bold w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.id!, 1)}
                          className={`p-1 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    <button 
                      onClick={() => onRemove(item.id!)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!isCheckingOut && !orderComplete && items.length > 0 && (
            <div className={`p-6 border-t transition-colors ${theme === 'dark' ? 'bg-gray-950 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal:</span>
                  <span>৳{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm text-emerald-600 font-bold">
                  <span>{t.deliveryCharge}:</span>
                  <span>৳{settings.deliveryCharge}</span>
                </div>
                <div className="flex justify-between text-xl font-black pt-2 border-t border-dashed border-gray-200">
                  <span>{t.total}:</span>
                  <span>৳{total}</span>
                </div>
              </div>
              <button 
                onClick={() => setIsCheckingOut(true)}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
              >
                {t.checkout}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
