import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../node_modules/react-i18next';
import { Footer } from '../../components/Footer';
import axios from 'axios';
import {
  ArrowLeft, ArrowRight, Building2, FileText, Phone, Mail,
  Download, Eye, CheckCircle, XCircle, AlertCircle,
  Clock, User, MessageSquare, History, X
} from 'lucide-react';

const API = 'http://localhost:3000';

type ActionType = 'approve' | 'reject' | 'resubmit' | null;

export default function RequestDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith('ar');
  const dir = isArabic ? 'rtl' : 'ltr';

  const token = localStorage.getItem('token');
  const user = JSON.parse(
  localStorage.getItem('user') || '{}'
);

const isAdmin = user.role === 'ADMIN';
  const headers = { Authorization: `Bearer ${token}` };

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState<ActionType>(null);
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => { fetchDetails(); }, [id]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/employee/requests/${id}`, { headers });
      setData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAction = async () => {
    if (!showConfirm) return;
    setIsProcessing(true);
    const endpoints: Record<string, string> = {
      approve:  `/employee/requests/${id}/approve`,
      reject:   `/employee/requests/${id}/reject`,
      resubmit: `/employee/requests/${id}/resubmit`,
    };
    try {
      await axios.put(`${API}${endpoints[showConfirm]}`, { note: notes }, { headers });
      const toastMap: Record<string, string> = {
        approve:  t('employee.requestDetails.toast.approved'),
        reject:   t('employee.requestDetails.toast.rejected'),
        resubmit: t('employee.requestDetails.toast.resubmit'),
      };
      showToast(toastMap[showConfirm], 'success');
      setShowConfirm(null);
      setNotes('');
      fetchDetails();
    } catch {
      showToast(t('employee.requestDetails.toast.error'), 'error');
    } finally { setIsProcessing(false); }
  };

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      UNDER_REVIEW:      t('employee.status.underReview'),
      PENDING:           t('employee.status.pending'),
      APPROVED:          t('employee.status.approved'),
      COMPLETED:         t('employee.status.completed'),
      REJECTED:          t('employee.status.rejected'),
      NEEDS_COMPLETION:  t('employee.status.needsCompletion'),
      NEEDS_RESUBMISSION:t('employee.status.needsResubmission'),
      IN_PROGRESS:       t('employee.status.inProgress'),
      LOCKED:            t('employee.status.locked'),
      SUBMITTED:         t('employee.status.submitted'),
    };
    return map[status?.toUpperCase()] || status;
  };

  const statusCls = (status: string) => {
    const map: Record<string, string> = {
      APPROVED: 'bg-green-100 text-green-800', COMPLETED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      UNDER_REVIEW: 'bg-yellow-100 text-yellow-800', PENDING: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800', SUBMITTED: 'bg-blue-100 text-blue-800',
      NEEDS_COMPLETION: 'bg-orange-100 text-orange-800', NEEDS_RESUBMISSION: 'bg-orange-100 text-orange-800',
      LOCKED: 'bg-gray-100 text-gray-500',
    };
    return map[status?.toUpperCase()] || 'bg-gray-100 text-gray-800';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const ArrowBack = isArabic ? ArrowRight : ArrowLeft;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F3EE] flex items-center justify-center" dir={dir}>
        <div className="w-12 h-12 border-4 border-[#C5A55A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="min-h-screen bg-[#F7F3EE] flex items-center justify-center text-gray-500" dir={dir}>
        {t('employee.requestDetails.title')}
      </div>
    );
  }

  const { company, stages, tasks, documents } = data;
  const confirmMsg: Record<string, string> = {
    approve:  t('employee.requestDetails.confirmation.approve'),
    reject:   t('employee.requestDetails.confirmation.reject'),
    resubmit: t('employee.requestDetails.confirmation.requestEdit'),
  };

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
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-[#1E3A5F]">{t('employee.requestDetails.confirmation.title')}</h2>
              <button onClick={() => setShowConfirm(null)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">{confirmMsg[showConfirm]}</p>
            {(showConfirm === 'reject' || showConfirm === 'resubmit') && (
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={t('employee.requestDetails.confirmation.reasonPlaceholder')}
                className="w-full border border-gray-200 rounded-xl p-4 min-h-[100px] mb-5 focus:outline-none focus:border-[#C5A55A] text-sm resize-none"
              />
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm">
                {t('employee.requestDetails.confirmation.cancel')}
              </button>
              <button onClick={handleAction} disabled={isProcessing}
                className={`flex-1 py-3 rounded-xl text-white transition text-sm font-medium disabled:opacity-50 ${
                  showConfirm === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  showConfirm === 'reject'  ? 'bg-red-600 hover:bg-red-700' :
                  'bg-orange-500 hover:bg-orange-600'
                }`}>
                {isProcessing ? t('employee.requestDetails.confirmation.processing') : t('employee.requestDetails.confirmation.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="bg-white shadow-sm px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/employee-requests')} className="flex items-center gap-2 text-[#1E3A5F] hover:text-[#C5A55A] transition">
            <ArrowBack className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#1E3A5F]">{t('employee.requestDetails.title')}</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {t('employee.requestDetails.requestId')}: REQ-{String(company.id).padStart(3, '0')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusCls(company.status)}`}>
            {statusLabel(company.status)}
          </span>
          <button onClick={() => i18n.changeLanguage(isArabic ? 'en' : 'ar')}
            className="flex items-center gap-2 border border-gray-200 bg-white px-4 py-2 rounded-full hover:bg-gray-50 transition text-sm">
            <span>🌐</span>
            <span className="text-[#1E3A5F] font-medium">{isArabic ? 'EN' : 'AR'}</span>
          </button>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 text-sm transition">{t('employee.logout')}</button>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── LEFT ── */}
        <div className="space-y-6">

          {/* Company Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-[#1E3A5F] mb-5">{t('employee.requestDetails.companyInfo')}</h2>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 bg-[#C5A55A]/10 rounded-xl flex items-center justify-center">
                <Building2 className="w-7 h-7 text-[#C5A55A]" />
              </div>
              <div>
                <p className="font-bold text-[#1E3A5F] text-lg">{company.company_name}</p>
                <p className="text-sm text-gray-500">{company.sector_name || '—'}</p>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-3">
              {[
                { icon: <User className="w-4 h-4 text-gray-400" />, value: company.manager_name },
                { icon: <Mail className="w-4 h-4 text-gray-400" />, value: company.email },
                { icon: <Phone className="w-4 h-4 text-gray-400" />, value: company.phone || '—' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                  {item.icon}
                  <span>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Request Meta */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-[#1E3A5F] mb-5">{t('employee.requestDetails.requestMeta')}</h2>
            <div className="space-y-4">
              {[
                { label: t('employee.requestDetails.requestId'), value: `#${company.id}` },
                { label: t('employee.requestDetails.country'), value: company.country },
                { label: t('employee.requestDetails.createdAt'), value: new Date(company.created_at).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US') },
                { label: t('employee.requestDetails.stages'), value: `${stages.filter((s: any) => s.status === 'COMPLETED').length} / ${stages.length} ${t('employee.requestDetails.completed')}` },
                { label: t('employee.requestDetails.tasks'), value: `${tasks.filter((t2: any) => t2.status === 'COMPLETED').length} / ${tasks.length} ${t('employee.requestDetails.completed')}` },
                { label: t('employee.requestDetails.documents'), value: `${documents.length} ${t('employee.requestDetails.file')}` },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <span className="text-sm font-semibold text-[#1E3A5F]">{item.value}</span>
                </div>
              ))}
              <div className="pt-2">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{t('employee.requestDetails.progress')}</span>
                  <span>{stages.length ? Math.round((stages.filter((s: any) => s.status === 'COMPLETED').length / stages.length) * 100) : 0}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#C5A55A] rounded-full transition-all"
                    style={{ width: `${stages.length ? (stages.filter((s: any) => s.status === 'COMPLETED').length / stages.length) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {isAdmin && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-[#1E3A5F] mb-5">{t('employee.requestDetails.actions.title')}</h2>
            <div className="space-y-3">
              <button onClick={() => setShowConfirm('approve')}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl transition font-medium text-sm">
                <CheckCircle className="w-5 h-5" />
                {t('employee.requestDetails.actions.approve')}
              </button>
              <button onClick={() => setShowConfirm('resubmit')}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl transition font-medium text-sm">
                <AlertCircle className="w-5 h-5" />
                {t('employee.requestDetails.actions.requestEdit')}
              </button>
              <button onClick={() => setShowConfirm('reject')}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl transition font-medium text-sm">
                <XCircle className="w-5 h-5" />
                {t('employee.requestDetails.actions.reject')}
              </button>
            </div>
          </div>
)}
</div>
        {/* ── RIGHT ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Workflow Stages */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <History className="w-5 h-5 text-[#C5A55A]" />
              <h2 className="text-xl font-bold text-[#1E3A5F]">{t('employee.requestDetails.workflow')}</h2>
            </div>
            <div className="space-y-3">
              {stages.map((stage: any) => {
                const stageTasks = tasks.filter((t2: any) => t2.company_stage_id === stage.id);
                return (
                  <div key={stage.id} className={`border rounded-xl overflow-hidden ${
                    stage.status === 'IN_PROGRESS' ? 'border-[#C5A55A]' :
                    stage.status === 'COMPLETED'   ? 'border-green-200' : 'border-gray-100'
                  }`}>
                    <div className={`flex items-center justify-between px-4 py-3 ${
                      stage.status === 'IN_PROGRESS' ? 'bg-[#C5A55A]/10' :
                      stage.status === 'COMPLETED'   ? 'bg-green-50' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-[#1E3A5F] text-sm">{stage.stage_name}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusCls(stage.status)}`}>
                        {statusLabel(stage.status)}
                      </span>
                    </div>
                    {stageTasks.length > 0 && (
                      <div className="divide-y divide-gray-50">
                       {stageTasks.map((task: any) => (
  <div
    key={task.id}
    className="flex items-center justify-between px-4 py-2.5 bg-white"
  >
    <span className="text-sm text-gray-600">
      {task.task_title}
    </span>

    <div className="flex items-center gap-2">

      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusCls(task.status)}`}
      >
        {statusLabel(task.status)}
      </span>

      {isAdmin && (
        <select
          className="border rounded px-2 py-1 text-xs"
        >
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="REJECTED">Rejected</option>
        </select>
      )}

    </div>
  </div>
))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <FileText className="w-5 h-5 text-[#C5A55A]" />
              <h2 className="text-xl font-bold text-[#1E3A5F]">{t('employee.requestDetails.docsTitle')} ({documents.length})</h2>
            </div>
            {documents.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>{t('employee.requestDetails.noDocs')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc: any) => (
                  <div key={doc.id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#C5A55A]/10 rounded-xl flex items-center justify-center">
                          <FileText className="w-5 h-5 text-[#C5A55A]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#1E3A5F] text-sm">{doc.file_name}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">{doc.stage_name} • {new Date(doc.uploaded_at).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusCls(doc.status)}`}>
                          {statusLabel(doc.status)}
                        </span>
                        <a href={doc.file_url} target="_blank" rel="noreferrer" className="p-2 hover:bg-gray-100 rounded-lg transition">
                          <Eye className="w-4 h-4 text-[#1E3A5F]" />
                        </a>
                        <a href={doc.file_url} download className="p-2 hover:bg-gray-100 rounded-lg transition">
                          <Download className="w-4 h-4 text-[#1E3A5F]" />
                        </a>
                      </div>
                    </div>
                    {doc.rejection_reason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                        {t('employee.requestDetails.rejectionReason')}: {doc.rejection_reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <MessageSquare className="w-5 h-5 text-[#C5A55A]" />
              <h2 className="text-xl font-bold text-[#1E3A5F]">{t('employee.requestDetails.notes')}</h2>
            </div>
            {company.admin_note ? (
              <div className="border border-orange-100 rounded-xl p-4 mb-4 bg-orange-50">
                <p className="text-sm font-semibold text-orange-700 mb-1">{t('employee.requestDetails.adminNote')}</p>
                <p className="text-sm text-orange-700">{company.admin_note}</p>
              </div>
            ) : (
              <p className="text-center text-gray-400 text-sm py-4">{t('employee.requestDetails.noNotes')}</p>
            )}
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={t('employee.requestDetails.notePlaceholder')}
              className="w-full border border-gray-200 rounded-xl p-4 min-h-[100px] focus:outline-none focus:border-[#C5A55A] text-sm resize-none"
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}