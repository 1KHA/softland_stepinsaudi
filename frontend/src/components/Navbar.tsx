import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../node_modules/react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Navbar() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const isArabic = i18n.language.startsWith('ar');
  const navLinks = [
    { name: t('nav.home'), href: '#home' },
    { name: t('nav.about'), href: '#about' },
    { name: t('nav.services'), href: '#services' },
    { name: t('nav.howItWorks'), href: '#how-it-works' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-brand-navy/10 bg-white/90 backdrop-blur-lg">
      <div className="section-shell">
        <div className="flex justify-between items-center h-20">
          <div className="flex shrink-0 items-center gap-3">
            <a href="#home">
              <img
                src="/StepInLogo.png"
                alt="StepIn"
                className="h-12 w-auto object-contain" />
            </a>
            <div className="hidden md:block">
            <h3 className="text-[#1E3A5F] font-bold text-lg">
              StepIn
            </h3>       
       <p className="text-xs text-slate-500">Saudi market entry, simplified</p>
            </div>
          </div>

          <div className={`hidden md:flex items-center ${isArabic ? 'space-x-reverse space-x-8' : 'space-x-8'}`}>
            {navLinks.map((link) =>
            <a
              key={link.name}
              href={link.href}
              className="text-brand-navy/80 hover:text-brand-gold font-medium transition-colors duration-200">
                {link.name}
              </a>
            )}
          </div>

          <div className={`hidden md:flex items-center ${isArabic ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
            <LanguageSwitcher />
            <Link
              to="/login"
              className="primary-button bg-brand-gold text-brand-navy hover:bg-yellow-500 hover:text-brand-navy">
              {t('nav.login')}
            </Link>
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-brand-navy hover:text-brand-gold focus:outline-none">
              
              {isOpen ?
              <X className="h-6 w-6" /> :

              <Menu className="h-6 w-6" />
              }
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen &&
        <motion.div
          initial={{
            opacity: 0,
            height: 0
          }}
          animate={{
            opacity: 1,
            height: 'auto'
          }}
          exit={{
            opacity: 0,
            height: 0
          }}
          className="md:hidden border-t border-gray-100 bg-white">
            <div className="space-y-3 px-4 pt-3 pb-6 shadow-lg">
              <LanguageSwitcher compact />
              {navLinks.map((link) =>
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block rounded-xl px-3 py-3 text-base font-medium text-brand-navy hover:bg-gray-50 hover:text-brand-gold">
                  {link.name}
                </a>
            )}
              <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center mt-2 rounded-full bg-brand-gold px-6 py-3 font-semibold text-brand-navy transition-colors duration-200 hover:bg-yellow-500">
                {t('nav.login')}
              </Link>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </nav>);

}