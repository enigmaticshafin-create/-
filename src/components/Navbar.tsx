import React, { useState, useEffect } from 'react';
import { ShoppingCart, User as UserIcon, LogOut, ShieldCheck, Moon, Sun, Languages, Download } from 'lucide-react';
import { User, SiteSettings, Language, Theme } from '../types';
import { storage } from '../services/storage';
import { translations } from '../translations';

interface NavbarProps {
  cartCount: number;
  currentUser: User | null;
  language: Language;
  theme: Theme;
  onCartClick: () => void;
  onAdminClick: () => void;
  onAuthClick: () => void;
  onLogout: () => void;
  onToggleLanguage: () => void;
  onToggleTheme: () => void;
  onDownloadApp: () => void;
  showDownload: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  cartCount, 
  currentUser, 
  language,
  theme,
  onCartClick, 
  onAdminClick, 
  onAuthClick,
  onLogout,
  onToggleLanguage,
  onToggleTheme,
  onDownloadApp,
  showDownload
}) => {
  const [logoClicks, setLogoClicks] = useState(0);
  const [settings, setSettings] = useState<SiteSettings>(storage.getSettings());
  const t = translations[language];

  useEffect(() => {
    const interval = setInterval(() => {
      setSettings(storage.getSettings());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleLogoClick = () => {
    const newClicks = logoClicks + 1;
    setLogoClicks(newClicks);
    if (newClicks >= 5) {
      onAdminClick();
      setLogoClicks(0);
    }
  };

  return (
    <nav className={`sticky top-0 z-50 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between transition-colors ${
      theme === 'dark' ? 'bg-gray-900/80 border-gray-800 text-white' : 'bg-white/80 border-gray-100 text-gray-900'
    }`}>
      <div 
        onClick={handleLogoClick}
        className="flex items-center gap-3 cursor-pointer select-none group"
      >
        <div className="relative w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-emerald-200 group-active:scale-95 transition-transform overflow-hidden">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <>
              S
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center border-2 border-emerald-600">
                <span className="text-[10px]">🥭</span>
              </div>
            </>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-black text-xl tracking-tighter leading-none">
            {language === 'bn' ? t.shopName : 'Mango Market'}
          </span>
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
            {language === 'bn' ? 'Mango Market' : 'আমের বাজার'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* PWA Download Button */}
        {showDownload && (
          <button 
            onClick={onDownloadApp}
            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
            title={t.downloadApp}
          >
            <Download size={20} />
          </button>
        )}

        {/* Theme Toggle */}
        <button 
          onClick={onToggleTheme}
          className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Language Toggle */}
        <button 
          onClick={onToggleLanguage}
          className="flex items-center gap-1 p-2 text-gray-400 hover:text-emerald-600 transition-colors font-bold text-xs"
        >
          <Languages size={20} />
          <span className="hidden sm:inline">{language === 'en' ? 'BN' : 'EN'}</span>
        </button>

        {currentUser ? (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <div className="flex items-center gap-2">
                {currentUser.photoUrl && (
                  <img src={currentUser.photoUrl} alt="Profile" className="w-6 h-6 rounded-full object-cover border border-gray-200" />
                )}
                <span className="text-sm font-bold">{currentUser.firstName} {currentUser.lastName}</span>
              </div>
              <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
                {currentUser.customId} • {currentUser.role === 'admin' ? (language === 'bn' ? 'অ্যাডমিন' : 'Admin') : (language === 'bn' ? 'মেম্বার' : 'Member')}
              </span>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title={t.logout}
            >
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <button 
            onClick={onAuthClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
              theme === 'dark' ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <UserIcon size={20} />
            <span className="hidden sm:inline">{t.login}</span>
          </button>
        )}

        <button 
          onClick={onCartClick}
          className="relative p-2 text-gray-600 hover:text-emerald-600 transition-colors"
        >
          <ShoppingCart size={24} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};
