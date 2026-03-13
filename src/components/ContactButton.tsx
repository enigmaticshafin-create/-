import React, { useState, useEffect } from 'react';
import { MessageCircle, Facebook, Mail, Phone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../services/storage';

export const ContactButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const settings = storage.getSettings();

  const contacts = [
    {
      name: 'WhatsApp',
      icon: <MessageCircle size={20} />,
      color: 'bg-green-500',
      link: `https://wa.me/88${settings.whatsapp}`,
    },
    {
      name: 'Facebook',
      icon: <Facebook size={20} />,
      color: 'bg-blue-600',
      link: settings.facebook,
    },
    {
      name: 'Email',
      icon: <Mail size={20} />,
      color: 'bg-red-500',
      link: `mailto:${settings.email}`,
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[80]">
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col gap-3 mb-4 items-end">
            {contacts.map((contact, index) => (
              <motion.a
                key={contact.name}
                href={contact.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-3 px-4 py-2 rounded-full text-white font-bold shadow-lg ${contact.color} hover:scale-105 transition-transform`}
              >
                <span className="text-sm">{contact.name}</span>
                {contact.icon}
              </motion.a>
            ))}
          </div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 ${isOpen ? 'bg-gray-800 rotate-90' : 'bg-emerald-600 hover:scale-110'}`}
      >
        {isOpen ? <X size={28} /> : <Phone size={28} />}
      </button>
    </div>
  );
};
