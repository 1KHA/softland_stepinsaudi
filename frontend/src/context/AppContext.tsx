import React, { useEffect, useState, createContext, useContext } from 'react';
import { translations, TranslationKey } from '../translations';
type Language = 'en' | 'ar';
type Theme = 'light' | 'dark';
interface AppContextType {
  language: Language;
  theme: Theme;
  toggleLanguage: () => void;
  toggleTheme: () => void;
  t: (key: TranslationKey) => string;
}
const AppContext = createContext<AppContextType | undefined>(undefined);
export const AppProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
const [language, setLanguage] = useState<Language>(() => {
  const saved = localStorage.getItem("language");
  return saved === "ar" ? "ar" : "en";
});

const [theme, setTheme] = useState<Theme>('light');
useEffect(() => {
  const root = document.documentElement;

  root.dir = language === "ar" ? "rtl" : "ltr";
  root.lang = language;
  root.className = `${language === "ar" ? "rtl" : "ltr"} ${theme}`;

  localStorage.setItem("language", language);
}, [language, theme]);
const toggleLanguage = () => {
  setLanguage((prev) => {
    const newLanguage = prev === "en" ? "ar" : "en";
    localStorage.setItem("language", newLanguage);
    return newLanguage;
  });
};
  const toggleTheme = () =>
  setTheme((prev) => prev === 'light' ? 'dark' : 'light');
  const t = (key: TranslationKey) => {
    return translations[language][key] || key;
  };
  return (
    <AppContext.Provider
      value={{
        language,
        theme,
        toggleLanguage,
        toggleTheme,
        t
      }}>
      
      {children}
    </AppContext.Provider>);

};
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};