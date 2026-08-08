import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { StepInLogo, SpectrumBar } from './StepInLogo';
import { getUser } from '../lib/session';
import { TranslationKey } from '../translations';
import {
  LayoutDashboardIcon,
  UsersIcon,
  BuildingIcon,
  FileTextIcon,
  GitBranchIcon,
  ShieldCheckIcon,
  ScaleIcon,
  BellIcon,
  SettingsIcon,
  SunIcon,
  MoonIcon,
  ClipboardListIcon,
  GlobeIcon } from
'lucide-react';
import { motion } from 'framer-motion';
export const Layout: React.FC = () => {
  const { language, theme, toggleLanguage, toggleTheme, t } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([
    { id: 1, isRead: false },
    { id: 2, isRead: false },
    { id: 3, isRead: true },
    { id: 4, isRead: true }
  ]);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // The header used to render the `adminName` translation constant, the literal
  // string "Admin" and the literal avatar "A" for every account. Read the real
  // signed-in user instead. getUser() returns null for a missing//malformed
  // session, so every access below has to tolerate that.
  const user = getUser();
  const userName: string = typeof user?.name === 'string' && user.name.trim() ? user.name.trim() : '';
  const userEmail: string = typeof user?.email === 'string' ? user.email : '';
  const displayName = userName || userEmail || '—';
  const userInitial = displayName.charAt(0).toUpperCase();

  // The backend only stores ADMIN / EMPLOYEE / CLIENT. "CLIENT" is surfaced as
  // "Client" everywhere in this UI (see Users.tsx), so keep that wording here.
  const roleLabelKeys: Record<string, TranslationKey> = {
    ADMIN: 'admin',
    EMPLOYEE: 'employee',
    CLIENT: 'client'
  };
  const rawRole = typeof user?.role === 'string' ? user.role : '';
  const roleLabel = roleLabelKeys[rawRole] ? t(roleLabelKeys[rawRole]) : rawRole;

  const menuItems = [
 {
  path: '/admin',
  icon: LayoutDashboardIcon,
  label: 'dashboard'
},
{
  path: '/admin/users',
  icon: UsersIcon,
  label: 'users'
},
{
  path: '/admin/companies',
  icon: BuildingIcon,
  label: 'companies'
},
{
  path: '/admin/requests',
  icon: FileTextIcon,
  label: 'requests'
},
{
  path: '/admin/stages',
  icon: GitBranchIcon,
  label: 'stages'
},
{
  path: '/admin/tasks-licenses',
  icon: ClipboardListIcon,
  label: 'tasksLicenses'
},

{
  path: '/admin/notifications',
  icon: BellIcon,
  label: 'notifications'
},
{
  path: '/admin/settings',
  icon: SettingsIcon,
  label: 'settings'
}] as
  const;
  return (
<div
  dir={language === "ar" ? "rtl" : "ltr"}
  className={`flex h-screen w-full overflow-hidden bg-cream dark:bg-navy-dark transition-colors duration-300 ${
    language === "ar" ? "flex-row-reverse" : "flex-row"
  }`}
>
        {/* Sidebar */}
<aside
  className={`w-64 bg-navy dark:bg-navy-card text-white flex flex-col flex-shrink-0 shadow-xl z-20 transition-colors duration-300 ${
    language === "ar" ? "order-2" : "order-1"
  }`}
>
            {/* Brand §01: reverse lockup on the navy sidebar, with clear space
                around it. The spectrum bar (§02) sits directly beneath as the
                sidebar's identifying rule. */}
            <div className="px-6 py-7">
              <StepInLogo size="md" inverse />
            </div>
            <SpectrumBar />

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-navy-light dark:bg-navy text-gold' : 'text-gray-300 hover:bg-navy-light/50 dark:hover:bg-navy-light/30 hover:text-white'}`}>
                
                <Icon size={20} className={isActive ? 'text-gold' : ''} />
<span className="font-medium text-sm">
  {t(item.label as TranslationKey)}
</span>
                {isActive &&
                <motion.div
                  layoutId="sidebar-active"
                  className={`absolute w-1 h-8 bg-gold rounded-full ${language === 'ar' ? 'right-0' : 'left-0'}`}
                  initial={false}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30
                  }} />

                }
              </NavLink>);

          })}
        </nav>
      </aside> 

      {/* Main Content */}
<div
  className={`flex-1 flex flex-col min-w-0 overflow-hidden ${
    language === "ar" ? "order-1" : "order-2"
  }`}
>
          {/* Top Navbar */}
        {/* The header used to carry a global search box. It was decorative —
            no value/onChange, no global search index, and nothing consumed it.
            There is no cross-entity search endpoint to wire it to, and making it
            filter "the current page" would require every page to subscribe to a
            shared search context (including pages outside this change). Rather
            than ship a control that looks functional and is not, it is removed;
            Users, Requests and Companies each have their own working search. */}
        <header className="h-20 bg-white dark:bg-navy-card shadow-sm flex items-center justify-end px-8 z-10 transition-colors duration-300">
          <div className="flex items-center gap-6">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 text-sm font-medium text-navy dark:text-cream-dark hover:text-gold dark:hover:text-gold transition-colors">
              
              <GlobeIcon size={18} />
              {language === 'en' ? 'العربية' : 'English'}
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-cream dark:hover:bg-navy-dark text-navy dark:text-cream-dark transition-colors">
              
              {theme === 'light' ?
              <MoonIcon size={20} /> :

              <SunIcon size={20} />
              }
            </button>

            <button
              onClick={() => {
                navigate('/admin/notifications');
                setNotifications(notifications.map(n => ({ ...n, isRead: true })));
              }}
              className="relative p-2 rounded-full hover:bg-cream dark:hover:bg-navy-dark text-navy dark:text-cream-dark transition-colors">
              <BellIcon size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-navy-card animate-pulse"></span>
              )}
            </button>

            <div className="h-8 w-px bg-gray-200 dark:bg-navy-light mx-2"></div>

            <div className="flex items-center gap-3">
              <div className={language === "ar" ? "text-right" : "text-left"}>
                <p className="text-sm font-semibold text-navy dark:text-cream-dark">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {roleLabel}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold border border-gold/30">
                {userInitial}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>);

};