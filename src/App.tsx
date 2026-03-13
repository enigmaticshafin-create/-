import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { Cart } from './components/Cart';
import { AdminPanel } from './components/AdminPanel';
import { ContactButton } from './components/ContactButton';
import { AuthModal } from './components/AuthModal';
import { Product, CartItem, User, SiteSettings, Language, Theme } from './types';
import { storage } from './services/storage';
import { translations } from './translations';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ArrowRight, X, Download, MessageCircle, MessageSquare, Phone, Mail, Clock } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<SiteSettings>(storage.getSettings());
  const [language, setLanguage] = useState<Language>('bn');
  const [theme, setTheme] = useState<Theme>('light');
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // PWA Install Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  const t = translations[language];

  useEffect(() => {
    // Load initial data
    setProducts(storage.getProducts());
    setSettings(storage.getSettings());
    
    // Check for logged in user in session
    const savedUser = sessionStorage.getItem('mango_market_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    // PWA event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    });
    
    setLoading(false);
  }, [isAdminOpen]);

  // Sync settings periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSettings(storage.getSettings());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Theme effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('bg-gray-950');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('bg-gray-950');
    }
  }, [theme]);

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    sessionStorage.setItem('mango_market_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('mango_market_user');
  };

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallBanner(false);
      }
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Navbar 
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        currentUser={currentUser}
        language={language}
        theme={theme}
        onCartClick={() => setIsCartOpen(true)}
        onAdminClick={() => setIsAdminOpen(true)}
        onAuthClick={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onToggleLanguage={() => setLanguage(l => l === 'en' ? 'bn' : 'en')}
        onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
        onDownloadApp={handleInstallApp}
        showDownload={!!deferredPrompt}
      />

      {/* PWA Install Banner */}
      <AnimatePresence>
        {showInstallBanner && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-md bg-emerald-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Download size={24} />
              <div>
                <p className="font-bold text-sm">{t.downloadApp}</p>
                <p className="text-[10px] opacity-80">{language === 'bn' ? 'আরও ভালো অভিজ্ঞতার জন্য অ্যাপটি ইনস্টল করুন' : 'Install our app for a better experience'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleInstallApp}
                className="bg-white text-emerald-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-emerald-50 transition-all"
              >
                {t.search}
              </button>
              <button onClick={() => setShowInstallBanner(false)} className="p-1 hover:bg-white/10 rounded-full">
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className={`mb-16 relative overflow-hidden rounded-[2rem] p-12 lg:p-20 transition-colors ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-900 text-white'}`}>
          <div className="relative z-10 max-w-2xl">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block bg-emerald-600 text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-6"
            >
              {t.heroBadge}
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl lg:text-7xl font-black leading-[0.9] tracking-tighter mb-8"
            >
              {settings.heroTitle.split(' ').map((word, i) => (
                <React.Fragment key={i}>
                  {word.toLowerCase().includes('swapno') || word.toLowerCase().includes('collection') || word.toLowerCase().includes('market') ? (
                    <span className="text-emerald-500 italic font-serif font-light">{word} </span>
                  ) : (
                    <>{word} </>
                  )}
                  {i === 1 && <br />}
                </React.Fragment>
              ))}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-lg mb-10 max-w-md"
            >
              {settings.heroSubtitle}
            </motion.p>
            <motion.button 
              onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-2xl font-bold hover:bg-emerald-500 hover:text-white transition-all group"
            >
              {settings.shopButtonText}
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
          
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[120px]" />
          </div>
        </section>

        {/* Products Grid */}
        <section id="products">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <ShoppingBag className="text-emerald-600" />
              {t.featuredProducts}
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`animate-pulse rounded-2xl h-[400px] border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className={`text-center py-20 rounded-3xl border border-dashed ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
              <p className="text-gray-400 font-medium">No products available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={addToCart} 
                />
              ))}
            </div>
          )}
        </section>

        {/* Support Section */}
        <section className="mt-24">
          <div className="text-center mb-12">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold mb-4"
            >
              <Clock size={16} />
              {t.support24h}
            </motion.div>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-4">{t.supportSubtitle}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: MessageCircle, label: t.whatsappSupport, color: 'bg-green-500', link: `https://wa.me/${settings.whatsapp}` },
              { icon: MessageSquare, label: t.messengerSupport, color: 'bg-blue-600', link: settings.facebook },
              { icon: Mail, label: t.emailSupport, color: 'bg-red-500', link: `mailto:${settings.email}` },
              { icon: Phone, label: t.callSupport, color: 'bg-emerald-600', link: `tel:${settings.whatsapp}` },
            ].map((option, i) => (
              <motion.a
                key={i}
                href={option.link}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`flex flex-col items-center p-8 rounded-[2rem] border transition-all hover:shadow-xl group ${
                  theme === 'dark' ? 'bg-gray-900 border-gray-800 hover:border-emerald-500' : 'bg-white border-gray-100 hover:border-emerald-500'
                }`}
              >
                <div className={`w-16 h-16 ${option.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <option.icon size={32} />
                </div>
                <span className="font-bold text-lg">{option.label}</span>
                <span className="text-xs text-gray-400 mt-2 uppercase tracking-widest font-bold">Available 24/7</span>
              </motion.a>
            ))}
          </div>
        </section>
      </main>

      <footer className={`border-t py-12 mt-20 transition-colors ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm overflow-hidden">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                'S'
              )}
            </div>
            <span className="font-bold text-lg tracking-tight">{t.shopName}</span>
          </div>
          <p className="text-gray-400 text-sm font-medium">© 2026 {t.shopName}. All rights reserved.</p>
          <div className="flex gap-6 text-gray-400 text-sm font-bold uppercase tracking-widest">
            <a href={settings.facebook} target="_blank" rel="noreferrer" className="hover:text-emerald-600 transition-colors">Facebook</a>
            <a href={`mailto:${settings.email}`} className="hover:text-emerald-600 transition-colors">Email</a>
          </div>
        </div>
      </footer>

      <Cart 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onClear={() => setCartItems([])}
      />

      <AdminPanel 
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        language={language}
        theme={theme}
      />

      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <ContactButton />
    </div>
  );
}
