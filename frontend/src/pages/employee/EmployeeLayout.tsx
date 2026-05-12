import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, ClipboardList, Bell, LogOut
} from 'lucide-react';

interface EmployeeLayoutProps {
  children: React.ReactNode;
}

export default function EmployeeLayout({ children }: EmployeeLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { icon: <LayoutDashboard className="w-4 h-4" />, label: 'لوحة التحكم', to: '/employee-dashboard' },
    { icon: <ClipboardList className="w-4 h-4" />, label: 'قائمة الطلبات', to: '/employee-requests' },
    { icon: <FileText className="w-4 h-4" />, label: 'مراجعة المستندات', to: '/employee-documents' },
    { icon: <Bell className="w-4 h-4" />, label: 'الإشعارات', to: '/employee-notifications' },
  ];

  return (
    <div className="min-h-screen bg-brand-cream flex" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-navy flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-white/10">
          <img src="/Screenshot_2026-04-22_142843.png" alt="Logo" className="h-10 w-auto mb-3" />
          <p className="text-white font-bold text-sm">{user?.name}</p>
          <p className="text-white/50 text-xs">موظف المنصة</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => {
            const active = location.pathname === item.to ||
              (item.to === '/employee-requests' && location.pathname.startsWith('/employee-requests/'));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-brand-gold text-brand-navy'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/10 hover:text-white text-sm w-full transition-all"
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 mr-64 p-8">
        {children}
      </main>
    </div>
  );
}
