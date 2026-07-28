import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../node_modules/react-i18next';
import { Footer } from '../../components/Footer';
import axios from 'axios';
import {
  Bell, ArrowLeft, ArrowRight, CheckCheck, Check,
  CheckCircle, XCircle, AlertCircle, RefreshCw, ClipboardList
} from 'lucide-react';

import { API_URL } from "../../config";
const API = `${API_URL}`;
type TabType = 'all' | 'unread' | 'REQUEST_APPROVED' | 'REQUEST_REJECTED' | 'RESUBMISSION_REQUESTED';

interface Notification {
  id: number; message: string; type: string; is_read: number;
  created_at: string; company_name: string; related_company_id: number;
}

const getNotificationIcon = (type: string) => {
  if (type === 'REQUEST_APPROVED')       return <CheckCircle className="w-5 h-5 text-green-600" />;
  if (type === 'REQUEST_REJECTED')       return <XCircle className="w-5 h-5 text-red-600" />;
  if (type === 'RESUBMISSION_REQUESTED') return <AlertCircle className="w-5 h-5 text-orange-600" />;
  return <Bell className="w-5 h-5 text-gray-500" />;
};

const getNotificationBg = (type: string) => {
  if (type === 'REQUEST_APPROVED')       return 'bg-green-50';
  if (type === 'REQUEST_REJECTED')       return 'bg-red-50';
  if (type === 'RESUBMISSION_REQUESTED') return 'bg-orange-50';
  return 'bg-gray-50';
};

