import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
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
  SearchIcon,
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
            <div className="p-6 flex items-center gap-3">
  <img
    src="/StepInLogo.png"
    alt="StepIn"
  className="w-12 h-12 object-contain brightness-0 invert"
  />

<span className="text-xl font-bold tracking-wide text-white">
    StepIn
  </span>

</div>

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
        <header className="h-20 bg-white dark:bg-navy-card shadow-sm flex items-center justify-between px-8 z-10 transition-colors duration-300">
          <div className="flex items-center bg-cream dark:bg-navy-dark rounded-xl px-4 py-2.5 w-96 border border-transparent focus-within:border-gold/50 transition-colors">
            <SearchIcon size={18} className="text-gray-400" />
<input
  type="text"
  placeholder={t("searchPlaceholder")}
  className={`bg-transparent border-none outline-none px-3 w-full text-sm text-navy dark:text-cream-dark placeholder-gray-400 ${
    language === "ar" ? "text-right" : "text-left"
  }`}
/>
            
          </div>

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
                  {t('adminName')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Admin
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold border border-gold/30">
                A
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