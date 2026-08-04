import React from 'react';
import { Phone, Mail, Linkedin, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith('ar');

  return (
    <footer className="bg-[#1E2C68] text-gray-300 pt-16 pb-8 border-t border-gray-800">
      <div className="section-shell">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
<div className={isArabic ? "text-right" : "text-left"}>
              <img
              src="/StepInLogo.png"
              alt="StepIn"
              className="h-16 w-auto object-contain mb-6 brightness-0 invert" />
<p
  dir="ltr"
  className="text-sm leading-relaxed mb-6 text-left"
>
{t('footer.description')}
</p>
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
                  href="#services"
                  className="hover:text-brand-gold transition-colors duration-200">
                  {t('footer.services')}
                </a>
              </li>
              <li>
                               <a

                  href="#how-it-works"

                  className="hover:text-brand-gold transition-colors duration-200">

                  {t('footer.howItWorks')}

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
<span dir="ltr" className="text-left">
  +966 50 123 4567
</span>
              </li>
<li className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-brand-gold mt-1 flex-shrink-0" />
                <span>info@stepin.sa</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-gold mt-1 flex-shrink-0" />
                <span>Riyadh, Saudi Arabia</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">
<p className="text-sm">
  © {new Date().getFullYear()} STEPIN. All rights reserved.
</p>
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