import React from 'react';
import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type LanguageSwitcherProps = {
  compact?: boolean;
};

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
const currentLanguage =
  i18n.language?.startsWith('ar') ? 'ar' : 'en';

  const toggleLanguage = () => {
    i18n.changeLanguage(currentLanguage === 'ar' ? 'en' : 'ar');
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={t('common.switchLanguage')}
      className={`inline-flex items-center justify-center gap-2 rounded-full border border-brand-navy/15 bg-white px-3 py-2 text-button text-brand-navy transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-gold hover:text-brand-gold hover:shadow-md ${compact ? 'w-full' : ''}`}>
      <Languages className="h-4 w-4" />
      <span>{currentLanguage === 'ar' ? t('common.english') : t('common.arabic')}</span>
    </button>);
}