export default function EmployeeNotifications() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith('ar');
  const dir = isArabic ? 'rtl' : 'ltr';

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const headers = { Authorization: `Bearer ${token}` };

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/employee/notifications`, { headers });
      setNotifications(res.data.notifications);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const markRead = async (id: number) => {
    try {
      await axios.put(`${API}/employee/notifications/${id}/read`, {}, { headers });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await axios.put(`${API}/employee/notifications/read-all`, {}, { headers });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const displayed = useMemo(() => {
    if (activeTab === 'all')    return notifications;
    if (activeTab === 'unread') return notifications.filter(n => !n.is_read);
    return notifications.filter(n => n.type === activeTab);
  }, [notifications, activeTab]);

  const countFor = (key: string) => {
    if (key === 'all')    return notifications.length;
    if (key === 'unread') return unreadCount;
    return notifications.filter(n => n.type === key).length;
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all',                    label: `${t('employee.notifications.tabs.all')} (${countFor('all')})` },
    { key: 'unread',                 label: `${t('employee.notifications.tabs.unread')} (${countFor('unread')})` },
    { key: 'REQUEST_APPROVED',       label: `${t('employee.notifications.tabs.approved')} (${countFor('REQUEST_APPROVED')})` },
    { key: 'REQUEST_REJECTED',       label: `${t('employee.notifications.tabs.rejected')} (${countFor('REQUEST_REJECTED')})` },
    { key: 'RESUBMISSION_REQUESTED', label: `${t('employee.notifications.tabs.resubmit')} (${countFor('RESUBMISSION_REQUESTED')})` },
  ];

  const typeLabel = (type: string) => {
    const map: Record<string, string> = {
      REQUEST_APPROVED:       t('employee.notifications.types.REQUEST_APPROVED'),
      REQUEST_REJECTED:       t('employee.notifications.types.REQUEST_REJECTED'),
      RESUBMISSION_REQUESTED: t('employee.notifications.types.RESUBMISSION_REQUESTED'),
      INFO:                   t('employee.notifications.types.INFO'),
    };
    return map[type] || type;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const ArrowBack = isArabic ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-[#F7F3EE]" dir={dir}>

      {/* ── HEADER ── */}
      <div className="bg-white shadow-sm px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="/Screenshot_2026-04-22_142843.png" alt="Logo" className="h-10 w-auto object-contain" />
          <div className={`${isArabic ? 'border-r border-gray-200 pr-4' : 'border-l border-gray-200 pl-4'} flex items-center gap-3`}>
            <button onClick={() => navigate('/employee-dashboard')} className="text-[#1E3A5F] hover:text-[#C5A55A] transition">
              <ArrowBack className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#1E3A5F]">{t('employee.notifications.title')}</h1>
              <p className="text-gray-500 text-sm">{t('employee.notifications.subtitle')}</p>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => navigate('/employee-dashboard')} className="text-[#1E3A5F]/70 hover:text-[#C5A55A] font-medium text-sm transition">{t('employee.nav.home')}</button>
          <button onClick={() => navigate('/employee-requests')} className="text-[#1E3A5F]/70 hover:text-[#C5A55A] font-medium text-sm transition">{t('employee.nav.requests')}</button>
          <button onClick={() => navigate('/employee-documents')} className="text-[#1E3A5F]/70 hover:text-[#C5A55A] font-medium text-sm transition">{t('employee.nav.documents')}</button>
          <button onClick={() => navigate('/employee-notifications')} className="text-[#1E3A5F] font-semibold border-b-2 border-[#C5A55A] pb-0.5 text-sm flex items-center gap-1.5">
            {t('employee.nav.notifications')}
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="hidden md:flex items-center gap-2 text-[#C5A55A] font-medium text-sm hover:text-[#1E3A5F] transition">
              <CheckCheck className="w-4 h-4" />
              {t('employee.notifications.markAllRead')}
            </button>
          )}
          <button onClick={() => i18n.changeLanguage(isArabic ? 'en' : 'ar')}
            className="flex items-center gap-2 border border-gray-200 bg-white px-4 py-2 rounded-full hover:bg-gray-50 transition text-sm">
            <span>🌐</span>
            <span className="text-[#1E3A5F] font-medium">{isArabic ? 'EN' : 'AR'}</span>
          </button>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 text-sm transition">{t('employee.logout')}</button>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="p-8">

        {/* Mobile mark all */}
        {unreadCount > 0 && (
          <div className="md:hidden mb-4 flex justify-end">
            <button onClick={markAllRead}
              className="flex items-center gap-2 px-4 py-2 bg-[#C5A55A] text-white rounded-xl text-sm font-medium">
              <CheckCheck className="w-4 h-4" />
              {t('employee.notifications.markAllRead')}
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                  activeTab === tab.key ? 'bg-[#C5A55A] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-4 border-[#C5A55A] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : displayed.length === 0 ? (
            <div className="py-16 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">{t('employee.notifications.noNotifications')}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {displayed.map(n => (
                <div key={n.id}
                  onClick={() => { if (!n.is_read) markRead(n.id); if (n.related_company_id) navigate(`/employee-requests/${n.related_company_id}`); }}
                  className={`p-5 hover:bg-gray-50 transition cursor-pointer ${n.is_read ? '' : 'bg-blue-50/30'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getNotificationBg(n.type)}`}>
                      {getNotificationIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold text-sm ${n.is_read ? 'text-gray-600' : 'text-[#1E3A5F]'}`}>
                              {typeLabel(n.type)}
                            </h3>
                            {!n.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                          </div>
                          <p className="text-gray-600 text-sm">{n.message}</p>
                          {n.company_name && <p className="text-xs text-gray-400 mt-1">{n.company_name}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {new Date(n.created_at).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                          </span>
                          {!n.is_read && (
                            <button
                              onClick={e => { e.stopPropagation(); markRead(n.id); }}
                              className="p-1.5 text-gray-400 hover:text-[#C5A55A] hover:bg-gray-100 rounded-lg transition"
                              title={t('employee.notifications.markAsRead')}>
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { icon: <CheckCircle className="w-5 h-5 text-green-600" />, bg: 'bg-green-100', label: t('employee.notifications.summary.approvals'), count: countFor('REQUEST_APPROVED') },
            { icon: <XCircle className="w-5 h-5 text-red-600" />, bg: 'bg-red-100', label: t('employee.notifications.summary.rejections'), count: countFor('REQUEST_REJECTED') },
            { icon: <RefreshCw className="w-5 h-5 text-orange-600" />, bg: 'bg-orange-100', label: t('employee.notifications.summary.resubmissions'), count: countFor('RESUBMISSION_REQUESTED') },
            { icon: <ClipboardList className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-100', label: t('employee.notifications.summary.unread'), count: unreadCount },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>{card.icon}</div>
                <div>
                  <p className="text-2xl font-bold text-[#1E3A5F]">{card.count}</p>
                  <p className="text-xs text-gray-500">{card.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}