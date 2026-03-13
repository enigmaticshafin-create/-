import React from 'react';
import { Plus } from 'lucide-react';
import { Product, Language, Theme } from '../types';
import { motion } from 'motion/react';
import { translations } from '../translations';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  language: Language;
  theme: Theme;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, language, theme }) => {
  const t = translations[language];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group rounded-2xl border overflow-hidden hover:shadow-xl transition-all duration-300 ${
        theme === 'dark' ? 'bg-gray-900 border-gray-800 hover:shadow-emerald-900/20' : 'bg-white border-gray-100 hover:shadow-gray-200/50'
      }`}
    >
      <div className="aspect-square overflow-hidden relative">
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3">
          <span className={`backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border ${
            theme === 'dark' ? 'bg-gray-900/90 text-emerald-400 border-emerald-900' : 'bg-white/90 text-emerald-700 border-emerald-100'
          }`}>
            {product.category}
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className={`font-bold text-lg mb-1 group-hover:text-emerald-600 transition-colors ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          {product.name}
        </h3>
        <p className={`text-sm line-clamp-2 mb-4 h-10 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
              {language === 'bn' ? 'দাম' : 'Price'}
            </span>
            <span className={`text-xl font-black ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>৳{product.price}</span>
          </div>
          
          <button 
            onClick={() => onAddToCart(product)}
            className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 hover:scale-110 active:scale-95 transition-all shadow-lg shadow-emerald-200"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
