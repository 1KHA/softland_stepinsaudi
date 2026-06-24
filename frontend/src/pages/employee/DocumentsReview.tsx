import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../node_modules/react-i18next';
import { Footer } from '../../components/Footer';
import axios from 'axios';
import {
  Search, ArrowLeft, ArrowRight, Eye, Download,
  CheckCircle, XCircle, RefreshCw, X, FileText
} from 'lucide-react';

const API = 'https://soft-landing-platform.onrender.com';
type TabKey = 'all' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_RESUBMISSION';
type ConfirmType = { type: 'reject' | 'resubmit'; docId: number } | null;

interface Document {
  id: number; file_name: string; file_url: string; status: string;
  uploaded_at: string; company_name: string; company_id: number;
  task_title: string; stage_name: string; rejection_reason: string;
}

export default function DocumentsReview() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith('ar');
  const dir = isArabic ? 'rtl' : 'ltr';

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const headers = { Authorization: `Bearer ${token}` };

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [confirm, setConfirm] = useState<ConfirmType>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!user || !['EMPLOYEE', 'ADMIN'].includes(user.role)) { navigate('/login'); return; }
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/employee/documents`, { headers });
      setDocuments(res.data.documents);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async (docId: number) => {
    try {
      await axios.put(`${API}/employee/documents/${docId}/approve`, {}, { headers });
      showToast(t('employee.documents.toast.approved'), 'success');
      fetchDocs();
    } catch { showToast(t('employee.documents.toast.error'), 'error'); }
  };

  const handleConfirmAction = async () => {
    if (!confirm) return;
    setIsProcessing(true);
    const endpoint = confirm.type === 'reject'
      ? `${API}/employee/documents/${confirm.docId}/reject`
      : `${API}/employee/documents/${confirm.docId}/needs-resubmission`;
    try {
      await axios.put(endpoint, { reason: reviewerNotes }, { headers });
      showToast(
        confirm.type === 'reject' ? t('employee.documents.toast.rejected') : t('employee.documents.toast.resubmit'),
        'success'
      );
      setConfirm(null);
      setReviewerNotes('');
      fetchDocs();
    } catch { showToast(t('employee.documents.toast.error'), 'error'); }
    finally { setIsProcessing(false); }
  };

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      PENDING: t('employee.documents.tabs.pending'),
      APPROVED: t('employee.documents.tabs.approved'),
      REJECTED: t('employee.documents.tabs.rejected'),
      NEEDS_RESUBMISSION: t('employee.documents.tabs.needsReupload'),
    };
    return map[status?.toUpperCase()] || status;
  };

  const statusCls = (status: string) => {
    const map: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      NEEDS_RESUBMISSION: 'bg-orange-100 text-orange-800',
    };
    return map[status?.toUpperCase()] || 'bg-gray-100 text-gray-800';
  };

  const filtered = useMemo(() => {
    let result = documents;
    if (activeTab !== 'all') result = result.filter(d => d.status?.toUpperCase() === activeTab);
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(d =>
        d.file_name?.toLowerCase().includes(term) ||
        d.company_name?.toLowerCase().includes(term) ||
        d.task_title?.toLowerCase().includes(term)
      );
    }
    return result;
  }, [documents, activeTab, search]);

  const countFor = (key: string) =>
    key === 'all' ? documents.length : documents.filter(d => d.status?.toUpperCase() === key).length;

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'all',                label: `${t('employee.documents.tabs.all')} (${countFor('all')})` },
    { key: 'PENDING',            label: `${t('employee.documents.tabs.pending')} (${countFor('PENDING')})` },
    { key: 'APPROVED',           label: `${t('employee.documents.tabs.approved')} (${countFor('APPROVED')})` },
    { key: 'REJECTED',           label: `${t('employee.documents.tabs.rejected')} (${countFor('REJECTED')})` },
    { key: 'NEEDS_RESUBMISSION', label: `${t('employee.documents.tabs.needsReupload')} (${countFor('NEEDS_RESUBMISSION')})` },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const ArrowBack = isArabic ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-[#F7F3EE]" dir={dir}>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl text-white shadow-xl text-sm font-medium ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Confirm Modal */}
      {confirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-[#1E3A5F]">
                {confirm.type === 'reject' ? t('employee.documents.modal.rejectTitle') : t('employee.documents.modal.resubmitTitle')}
              </h3>
              <button onClick={() => setConfirm(null)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <p className="text-gray-600 text-sm mb-5">
              {confirm.type === 'reject' ? t('employee.documents.modal.rejectDesc') : t('employee.documents.modal.resubmitDesc')}
            </p>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('employee.documents.modal.notesLabel')}</label>
              <textarea
                value={reviewerNotes}
                onChange={e => setReviewerNotes(e.target.value)}
                placeholder={t('employee.documents.modal.notesPlaceholder')}
                className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#C5A55A] min-h-[100px] text-sm resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} disabled={isProcessing}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm">
                {t('employee.documents.modal.cancel')}
              </button>
              <button onClick={handleConfirmAction} disabled={isProcessing}
                className={`flex-1 py-3 rounded-xl text-white transition text-sm font-medium disabled:opacity-50 ${
                  confirm.type === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-500 hover:bg-orange-600'
                }`}>
                {isProcessing ? t('employee.documents.modal.processing') : t('employee.documents.modal.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="bg-white shadow-sm px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="/Screenshot_2026-04-22_142843.png" alt="Logo" className="h-10 w-auto object-contain" />
          <div className={`${isArabic ? 'border-r border-gray-200 pr-4' : 'border-l border-gray-200 pl-4'} flex items-center gap-3`}>
            <button onClick={() => navigate('/employee-dashboard')} className="text-[#1E3A5F] hover:text-[#C5A55A] transition">
              <ArrowBack className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#1E3A5F]">{t('employee.documents.title')}</h1>
              <p className="text-gray-500 text-sm">{t('employee.documents.subtitle')}</p>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => navigate('/employee-dashboard')} className="text-[#1E3A5F]/70 hover:text-[#C5A55A] font-medium text-sm transition">{t('employee.nav.home')}</button>
          <button onClick={() => navigate('/employee-requests')} className="text-[#1E3A5F]/70 hover:text-[#C5A55A] font-medium text-sm transition">{t('employee.nav.requests')}</button>
          <button onClick={() => navigate('/employee-documents')} className="text-[#1E3A5F] font-semibold border-b-2 border-[#C5A55A] pb-0.5 text-sm">{t('employee.nav.documents')}</button>
          <button onClick={() => navigate('/employee-notifications')} className="text-[#1E3A5F]/70 hover:text-[#C5A55A] font-medium text-sm transition">{t('employee.nav.notifications')}</button>
        </div>

        <div className="flex items-center gap-3">
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

        {/* Tabs */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                  activeTab === tab.key ? 'bg-[#C5A55A] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Refresh */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className={`absolute ${isArabic ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
              <input
                type="text"
                placeholder={t('employee.documents.searchPlaceholder')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={`w-full ${isArabic ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#C5A55A] focus:ring-2 focus:ring-[#C5A55A]/20 text-sm`}
              />
            </div>
            <button onClick={fetchDocs}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1E3A5F] text-white text-sm font-medium hover:bg-[#1E3A5F]/90 transition">
              <RefreshCw className="w-4 h-4" />
              {t('employee.documents.refresh')}
            </button>
            {search && (
              <button onClick={() => setSearch('')}
                className="flex items-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition text-sm">
                <X className="w-4 h-4" />
                {t('employee.documents.clear')}
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-3 border-b border-gray-100">
            <p className="text-sm text-gray-500">{filtered.length} {t('employee.documents.found')}</p>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-4 border-[#C5A55A] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">{t('employee.documents.noDocs')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      t('employee.documents.table.name'),
                      t('employee.documents.table.company'),
                      t('employee.documents.table.stage'),
                      t('employee.documents.table.task'),
                      t('employee.documents.table.uploadDate'),
                      t('employee.documents.table.status'),
                      t('employee.documents.table.actions'),
                    ].map((h, i) => (
                      <th key={i} className="text-right py-4 px-5 text-sm font-semibold text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(doc => (
                    <tr key={doc.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-[#C5A55A] flex-shrink-0" />
                          <span className="font-medium text-[#1E3A5F] text-sm">{doc.file_name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <button onClick={() => navigate(`/employee-requests/${doc.company_id}`)}
                          className="text-sm text-[#C5A55A] hover:underline font-medium">
                          {doc.company_name}
                        </button>
                      </td>
                      <td className="py-4 px-5 text-sm text-gray-600">{doc.stage_name}</td>
                      <td className="py-4 px-5 text-sm text-gray-500 max-w-32 truncate" title={doc.task_title}>{doc.task_title}</td>
                      <td className="py-4 px-5 text-sm text-gray-500">
                        {new Date(doc.uploaded_at).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                      </td>
                      <td className="py-4 px-5">
                        <div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusCls(doc.status)}`}>
                            {statusLabel(doc.status)}
                          </span>
                          {doc.rejection_reason && (
                            <p className="text-xs text-red-500 mt-1 max-w-40 truncate" title={doc.rejection_reason}>
                              {doc.rejection_reason}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5">
                          <a href={doc.file_url} target="_blank" rel="noreferrer"
                            className="p-2 text-[#C5A55A] hover:bg-[#C5A55A]/10 rounded-lg transition" title={t('employee.documents.actions.view')}>
                            <Eye className="w-4 h-4" />
                          </a>
                          <a href={doc.file_url} download
                            className="p-2 text-[#C5A55A] hover:bg-[#C5A55A]/10 rounded-lg transition" title={t('employee.documents.actions.download')}>
                            <Download className="w-4 h-4" />
                          </a>
                          {(doc.status?.toUpperCase() === 'PENDING' || doc.status?.toUpperCase() === 'NEEDS_RESUBMISSION') && (
                            <button onClick={() => handleApprove(doc.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title={t('employee.documents.actions.approve')}>
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {doc.status?.toUpperCase() !== 'REJECTED' && (
                            <button onClick={() => { setConfirm({ type: 'reject', docId: doc.id }); setReviewerNotes(''); }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title={t('employee.documents.actions.reject')}>
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          {doc.status?.toUpperCase() !== 'NEEDS_RESUBMISSION' && doc.status?.toUpperCase() !== 'APPROVED' && (
                            <button onClick={() => { setConfirm({ type: 'resubmit', docId: doc.id }); setReviewerNotes(''); }}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition" title={t('employee.documents.actions.requestReupload')}>
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}