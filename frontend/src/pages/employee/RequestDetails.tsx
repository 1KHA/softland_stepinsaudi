import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Footer } from '../../components/Footer';
import axios from 'axios';
import {
  ArrowLeft, ArrowRight, Building2, FileText, Phone, Mail,
  Download, Eye, CheckCircle, XCircle, AlertCircle,
  Clock, User, MessageSquare, History, X
} from 'lucide-react';

import { API_URL } from "../../config";
import { openDocument } from "../../lib/files";
const API = `${API_URL}`;

type ActionType =
  | "approve"
  | "reject"
  | "resubmit"
  | "documentReject";

export default function RequestDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith('ar');
  const dir = isArabic ? 'rtl' : 'ltr';

  const stageTranslation: Record<string, string> = {
  Registration: "registration",
  Compliance: "compliance",
  Licensing: "licensing",
  "Final Approval": "final_approval",
};

const getStageName = (name: string) => {
  const map: Record<string, string> = {
    Registration: "dashboard.registration",
    Compliance: "dashboard.compliance",
    Licensing: "dashboard.licensing",
    "Final Approval": "dashboard.finalApproval",
  };

  return t(map[name] || name);
};

  const token = localStorage.getItem('token');
  const user = JSON.parse(
  localStorage.getItem('user') || '{}'
);

