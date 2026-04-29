import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useTranslation } from '../node_modules/react-i18next';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import CompanyDashboard from './pages/CompanyDashboard';
import CompanyProfile from './pages/CompanyProfile';

import ProtectedRoute from "./components/ProtectedRoute";

function AppContent() {

  const { i18n } = useTranslation();

  const location = useLocation();

  const hideNavbar =
    location.pathname === '/login' ||
    location.pathname === '/company-dashboard' ||
    location.pathname === '/company-profile';

  const currentLanguage =
    i18n.language.startsWith('ar') ? 'ar' : 'en';

  React.useEffect(() => {

    const html = document.documentElement;

    html.lang = currentLanguage;

    html.dir =
      currentLanguage === 'ar'
        ? 'rtl'
        : 'ltr';

  }, [currentLanguage]);

  return (

    <div
      dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-brand-cream selection:bg-brand-gold selection:text-brand-navy"
    >

      {/* Navbar */}
      {!hideNavbar && <Navbar />}

      {/* Pages */}
      <main className="overflow-x-hidden">

        <Routes>

          {/* Home */}
          <Route
            path="/"
            element={<HomePage />}
          />

          {/* Login */}
          <Route
            path="/login"
            element={<LoginPage />}
          />

          {/* Dashboard */}
          <Route
            path="/company-dashboard"
            element={
              <ProtectedRoute allowedRole="CLIENT">
                <CompanyDashboard />
              </ProtectedRoute>
            }
          />

          {/* Company Profile */}
          <Route
            path="/company-profile"
            element={
              <ProtectedRoute allowedRole="CLIENT">
                <CompanyProfile />
              </ProtectedRoute>
            }
          />

        </Routes>

      </main>

      {/* Footer */}
      {location.pathname !== '/login' && <Footer />}

    </div>

  );
}

export function App() {

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );

}