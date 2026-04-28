import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useTranslation } from '../node_modules/react-i18next';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import CompanyDashboard from './pages/CompanyDashboard';
import ProtectedRoute from "./components/ProtectedRoute";


function AppContent() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login';
  const currentLanguage = i18n.language.startsWith('ar') ? 'ar' : 'en';

  React.useEffect(() => {
    const html = document.documentElement;
    html.lang = currentLanguage;
    html.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
  }, [currentLanguage]);

  return (
    <div
      dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-brand-cream selection:bg-brand-gold selection:text-brand-navy">
      {!isAuthPage && <Navbar />}
      <main className="overflow-x-hidden">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
  path="/company-dashboard"
  element={
    <ProtectedRoute allowedRole="CLIENT">
      <CompanyDashboard />
    </ProtectedRoute>
  }

/>

        </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </div>);

}
export function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>);

}