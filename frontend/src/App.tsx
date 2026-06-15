import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useTranslation } from '../node_modules/react-i18next';
import VerifyOTP from "./pages/VerifyOTP";
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';

import CompanyDashboard from './pages/CompanyDashboard';
import CompanyProfile from './pages/CompanyProfile';
import TaskDetails from './pages/TaskDetails';
import CompanyNotifications from "./pages/CompanyNotifications.tsx";
import CompanyLicenses from "./pages/CompanyLicenses.tsx";

import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeRequests from './pages/employee/EmployeeRequests';
import RequestDetails from './pages/employee/RequestDetails.tsx';
import DocumentsReview from './pages/employee/DocumentsReview';
import EmployeeNotifications from './pages/employee/EmployeeNotifications';

import ProtectedRoute from "./components/ProtectedRoute";

import { AppProvider } from './context/AppContext';

{/* Admin Dashboard */}
import { Dashboard } from './pages/Dashboard'
import { Users } from './pages/Users'
import { Companies } from './pages/Companies'
import { Requests } from './pages/Requests'
import { Stages } from './pages/Stages'
import { TasksLicenses } from './pages/TasksLicenses'
import { MarketRules } from './pages/MarketRules'
import { Notifications } from './pages/Notifications'
import { Settings } from './pages/Settings'
import { Layout } from './components/Layout'

function AppContent() {

  const { i18n } = useTranslation();

  const location = useLocation();

 const hideNavbar =
  location.pathname === "/login" ||
  location.pathname === "/company-dashboard" ||
  location.pathname === "/company-profile" ||
  location.pathname === "/company-notifications" || 
  location.pathname === "/company-licenses" ||      
  location.pathname.includes("/company-task") ||
  location.pathname.startsWith("/employee") ||
  location.pathname.startsWith("/admin");

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
<Route
path="/verify-otp"
element={<VerifyOTP />}
/>
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

<Route
  path="/company-licenses"
  element={
    <ProtectedRoute allowedRole="CLIENT">
      <CompanyLicenses />
    </ProtectedRoute>
  }
/>

<Route
  path="/company-notifications"
  element={
    <ProtectedRoute allowedRole="CLIENT">
      <CompanyNotifications />
    </ProtectedRoute>
  }
/>

          {/* Task Details */}
          <Route
            path="/company-task/:id"
            element={
              <ProtectedRoute allowedRole="CLIENT">
                <TaskDetails />
              </ProtectedRoute>
            }
          />

          {/* ── EMPLOYEE MODULE ─────────────────────── */}
          <Route
            path="/employee-dashboard"
            element={
              <ProtectedRoute allowedRole={["EMPLOYEE", "ADMIN"]}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee-requests"
            element={
              <ProtectedRoute allowedRole={["EMPLOYEE", "ADMIN"]}>
                <EmployeeRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee-requests/:id"
            element={
              <ProtectedRoute allowedRole={["EMPLOYEE", "ADMIN"]}>
                <RequestDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee-documents"
            element={
              <ProtectedRoute allowedRole={["EMPLOYEE", "ADMIN"]}>
                <DocumentsReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee-notifications"
            element={
              <ProtectedRoute allowedRole={["EMPLOYEE", "ADMIN"]}>
                <EmployeeNotifications />
              </ProtectedRoute>
            }
          />

            {/* ── ADMIN DASHBOARD ─── */}
<Route path="/admin" element={<Layout />}>
  <Route index element={<Dashboard />} />
  <Route path="users" element={<Users />} />
  <Route path="companies" element={<Companies />} />
  <Route path="requests" element={<Requests />} />

  <Route
    path="requests/:id"
    element={<RequestDetails />}
  />

  <Route path="stages" element={<Stages />} />
<Route path="tasks-licenses" element={<TasksLicenses />} />
  <Route path="market-rules" element={<MarketRules />} />
  <Route path="notifications" element={<Notifications />} />
  <Route path="settings" element={<Settings />} />
</Route>

        </Routes>

      </main>

      {/* Footer */}
{
  location.pathname !== "/login" &&
  location.pathname !== "/company-dashboard" &&
  location.pathname !== "/company-profile" &&
  location.pathname !== "/company-notifications" &&
  location.pathname !== "/company-licenses" &&
  !location.pathname.includes("/company-task") &&
  !location.pathname.startsWith("/employee") &&
  !location.pathname.startsWith("/admin") &&
  <Footer />
}

    </div>

  );
}

export function App() {

  return (
    <AppProvider>
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
    </AppProvider>
  );

}