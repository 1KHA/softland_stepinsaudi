import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../node_modules/react-i18next';
import { Footer } from '../../components/Footer';
import axios from 'axios';
import {
  FileText, Clock, CheckCircle, XCircle,
  Bell, ArrowLeft, ArrowRight, Eye,
  AlertCircle, Activity, RefreshCw, Download
} from 'lucide-react';

import { API_URL } from "../../config";
const API = `${API_URL}`;

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith('ar');
  const dir = isArabic ? 'rtl' : 'ltr';

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, needsCompletion: 0 });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !['EMPLOYEE', 'ADMIN'].includes(user.role)) { navigate('/login'); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, r, n] = await Promise.all([
        axios.get(`${API}/employee/dashboard/stats`, { headers }),
        axios.get(`${API}/employee/requests`, { headers }),
        axios.get(`${API}/employee/notifications`, { headers }),
      ]);
      setStats(s.data.stats);
      setRecentRequests(r.data.requests.slice(0, 5));
      setNotifications(n.data.notifications.slice(0, 3));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      UNDER_REVIEW:     t('employee.status.underReview'),
      APPROVED:         t('employee.status.approved'),
      REJECTED:         t('employee.status.rejected'),
      NEEDS_COMPLETION: t('employee.status.needsCompletion'),
      SUBMITTED:        t('employee.status.submitted'),
    };
    return map[status?.toUpperCase()] || status;
  };

  const statusCls = (status: string) => {
    const map: Record<string, string> = {
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
      SUBMITTED: 'bg-blue-100 text-blue-800',
      NEEDS_COMPLETION: 'bg-orange-100 text-orange-800',
    };
    return map[status?.toUpperCase()] || 'bg-gray-100 text-gray-800';
  };

  const notifIcon = (type: string) => {
    if (type === 'REQUEST_APPROVED') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (type === 'REQUEST_REJECTED') return <XCircle className="w-4 h-4 text-red-500" />;
    return <AlertCircle className="w-4 h-4 text-orange-500" />;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const ArrowBack = isArabic ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-[#F7F3EE]" dir={dir}>

      {/* ── HEADER ── */}
      <div className="bg-white shadow-sm px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="/Screenshot_2026-04-22_142843.png" alt="Logo" className="h-10 w-auto object-contain" />
          <div className={`${isArabic ? 'border-r border-gray-200 pr-4' : 'border-l border-gray-200 pl-4'}`}>
            <h1 className="text-xl font-bold text-[#1E3A5F]">
              {t('employee.welcome')}, {user?.name || ''}
            </h1>
            <p className="text-gray-500 text-sm">{t('employee.dashboard')}</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => navigate('/employee-dashboard')} className="text-[#1E3A5F] font-semibold border-b-2 border-[#C5A55A] pb-0.5 text-sm">
            {t('employee.nav.home')}
          </button>
          <button onClick={() => navigate('/employee-requests')} className="text-[#1E3A5F]/70 hover:text-[#C5A55A] font-medium text-sm transition">
            {t('employee.nav.requests')}
          </button>
          <button onClick={() => navigate('/employee-documents')} className="text-[#1E3A5F]/70 hover:text-[#C5A55A] font-medium text-sm transition">
            {t('employee.nav.documents')}
          </button>
          <button onClick={() => navigate('/employee-notifications')} className="relative text-[#1E3A5F]/70 hover:text-[#C5A55A] font-medium text-sm transition flex items-center gap-1.5">
            {t('employee.nav.notifications')}
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => i18n.changeLanguage(isArabic ? 'en' : 'ar')}
            className="flex items-center gap-2 border border-gray-200 bg-white px-4 py-2 rounded-full hover:bg-gray-50 transition text-sm"
          >
            <span>🌐</span>
            <span className="text-[#1E3A5F] font-medium">{isArabic ? 'EN' : 'AR'}</span>
          </button>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 text-sm transition">
            {t('employee.logout')}
          </button>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="p-8">

        {/* Quick Actions */}
        <div className="mb-6 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-[#1E3A5F] mb-4">{t('employee.quickActions')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { icon: <FileText className="w-5 h-5 text-[#C5A55A]" />, label: t('employee.nav.requests'), to: '/employee-requests' },
              { icon: <Download className="w-5 h-5 text-[#C5A55A]" />, label: t('employee.nav.documents'), to: '/employee-documents' },
              { icon: <Bell className="w-5 h-5 text-[#C5A55A]" />, label: t('employee.nav.notifications'), to: '/employee-notifications' },
            ].map((item, i) => (
              <button key={i} onClick={() => navigate(item.to)}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#C5A55A] hover:bg-[#C5A55A]/5 transition text-right">
                {item.icon}
                <span className="font-medium text-[#1E3A5F] text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48 bg-white rounded-2xl border border-gray-100">
            <div className="w-10 h-10 border-4 border-[#C5A55A] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: t('employee.summary.totalRequests'), value: stats.total, icon: <FileText className="w-6 h-6 text-blue-600" />, bg: 'bg-blue-100' },
                { label: t('employee.summary.pendingReview'), value: stats.pending, icon: <Clock className="w-6 h-6 text-yellow-600" />, bg: 'bg-yellow-100' },
                { label: t('employee.summary.approvedToday'), value: stats.approved, icon: <CheckCircle className="w-6 h-6 text-green-600" />, bg: 'bg-green-100' },
                { label: t('employee.summary.rejected'), value: stats.rejected, icon: <XCircle className="w-6 h-6 text-red-600" />, bg: 'bg-red-100' },
              ].map((card, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">{card.label}</p>
                      <p className="text-3xl font-bold text-[#1E3A5F] mt-1">{card.value}</p>
                    </div>
                    <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center`}>
                      {card.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Recent Requests */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-[#1E3A5F]">{t('employee.recentRequests')}</h2>
                  <button onClick={() => navigate('/employee-requests')}
                    className="text-[#C5A55A] font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all">
                    {t('employee.viewAll')} <ArrowBack className="w-4 h-4" />
                  </button>
                </div>

                {recentRequests.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>{t('employee.noRequests')}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">{t('employee.requests.table.id')}</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">{t('employee.requests.table.company')}</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">{t('employee.requests.table.stage')}</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">{t('employee.requests.table.status')}</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">{t('employee.requests.table.actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentRequests.map(req => (
                          <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                            <td className="py-4 px-4 text-sm font-mono font-medium text-[#1E3A5F]">
                              REQ-{String(req.id).padStart(3, '0')}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-700">{req.company_name}</td>
                            <td className="py-4 px-4 text-sm text-gray-500">{req.current_stage_name || '—'}</td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusCls(req.status)}`}>
                                {statusLabel(req.status)}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <button onClick={() => navigate(`/employee-requests/${req.id}`)}
                                className="flex items-center gap-1.5 text-[#C5A55A] font-medium text-sm hover:text-[#1E3A5F] transition">
                                <Eye className="w-4 h-4" />
                                {t('employee.requests.details')}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Right Sidebar */}
              <div className="space-y-5">
                {/* Notifications Preview */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-[#1E3A5F]">{t('employee.recentNotifications')}</h2>
                    <button onClick={() => navigate('/employee-notifications')} className="text-[#C5A55A] text-sm hover:underline">
                      {t('employee.viewAll')}
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">{t('employee.noNotifications')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map(n => (
                        <div key={n.id} className={`p-3 rounded-xl ${n.is_read ? 'bg-gray-50' : 'bg-blue-50'}`}>
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">{notifIcon(n.type)}</div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-[#1E3A5F]">{n.message}</p>
                              {n.company_name && <p className="text-xs text-gray-500 mt-0.5">{n.company_name}</p>}
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(n.created_at).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                              </p>
                            </div>
                            {!n.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Activity Summary */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-[#C5A55A]" />
                    <h2 className="text-lg font-bold text-[#1E3A5F]">{t('employee.summary.activitySummary')}</h2>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: t('employee.summary.approvalRate'), value: `${stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%` },
                      { label: t('employee.summary.needsReview'), value: stats.pending },
                      { label: t('employee.summary.needsCompletion'), value: stats.needsCompletion },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                        <span className="text-sm text-gray-500">{item.label}</span>
                        <span className="font-bold text-[#1E3A5F]">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}