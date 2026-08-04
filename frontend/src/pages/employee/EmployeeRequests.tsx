import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Footer } from '../../components/Footer';
import axios from 'axios';
import {
  Search, Filter, Eye, ArrowLeft, ArrowRight,
  ChevronLeft, ChevronRight, X, ClipboardList
} from 'lucide-react';

import { API_URL } from "../../config";
import { StepInLogo, SpectrumBar } from "../../components/StepInLogo";
const API = `${API_URL}`;
const ITEMS_PER_PAGE = 10;

export default function EmployeeRequests() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith('ar');
  const dir = isArabic ? 'rtl' : 'ltr';

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const headers = { Authorization: `Bearer ${token}` };

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!user || !['EMPLOYEE', 'ADMIN'].includes(user.role)) { navigate('/login'); return; }
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      const res = await axios.get(`${API}/employee/requests`, { headers, params });
      setRequests(res.data.requests);
      setCurrentPage(1);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      UNDER_REVIEW: t('employee.status.underReview'),
      APPROVED: t('employee.status.approved'),
      REJECTED: t('employee.status.rejected'),
      NEEDS_COMPLETION: t('employee.status.needsCompletion'),
      SUBMITTED: t('employee.status.submitted'),
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

  const filtered = useMemo(() => {
    if (!search) return requests;
    const term = search.toLowerCase();
    return requests.filter(r =>
      r.company_name?.toLowerCase().includes(term) || String(r.id).includes(term)
    );
  }, [requests, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const ArrowBack = isArabic ? ArrowRight : ArrowLeft;
  const PrevChevron = isArabic ? ChevronRight : ChevronLeft;
  const NextChevron = isArabic ? ChevronLeft : ChevronRight;

  const statusOptions = [
    { value: '', label: t('employee.status.all') },
    { value: 'UNDER_REVIEW', label: t('employee.status.underReview') },
    { value: 'SUBMITTED', label: t('employee.status.submitted') },
    { value: 'APPROVED', label: t('employee.status.approved') },
    { value: 'REJECTED', label: t('employee.status.rejected') },
    { value: 'NEEDS_COMPLETION', label: t('employee.status.needsCompletion') },
  ];

  return (
    <div className="min-h-screen bg-brand-bg" dir={dir}>
      <SpectrumBar />

      {/* ── HEADER ── */}
      <div className="bg-white shadow-sm px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <StepInLogo size="md" />
          <div className={`${isArabic ? 'border-r border-gray-200 pr-4' : 'border-l border-gray-200 pl-4'} flex items-center gap-3`}>
            <button onClick={() => navigate('/employee-dashboard')} className="text-[#2B3E8F] hover:text-[#1DBAEA] transition">
              <ArrowBack className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#2B3E8F]">{t('employee.requests.title')}</h1>
              <p className="text-gray-500 text-sm">{t('employee.requests.subtitle')}</p>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => navigate('/employee-dashboard')} className="text-[#2B3E8F]/70 hover:text-[#1DBAEA] font-medium text-sm transition">{t('employee.nav.home')}</button>
          <button onClick={() => navigate('/employee-requests')} className="text-[#2B3E8F] font-semibold border-b-2 border-[#1DBAEA] pb-0.5 text-sm">{t('employee.nav.requests')}</button>
          <button onClick={() => navigate('/employee-documents')} className="text-[#2B3E8F]/70 hover:text-[#1DBAEA] font-medium text-sm transition">{t('employee.nav.documents')}</button>
          <button onClick={() => navigate('/employee-notifications')} className="text-[#2B3E8F]/70 hover:text-[#1DBAEA] font-medium text-sm transition">{t('employee.nav.notifications')}</button>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => i18n.changeLanguage(isArabic ? 'en' : 'ar')}
            className="flex items-center gap-2 border border-gray-200 bg-white px-4 py-2 rounded-full hover:bg-gray-50 transition text-sm">
            <span>🌐</span>
            <span className="text-[#2B3E8F] font-medium">{isArabic ? 'EN' : 'AR'}</span>
          </button>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 text-sm transition">{t('employee.logout')}</button>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="p-8">

        {/* Search & Filter */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full max-w-lg">
              <div className={`absolute ${isArabic ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 bg-[#1DBAEA]/10 p-1.5 rounded-lg`}>
                <Search className="w-4 h-4 text-[#1DBAEA]" />
              </div>
              <input
                type="text"
                placeholder={t('employee.requests.searchPlaceholder')}
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                className={`w-full ${isArabic ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1DBAEA] focus:ring-2 focus:ring-[#1DBAEA]/20 text-sm`}
              />
            </div>

            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition text-sm ${
                showFilters ? 'bg-[#1DBAEA] text-white border-[#1DBAEA]' : 'border-gray-200 text-[#2B3E8F] hover:bg-gray-50'
              }`}>
              <Filter className="w-4 h-4" />
              {t('employee.requests.filterStatus')}
            </button>

            {(search || statusFilter) && (
              <button onClick={() => { setSearch(''); setStatusFilter(''); setCurrentPage(1); }}
                className="flex items-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition text-sm">
                <X className="w-4 h-4" />
                {t('employee.requests.clearFilters')}
              </button>
            )}
          </div>

          {showFilters && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {statusOptions.map(opt => (
                  <button key={opt.value}
                    onClick={() => { setStatusFilter(opt.value); setCurrentPage(1); }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                      statusFilter === opt.value ? 'bg-[#1DBAEA] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-4 border-[#1DBAEA] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : paginated.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg">{t('employee.requests.noRequests')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      t('employee.requests.table.id'),
                      t('employee.requests.table.company'),
                      t('employee.requests.table.sector'),
                      t('employee.requests.table.stage'),
                      t('employee.requests.table.status'),
                      t('employee.requests.table.employee'),
                      t('employee.requests.table.date'),
                      t('employee.requests.table.actions'),
                    ].map((h, i) => (
                      <th key={i} className="text-right py-3.5 px-5 text-sm font-semibold text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(req => (
                    <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="py-3.5 px-5 text-sm font-mono font-medium text-[#2B3E8F]">
                        REQ-{String(req.id).padStart(3, '0')}
                      </td>
                      <td className="py-3.5 px-5 text-sm font-medium text-gray-800">{req.company_name}</td>
                      <td className="py-3.5 px-5 text-sm text-gray-500">{req.sector_name || '—'}</td>
                      <td className="py-3.5 px-5 text-sm text-gray-600">{req.current_stage_name || '—'}</td>
                      <td className="py-3.5 px-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusCls(req.status)}`}>
                          {statusLabel(req.status)}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-sm text-gray-500">{req.assigned_employee_name || '—'}</td>
                      <td className="py-3.5 px-5 text-sm text-gray-500">
                        {new Date(req.created_at).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                      </td>
                      <td className="py-3.5 px-5">
                        <button onClick={() => navigate(`/employee-requests/${req.id}`)}
                          className="flex items-center gap-2 text-[#1DBAEA] font-medium text-sm hover:text-[#2B3E8F] transition">
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

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {t('employee.requests.pagination.showing')}{' '}
                <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>{' '}
                {t('employee.requests.pagination.to')}{' '}
                <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</span>{' '}
                {t('employee.requests.pagination.results')}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 text-[#2B3E8F] hover:bg-gray-50 disabled:opacity-40">
                  <PrevChevron className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      currentPage === page ? 'bg-[#1DBAEA] text-white' : 'border border-gray-200 text-[#2B3E8F] hover:bg-gray-50'
                    }`}>
                    {page}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 text-[#2B3E8F] hover:bg-gray-50 disabled:opacity-40">
                  <NextChevron className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          {!loading && filtered.length > 0 && (
            <div className="px-5 py-3 bg-gray-50 text-xs text-gray-400 border-t border-gray-100">
              {filtered.length} {t('employee.requests.total')}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}