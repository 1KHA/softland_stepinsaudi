import React, { useCallback, useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { InboxIcon, SearchIcon, XCircleIcon } from 'lucide-react';
import { motion } from 'framer-motion';

import { SpectrumBar } from '../components/StepInLogo';
import { TranslationKey } from '../translations';
import { API_URL } from '../config';
import { authHeaders } from '../lib/session';

// Rows come back from the API in the database's snake_case, unchanged.
interface Application {
  id: number;
  profile?: string | null;
  home_market?: string | null;
  company?: string | null;
  website?: string | null;
  linkedin?: string | null;
  size?: string | null;
  activity?: string | null;
  stage?: string | null;
  capital?: string | null;
  saudi?: string | null;
  timeline?: string | null;
  file_url?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  dial?: string | null;
  phone?: string | null;
  role?: string | null;
  consent?: boolean | null;
  status?: string | null;
  admin_note?: string | null;
  reviewed_by?: number | null;
  reviewed_at?: string | null;
  created_at?: string | null;
}

const STATUSES = ['NEW', 'REVIEWING', 'CONTACTED', 'CONVERTED', 'REJECTED'] as const;
type ApplicationStatus = (typeof STATUSES)[number];

const STATUS_LABEL: Record<ApplicationStatus, TranslationKey> = {
  NEW: 'appStatusNew',
  REVIEWING: 'appStatusReviewing',
  CONTACTED: 'appStatusContacted',
  CONVERTED: 'appStatusConverted',
  REJECTED: 'appStatusRejected'
};

const STATUS_STYLE: Record<ApplicationStatus, string> = {
  NEW: 'bg-brand-cyan/15 text-brand-blue',
  REVIEWING: 'bg-amber-100 text-amber-700',
  CONTACTED: 'bg-blue-100 text-blue-700',
  CONVERTED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700'
};

const PAGE_SIZE = 20;

export const Applications: React.FC = () => {
  const { t, language } = useAppContext();
  const isRtl = language === 'ar';

  const [applications, setApplications] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'' | ApplicationStatus>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [flash, setFlash] = useState('');

  // Detail drawer state.
  const [selected, setSelected] = useState<Application | null>(null);
  const [draftStatus, setDraftStatus] = useState<ApplicationStatus>('NEW');
  const [draftNote, setDraftNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Typing in the search box should not fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setAppliedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // A new filter or search term starts at the first page again.
  useEffect(() => {
    setPage(1);
  }, [appliedSearch, statusFilter]);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (appliedSearch) params.set('search', appliedSearch);
      params.set('page', String(page));
      params.set('limit', String(PAGE_SIZE));

      const response = await fetch(`${API_URL}/applications?${params.toString()}`, {
        headers: authHeaders()
      });

      const data = await response.json().catch(() => ({} as any));

      // Never render a list as "empty" when the request actually failed —
      // surface what the server said instead.
      if (!response.ok || data?.success === false) {
        setApplications([]);
        setTotal(0);
        setLoadError(data?.message || t('applicationsLoadFailed'));
        return;
      }

      const rows: Application[] = Array.isArray(data?.applications) ? data.applications : [];
      setApplications(rows);
      setTotal(typeof data?.total === 'number' ? data.total : rows.length);
    } catch (error) {
      console.error(error);
      setApplications([]);
      setTotal(0);
      setLoadError(t('networkError'));
    } finally {
      setLoading(false);
    }
    // `t` is rebuilt on every render by AppContext, so it is deliberately not a
    // dependency here — including it would refetch in a loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, appliedSearch, page]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Same shape as Requests.tsx: a derivation over the rows we hold. The server
  // is asked to filter too; this is the safety net that keeps the box working
  // (and keeps status tabs honest) whatever the server does with the params.
  const filteredApplications = applications.filter((application) => {
    if (statusFilter && application.status !== statusFilter) return false;

    if (appliedSearch) {
      const query = appliedSearch.toLowerCase();
      const name = `${application.first_name || ''} ${application.last_name || ''}`.trim();

      return (
        application.company?.toLowerCase().includes(query) ||
        name.toLowerCase().includes(query) ||
        application.email?.toLowerCase().includes(query) ||
        String(application.id).includes(query)
      );
    }

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = Boolean(statusFilter || appliedSearch);

  const openDetail = async (application: Application) => {
    setSelected(application);
    setDraftStatus((STATUSES as readonly string[]).includes(application.status || '')
      ? (application.status as ApplicationStatus)
      : 'NEW');
    setDraftNote(application.admin_note || '');
    setSaveError('');

    // The list row is shown immediately; refresh it from the detail endpoint so
    // the drawer reflects what is actually stored.
    try {
      const response = await fetch(`${API_URL}/applications/${application.id}`, {
        headers: authHeaders()
      });

      const data = await response.json().catch(() => ({} as any));

      if (!response.ok || data?.success === false || !data?.application) return;

      const fresh: Application = data.application;
      setSelected(fresh);
      setDraftStatus((STATUSES as readonly string[]).includes(fresh.status || '')
        ? (fresh.status as ApplicationStatus)
        : 'NEW');
      setDraftNote(fresh.admin_note || '');
    } catch (error) {
      console.error(error);
    }
  };

  const closeDetail = () => {
    setSelected(null);
    setSaveError('');
    setIsSaving(false);
  };

  const saveDetail = async () => {
    if (!selected) return;

    setIsSaving(true);
    setSaveError('');

    try {
      const response = await fetch(`${API_URL}/applications/${selected.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify({ status: draftStatus, admin_note: draftNote })
      });

      const data = await response.json().catch(() => ({} as any));

      if (!response.ok || data?.success === false) {
        setSaveError(data?.message || t('updateFailed'));
        return;
      }

      // Re-read the list rather than patching local state optimistically.
      await fetchApplications();
      setFlash(t('applicationUpdated'));
      closeDetail();
    } catch (error) {
      console.error(error);
      setSaveError(t('networkError'));
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(''), 4000);
    return () => clearTimeout(timer);
  }, [flash]);

  const formatDate = (value?: string | null) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';

    return date.toLocaleString(isRtl ? 'ar-SA' : 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusBadge = (status?: string | null) => {
    const known = (STATUSES as readonly string[]).includes(status || '')
      ? (status as ApplicationStatus)
      : null;

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          known ? STATUS_STYLE[known] : 'bg-gray-100 text-gray-600'
        }`}>
        {known ? t(STATUS_LABEL[known]) : status || '—'}
      </span>
    );
  };

  const tabs: Array<{ value: '' | ApplicationStatus; label: TranslationKey }> = [
    { value: '', label: 'all' },
    ...STATUSES.map((status) => ({ value: status, label: STATUS_LABEL[status] }))
  ];

  const Field = ({ label, value }: { label: TranslationKey; value?: React.ReactNode }) => (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
        {t(label)}
      </p>
      <p className="mt-1.5 text-sm font-medium text-navy dark:text-cream-dark break-words">
        {value === undefined || value === null || value === ''
          ? <span className="text-gray-400 font-normal">{t('notProvided')}</span>
          : value}
      </p>
    </div>
  );

  const Section = ({ title, children }: { title: TranslationKey; children: React.ReactNode }) => (
    <div className="rounded-2xl border border-gray-100 dark:border-navy-light p-5">
      <h3 className="text-sm font-semibold text-brand-navy dark:text-cream-dark mb-4">
        {t(title)}
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );

  return (
    <div className="space-y-8 pb-8" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy dark:text-cream-dark mb-2">
            {t('applications')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t('applicationsDescription')}
          </p>
          <SpectrumBar className="mt-3 max-w-[220px]" />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center bg-white dark:bg-navy-card rounded-xl px-4 py-2.5 border border-gray-200 dark:border-navy-light focus-within:border-brand-cyan/50 transition-colors flex-1 sm:w-72">
            <SearchIcon size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder={t('searchApplications')}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="bg-transparent border-none outline-none px-3 w-full text-sm text-navy dark:text-cream-dark placeholder-gray-400" />
          </div>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.value || 'ALL'}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                isActive
                  ? 'bg-brand-navy text-white border-brand-navy'
                  : 'bg-white dark:bg-navy-card text-gray-600 dark:text-gray-300 border-gray-200 dark:border-navy-light hover:border-brand-cyan/60 hover:text-brand-blue'
              }`}>
              {t(tab.label)}
            </button>
          );
        })}
      </div>

      {flash && (
        <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm font-medium text-green-700">
          {flash}
        </div>
      )}

      {loadError && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-medium text-red-700">
          {loadError}
        </div>
      )}

      {/* List */}
      <div className="bg-white dark:bg-navy-card rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-navy-light/20 text-gray-500 dark:text-gray-400 text-sm border-b border-gray-100 dark:border-navy-light">
                <th className="px-6 py-4 font-medium">{t('company')}</th>
                <th className="px-6 py-4 font-medium">{t('applicant')}</th>
                <th className="px-6 py-4 font-medium">{t('email')}</th>
                <th className="px-6 py-4 font-medium">{t('status')}</th>
                <th className="px-6 py-4 font-medium">{t('submittedAt')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-navy-light text-sm">
              {filteredApplications.map((application) => (
                <tr
                  key={application.id}
                  onClick={() => openDetail(application)}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-navy-light/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <InboxIcon size={16} className="text-gray-400" />
                      <span className="font-medium text-navy dark:text-cream-dark">
                        {application.company || '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {`${application.first_name || ''} ${application.last_name || ''}`.trim() || '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300" dir="ltr">
                    {application.email || '—'}
                  </td>
                  <td className="px-6 py-4">{statusBadge(application.status)}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {formatDate(application.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            {t('loading')}
          </div>
        )}

        {!loading && filteredApplications.length === 0 && !loadError && (
          <div className="px-6 py-14 text-center">
            <InboxIcon size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-base font-semibold text-navy dark:text-cream-dark">
              {hasFilters ? t('noResultsFound') : t('noApplications')}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {hasFilters ? t('noResultsHint') : t('noApplicationsHint')}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {`${t('page')} ${page} / ${totalPages}`}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-navy-card border border-gray-200 dark:border-navy-light text-navy dark:text-cream-dark disabled:opacity-40 disabled:cursor-not-allowed hover:border-brand-cyan/60 transition-colors">
              {t('previous')}
            </button>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-navy-card border border-gray-200 dark:border-navy-light text-navy dark:text-cream-dark disabled:opacity-40 disabled:cursor-not-allowed hover:border-brand-cyan/60 transition-colors">
              {t('next')}
            </button>
          </div>
        </div>
      )}

      {/* Detail drawer */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={closeDetail}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => event.stopPropagation()}
            dir={isRtl ? 'rtl' : 'ltr'}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-navy-card border border-gray-200 dark:border-navy-light shadow-2xl">
            <SpectrumBar />

            <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-navy-light p-6">
              <div>
                <h2 className="text-2xl font-semibold text-navy dark:text-cream-dark">
                  {selected.company || t('applicationDetails')}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {`${t('submittedAt')}: ${formatDate(selected.created_at)}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {statusBadge(selected.status)}
                <button
                  type="button"
                  onClick={closeDetail}
                  className="rounded-full p-2 text-gray-400 hover:text-navy dark:hover:text-cream-dark transition-colors">
                  <XCircleIcon size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <Section title="appSectionProfile">
                <Field label="appProfile" value={selected.profile} />
                <Field label="appHomeMarket" value={selected.home_market} />
              </Section>

              <Section title="appSectionCompany">
                <Field label="company" value={selected.company} />
                <Field label="appActivity" value={selected.activity} />
                <Field
                  label="appWebsite"
                  value={selected.website ? (
                    <a href={selected.website} target="_blank" rel="noreferrer" dir="ltr" className="text-brand-blue hover:text-brand-cyan">
                      {selected.website}
                    </a>
                  ) : null} />
                <Field
                  label="appLinkedin"
                  value={selected.linkedin ? (
                    <a href={selected.linkedin} target="_blank" rel="noreferrer" dir="ltr" className="text-brand-blue hover:text-brand-cyan">
                      {selected.linkedin}
                    </a>
                  ) : null} />
                <Field label="appSize" value={selected.size} />
              </Section>

              <Section title="appSectionPlans">
                <Field label="appStage" value={selected.stage} />
                <Field label="appCapital" value={selected.capital} />
                <Field label="appSaudi" value={selected.saudi} />
                <Field label="appTimeline" value={selected.timeline} />
                <Field label="appFile" value={selected.file_url} />
              </Section>

              <Section title="appSectionContact">
                <Field label="appFirstName" value={selected.first_name} />
                <Field label="appLastName" value={selected.last_name} />
                <Field
                  label="email"
                  value={selected.email ? (
                    <a href={`mailto:${selected.email}`} dir="ltr" className="text-brand-blue hover:text-brand-cyan">
                      {selected.email}
                    </a>
                  ) : null} />
                <Field
                  label="phoneNumber"
                  value={selected.phone ? (
                    <span dir="ltr">{`${selected.dial || ''} ${selected.phone}`.trim()}</span>
                  ) : null} />
                <Field label="role" value={selected.role} />
                <Field label="appConsent" value={selected.consent ? t('yes') : t('no')} />
              </Section>

              {/* Review controls */}
              <div className="rounded-2xl border border-gray-100 dark:border-navy-light p-5 space-y-4">
                <div className="max-w-xs">
                  <label className="block text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-2">
                    {t('status')}
                  </label>
                  <select
                    value={draftStatus}
                    onChange={(event) => setDraftStatus(event.target.value as ApplicationStatus)}
                    className="w-full rounded-xl border border-gray-200 dark:border-navy-light bg-white dark:bg-navy-card px-3 py-2.5 text-sm text-navy dark:text-cream-dark focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 outline-none transition-colors">
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {t(STATUS_LABEL[status])}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-2">
                    {t('adminNote')}
                  </label>
                  <textarea
                    rows={4}
                    value={draftNote}
                    onChange={(event) => setDraftNote(event.target.value)}
                    placeholder={t('adminNotePlaceholder')}
                    className="w-full rounded-xl border border-gray-200 dark:border-navy-light bg-white dark:bg-navy-card px-3 py-2.5 text-sm text-navy dark:text-cream-dark placeholder-gray-400 focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 outline-none transition-colors" />
                </div>

                {saveError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-medium text-red-700">
                    {saveError}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 dark:border-navy-light p-6">
              <button
                type="button"
                onClick={closeDetail}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-navy-light/30 hover:bg-gray-200 dark:hover:bg-navy-light/50 transition-colors">
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={saveDetail}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-navy hover:bg-brand-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {isSaving ? t('saving') : t('saveChanges')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Applications;