const isAdmin = user.role === 'ADMIN';
  const headers = { Authorization: `Bearer ${token}` };

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] =
  useState<ActionType | null>(null);
    const [notes, setNotes] = useState('');
  const [selectedDocumentId, setSelectedDocumentId] =
  useState<number | null>(null);
  const [licenseFiles, setLicenseFiles] = useState<{
  [taskId: number]: File[];
}>({});
const [processingDocId, setProcessingDocId] = useState<number | null>(null);
const [isProcessing, setIsProcessing] = useState(false);

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => { fetchDetails(); }, [id]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      console.log('FETCHING DETAILS...');
      const res = await axios.get(`${API}/employee/requests/${id}`, { headers });
      console.table(
  res.data.tasks.map((t: any) => ({
    id: t.id,
    title: t.task_title,
    status: t.status,
  }))
);
      console.log('NEW DATA', res.data);
      console.log("COMPANY =", res.data.company);
      console.table(
  res.data.tasks.map((t: any) => ({
    task_title: t.task_title,
    task_title_ar: t.task_title_ar,
  }))
);

      setData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAction = async () => {
    if (
  showConfirm === "documentReject" &&
  selectedDocumentId
) {
  try {
    await axios.put(
      `${API}/employee/documents/${selectedDocumentId}/needs-resubmission`,
      { reason: notes },
      { headers }
    );

showToast(t("employee.notifications.documentNeedsResubmission"), "success");


    setShowConfirm(null);
    setSelectedDocumentId(null);
    setNotes("");

    await fetchDetails();
  } catch (err) {
    console.error(err);

showToast(t("employee.notifications.documentUpdateFailed"), "error");
  }

  return;
}
    if (!showConfirm) return;
    setIsProcessing(true);

const endpoints: Record<
  Exclude<ActionType, "documentReject">,
  string
> = {
  approve: `/employee/requests/${id}/approve`,
  reject: `/employee/requests/${id}/reject`,
  resubmit: `/employee/requests/${id}/resubmit`,
};

    try {
await axios.put(
  `${API}${endpoints[showConfirm as Exclude<ActionType, "documentReject">]}`,
  { note: notes },
  { headers }
);      const toastMap: Record<string, string> = {
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
      <div className="min-h-screen bg-brand-bg flex items-center justify-center" dir={dir}>
        <div className="w-12 h-12 border-4 border-[#1DBAEA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center text-gray-500" dir={dir}>
        {t('employee.requestDetails.title')}
      </div>
    );
  }

  const { company, stages, tasks, documents } = data;
  console.log('STAGES', stages);
console.table(
  tasks.map((t:any) => ({
    id: t.id,
    task_id: t.task_id,
    company_stage_id: t.company_stage_id,
    status: t.status
  }))
);
console.log('DOCUMENTS', documents);
const confirmMsg: Record<ActionType, string> = {
  approve: t("employee.requestDetails.confirmation.approve"),
  reject: t("employee.requestDetails.confirmation.reject"),
  resubmit: t("employee.requestDetails.confirmation.requestEdit"),
documentReject: t(
  "employee.requestDetails.confirmation.reasonPlaceholder"
),
};

// Closing a request must not freeze the whole page. Approving a company set
// its status to APPROVED, which used to hide EVERY admin control — including
// the licence upload — so a licence task created after approval (it arrives as
// PENDING) could never be actioned and the admin was left with no explanation.
//
// Two separate permissions now:
//   canManageRequest — the request-level Actions card. Still closed once the
//                      request is APPROVED/REJECTED/COMPLETED; re-approving a
//                      closed request is meaningless.
//   canManageTasks   — per-task work: licence upload, task status, document
//                      approve/reject. An admin keeps these regardless, because
//                      issuing a licence or reviewing a late document is normal
//                      work after approval.
const requestClosed =
  ["APPROVED", "REJECTED", "COMPLETED"].includes(company.status);

const canManageRequest = isAdmin && !requestClosed;
const canManageTasks = isAdmin;

  return (
    <div className="min-h-screen bg-brand-bg" dir={dir}>

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
              <h2 className="text-2xl font-bold text-[#2B3E8F]">{t('employee.requestDetails.confirmation.title')}</h2>
              <button onClick={() => setShowConfirm(null)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
  {confirmMsg[showConfirm]}
</p>

{(
  showConfirm === "reject" ||
  showConfirm === "resubmit" ||
  showConfirm === "documentReject"
) && (
  <textarea
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
    placeholder={t(
      "employee.requestDetails.confirmation.reasonPlaceholder"
    )}
    className="w-full border border-gray-200 rounded-xl p-4 min-h-[100px] mb-5 focus:outline-none focus:border-[#1DBAEA] text-sm resize-none"
  />
)}

            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm">
                {t('employee.requestDetails.confirmation.cancel')}
              </button>
              <button onClick={handleAction} disabled={isProcessing}
className={`flex-1 py-3 rounded-xl text-white transition text-sm font-medium disabled:opacity-50 ${
  showConfirm === "approve"
    ? "bg-green-600 hover:bg-green-700"
    : showConfirm === "reject" ||
      showConfirm === "documentReject"
    ? "bg-red-600 hover:bg-red-700"
    : "bg-orange-500 hover:bg-orange-600"
}`}
>
                {isProcessing ? t('employee.requestDetails.confirmation.processing') : t('employee.requestDetails.confirmation.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="bg-white shadow-sm px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
  onClick={() => navigate('/admin/requests')} className="flex items-center gap-2 text-[#2B3E8F] hover:text-[#1DBAEA] transition">
            <ArrowBack className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#2B3E8F]">{t('employee.requestDetails.title')}</h1>
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
            <span className="text-[#2B3E8F] font-medium">{isArabic ? 'EN' : 'AR'}</span>
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
            <h2 className="text-xl font-bold text-[#2B3E8F] mb-5">{t('employee.requestDetails.companyInfo')}</h2>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 bg-[#1DBAEA]/10 rounded-xl flex items-center justify-center">
                <Building2 className="w-7 h-7 text-[#1DBAEA]" />
              </div>
              <div>
<p className="font-bold text-[#2B3E8F] text-lg">
  {company.name || "—"}
</p>
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
            <h2 className="text-xl font-bold text-[#2B3E8F] mb-5">{t('employee.requestDetails.requestMeta')}</h2>
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
                  <span className="text-sm font-semibold text-[#2B3E8F]">{item.value}</span>
                </div>
              ))}
              <div className="pt-2">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{t('employee.requestDetails.progress')}</span>
                  <span>{stages.length ? Math.round((stages.filter((s: any) => s.status === 'COMPLETED').length / stages.length) * 100) : 0}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#1DBAEA] rounded-full transition-all"
                    style={{ width: `${stages.length ? (stages.filter((s: any) => s.status === 'COMPLETED').length / stages.length) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* A closed request keeps its per-task controls (licences can still be
              issued), so say plainly why the Actions card is gone rather than
              leaving the admin hunting for a button that will never appear. */}
          {isAdmin && requestClosed && (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-sm font-semibold text-[#2B3E8F]">
                {t('employee.requestDetails.closedTitle', { status: statusLabel(company.status) })}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
                {t('employee.requestDetails.closedHint')}
              </p>
            </div>
          )}

          {/* ── Request-level actions ──
              These three endpoints existed in handleAction() and in the
              confirmation modal from the start, but nothing ever rendered a
              control that set showConfirm to them, so the whole request-level
              approval path was unreachable from the UI. */}
          {canManageRequest && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-[#2B3E8F] mb-4">
                {t('employee.requestDetails.actions.title')}
              </h2>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setShowConfirm('approve')}
                  className="w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700">
                  {t('employee.requestDetails.actions.approve')}
                </button>

                <button
                  onClick={() => setShowConfirm('resubmit')}
                  className="w-full rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100">
                  {t('employee.requestDetails.actions.requestEdit')}
                </button>

                <button
                  onClick={() => setShowConfirm('reject')}
                  className="w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50">
                  {t('employee.requestDetails.actions.reject')}
                </button>
              </div>

              {/* Approving here completes every stage and task at once, so the
                  scope is stated rather than left to be discovered. */}
              <p className="mt-4 text-xs leading-relaxed text-gray-500">
                {t('employee.requestDetails.actions.hint')}
              </p>
            </div>
          )}
</div>

        {/* ── RIGHT ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Workflow Stages */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <History className="w-5 h-5 text-[#1DBAEA]" />
              <h2 className="text-xl font-bold text-[#2B3E8F]">{t('employee.requestDetails.workflow')}</h2>
            </div>
            <div className="space-y-3">
              {stages.map((stage: any) => {
                const stageTasks = tasks.filter((t2: any) => t2.company_stage_id === stage.id);
                return (
                  <div key={stage.id} className={`border rounded-xl overflow-hidden ${
                    stage.status === 'IN_PROGRESS' ? 'border-[#1DBAEA]' :
                    stage.status === 'COMPLETED'   ? 'border-green-200' : 'border-gray-100'
                  }`}>
                    <div className={`flex items-center justify-between px-4 py-3 ${
                      stage.status === 'IN_PROGRESS' ? 'bg-[#1DBAEA]/10' :
                      stage.status === 'COMPLETED'   ? 'bg-green-50' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-[#2B3E8F] text-sm">{getStageName(stage.stage_name)}</span>
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
      {isArabic
  ? (task.task_title_ar || task.task_title)
  : task.task_title}
    </span>

    <div className="flex items-center gap-2">

      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusCls(task.status)}`}
      >
        {statusLabel(task.status)}
      </span>

{canManageTasks &&
 task.task_type !== "license" && (
  <select
    value={task.status}
    onChange={async (e) => {
      try {
        await axios.put(
          `${API}/employee/tasks/${task.id}/status`,
          {
            status: e.target.value,
          },
          { headers }
        );

        fetchDetails();
      } catch (err) {
        console.error(err);
      }
    }}
    className="border rounded px-2 py-1 text-xs"
  >
<option value="PENDING">{t("employee.status.pending")}</option>
<option value="IN_PROGRESS">{t("employee.status.inProgress")}</option>
<option value="COMPLETED">{t("employee.status.completed")}</option>
<option value="REJECTED">{t("employee.status.rejected")}</option>
  </select>
)}

{
canManageTasks &&
task.task_type === "license" && (  <>
    {/* Multiple files per licence: a licence often ships with annexes, and
        the task stays open afterwards so more can be added later. */}
    <input
      type="file"
      multiple
      accept=".pdf,.jpg,.jpeg,.png"
      onChange={(e) => {
        const files = Array.from(e.target.files || []);

        if (!files.length) return;

        setLicenseFiles((prev) => ({
          ...prev,
          [task.id]: files,
        }));
      }}
      className="text-xs"
    />

<button
  className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
  onClick={async () => {

    const files = licenseFiles[task.id] || [];

if (!files.length) {
showToast(t("employee.notifications.selectFileFirst"), "error");
  return;
}

    try {
      // The endpoint takes one file per call, so several selected files are
      // sent in sequence rather than as one multipart body.
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        await axios.post(
          `${API}/employee/tasks/${task.id}/final-license`,
          formData,
          {
            headers: {
              ...headers,
              "Content-Type": "multipart/form-data"
            }
          }
        );
      }

showToast(t("employee.notifications.finalLicenseUploaded"), "success");

setLicenseFiles((prev) => ({ ...prev, [task.id]: [] }));

await fetchDetails();
    } catch (err) {

      console.error(err);

showToast(t("employee.notifications.uploadFailed"), "error");
    }

  }}
>
  {t("employee.notifications.uploadFinalLicense")}
</button>
  </>
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
              <FileText className="w-5 h-5 text-[#1DBAEA]" />
              <h2 className="text-xl font-bold text-[#2B3E8F]">{t('employee.requestDetails.docsTitle')} ({documents.length})</h2>
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
                        <div className="w-10 h-10 bg-[#1DBAEA]/10 rounded-xl flex items-center justify-center">
                          <FileText className="w-5 h-5 text-[#1DBAEA]" />
                        </div>
                        <div>
                          <div>
  <h3 className="font-semibold text-[#2B3E8F] text-sm">
    {doc.file_name}
  </h3>

  <p className="text-xs text-[#1DBAEA] font-medium">
    {doc.task_title}
  </p>

<p className="text-xs text-gray-400 mt-0.5">
  {getStageName(doc.stage_name)} •{" "}
  {new Date(doc.uploaded_at).toLocaleDateString(
    isArabic ? "ar-SA" : "en-US"
  )}
</p>
</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusCls(doc.status)}`}>
                          {statusLabel(doc.status)}
                        </span>
                        {/* R-12: authenticated download — see lib/files.ts */}
                        <button type="button" onClick={() => openDocument(doc.id, "view")} className="p-2 hover:bg-gray-100 rounded-lg transition">
                          <Eye className="w-4 h-4 text-[#2B3E8F]" />
                        </button>
                        <button type="button" onClick={() => openDocument(doc.id, "download")} className="p-2 hover:bg-gray-100 rounded-lg transition">
                          <Download className="w-4 h-4 text-[#2B3E8F]" />
                        </button>
{canManageTasks &&
 doc.status !== "APPROVED" &&
 doc.status !== "NEEDS_RESUBMISSION" && (
  <button
    disabled={processingDocId === doc.id}
    onClick={async () => {
      setProcessingDocId(doc.id);

      try {
        await axios.put(
          `${API}/employee/documents/${doc.id}/approve`,
          {},
          { headers }
        );

showToast(t("notificationsPage.documentApproved"), "success");

        await fetchDetails();
      } catch (err) {
        console.error(err);

showToast(t("employee.notifications.documentApproveFailed"), "error");

      } finally {
        setProcessingDocId(null);
      }
    }}
    className="bg-green-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
  >
{processingDocId === doc.id
  ? t("employee.documents.modal.processing")
  : t("employee.documents.actions.approve")}
    </button>
)}

{canManageTasks &&
 doc.status !== "APPROVED" &&
 doc.status !== "NEEDS_RESUBMISSION" && (
  <button
    disabled={processingDocId === doc.id}
    onClick={() => {
      setSelectedDocumentId(doc.id);
      setNotes("");
      setShowConfirm("documentReject");
    }}
    className="bg-red-600 text-white px-3 py-1 rounded text-xs"
  >
{t("employee.documents.actions.reject")}
  </button>
)}
</div>  
                </div>     

{doc.rejection_reason && (
  <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
    {t("employee.requestDetails.rejectionReason")}:{" "}
    {doc.rejection_reason}
  </div>
)}
             </div>   
              ))}        
            </div>       
          )}            
        </div>           

      </div>             
    </div>              
    <Footer />
  </div>
);
}