import React from 'react';
import { Phone, Mail, Linkedin, MapPin } from 'lucide-react';
import { useTranslation } from '../../node_modules/react-i18next';

export function Footer() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith('ar');

  return (
    <footer className="bg-[#152844] text-gray-300 pt-16 pb-8 border-t border-gray-800">
      <div className="section-shell">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <img
              src="/Screenshot_2026-04-22_142843.png"
              alt={t('common.brand')}
              className="h-16 w-auto object-contain mb-6 brightness-0 invert" />
            <p className="text-sm leading-relaxed mb-6">
              {t('footer.description')}
            </p>
            <div className={`flex ${isArabic ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-gold hover:text-brand-navy transition-colors duration-300">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white text-lg font-bold mb-6 relative inline-block">
              {t('footer.quickLinks')}
              <span className="absolute bottom-0 right-0 w-1/2 h-0.5 bg-brand-gold -mb-2"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#home"
                  className="hover:text-brand-gold transition-colors duration-200">
                  {t('footer.home')}
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="hover:text-brand-gold transition-colors duration-200">
                  {t('footer.about')}
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="hover:text-brand-gold transition-colors duration-200">
                  {t('footer.howItWorks')}
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="hover:text-brand-gold transition-colors duration-200">
                  {t('footer.services')}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white text-lg font-bold mb-6 relative inline-block">
              {t('footer.services')}
              <span className="absolute bottom-0 right-0 w-1/2 h-0.5 bg-brand-gold -mb-2"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="hover:text-brand-gold transition-colors duration-200">
                  {t('footer.serviceLinks.companyFormation')}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-brand-gold transition-colors duration-200">
                  {t('footer.serviceLinks.licenses')}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-brand-gold transition-colors duration-200">
                  {t('footer.serviceLinks.support')}
                </a>
              </li>
            </ul>
          </div>

          <div id="contact">
            <h3 className="text-white text-lg font-bold mb-6 relative inline-block">
              {t('footer.contact')}
              <span className="absolute bottom-0 right-0 w-1/2 h-0.5 bg-brand-gold -mb-2"></span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-brand-gold mt-1 flex-shrink-0" />
                <span dir="ltr" className="text-right w-full">
                  050 000 0000
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-brand-gold mt-1 flex-shrink-0" />
                <span>softlanding@gmail.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-gold mt-1 flex-shrink-0" />
                <span>{t('footer.address')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">
            {t('footer.rights', { year: new Date().getFullYear() })}
          </p>
          <div className="flex gap-4 text-sm">
            <a href="#" className="hover:text-white transition-colors">
              {t('footer.privacy')}
            </a>
            <a href="#" className="hover:text-white transition-colors">
              {t('footer.terms')}
            </a>
          </div>
        </div>
      </div>
    </footer>);

}