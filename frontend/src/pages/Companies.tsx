import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import {
  BuildingIcon,
  SearchIcon,
  MoreHorizontalIcon,
  MapPinIcon,
  CalendarIcon,
  XCircleIcon,
  CheckIcon
} from 'lucide-react';
import { motion } from 'framer-motion';

import { API_URL } from "../config";
import { authHeaders } from "../lib/session";
interface Company {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'pending' | 'suspended';
  registrationDate: string;
  location: string;
  address: string;

  sector: string;
  sector_id: number;
  branches_count: number;
description: string;
founders: string[];

  email: string;
  representativeName: string;
  phoneNumber: string;
  logo?: string;
  currentStage: string;
  progress: number;
}

const initialFormState: Omit<Company, 'logo'> = {
  id: '',
  name: '',
  type: 'commercial',
  status: 'active',
  registrationDate: '',
  location: '',
  address: '',
  sector: '1',
  sector_id: 1,
  email: '',
  representativeName: '',
  phoneNumber: '',
  currentStage: 'registration',
progress: 25,

branches_count: 0,
description: '',
founders: []};

export const Companies: React.FC = () => {

  const { t, language } = useAppContext();

  const isRtl = language === 'ar';

  const [filter, setFilter] = useState<
    'all' | 'active' | 'pending' | 'suspended'
  >('all');

  const [searchQuery, setSearchQuery] = useState('');

  const [viewCompany, setViewCompany] = useState<Company | null>(null);

  const [editCompany, setEditCompany] = useState<Company | null>(null);

  const [viewProgress, setViewProgress] = useState<Company | null>(null);

  const [formState, setFormState] =
    useState<Omit<Company, 'logo'>>(initialFormState);

  const [formErrors, setFormErrors] =
    useState<Record<string, string>>({});

  const [dropdownOpen, setDropdownOpen] =
    useState<string | null>(null);

  const [companies, setCompanies] =
    useState<Company[]>([]);

  // Result of the last PUT /companies/:id. The modal stays open on failure.
  const [saveError, setSaveError] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  // ================= FETCH COMPANIES =================

  useEffect(() => {

    fetchCompanies();

  }, []);

  const fetchCompanies = async () => {

    try {

      const response = await fetch(
        `${API_URL}/auth/companies`,
        {
          headers: authHeaders()
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error('Failed to load companies:', data?.message);
        return;
      }

      setCompanies(
        (data.companies || []).map((company: any) => ({

          id: String(company.id),

          name: company.name || '',

          type:
  language === 'ar'
    ? company.name_ar
    : company.name_en,

status:
  company.status === 'APPROVED'
    ? 'active'
    : ["UNDER_REVIEW", "PENDING"].includes(company.status)
    ? 'pending'
    : 'suspended',

registrationDate: company.created_at || '',

          location: company.country || '',
branches_count: company.branches_count || 0,
description: company.description || '',
founders: company.founders || [],
          address: company.country || '',
sector_id: company.sector_id,
sector:
  company.sector_id === 1
    ? "Entrepreneurial"
    : company.sector_id === 2
    ? "Industrial"
    : company.sector_id === 3
    ? "Commercial"
    : company.sector_id === 4
    ? "Real Estate"
    : "",

          email: company.email || '',

          representativeName:
            company.manager_name || '',

          phoneNumber: company.phone || '',

          logo: company.logo_url || '',

currentStage:
  company.current_stage?.toLowerCase().replace(
    /\s+/g,
    '_'
  ) || 'registration',

progress:
  company.total_stages > 0
    ? Math.round(
        (company.completed_stages /
          company.total_stages) *
          100
      )
    : 0,

        }))
      );

    } catch (error) {

      console.error(error);

    }

  };

  const getStatusColor = (status: string) => {

    switch (status) {

      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';

      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';

      case 'suspended':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';

      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';

    }

  };

const sectorOptions = [
  { value: 1, label: 'entrepreneurial' },
  { value: 2, label: 'industrial' },
  { value: 3, label: 'commercial' },
  { value: 4, label: 'realEstate' }
];

  const statusOptions = [
    { value: 'all' as const, label: 'all' },
    { value: 'active' as const, label: 'statusActive' },
    { value: 'pending' as const, label: 'statusPending' },
    { value: 'suspended' as const, label: 'statusDisabled' }
  ];

  // The status tabs and the search box are independent filters: both must hold
  // for a company to stay in the list (same shape as Requests.tsx).
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredCompanies = companies.filter((company) => {
    if (filter !== 'all' && company.status !== filter) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return [
      company.name,
      company.email,
      company.representativeName,
      company.location,
      company.sector,
      company.phoneNumber
    ].some((field) =>
      String(field ?? '').toLowerCase().includes(normalizedQuery)
    );
  });

  const openCompanyProfile = (company: Company) => {

    setViewCompany(company);

    setDropdownOpen(null);

  };

const stagesList = [
  'registration',
  'compliance',
  'licensing',
  'final_approval'
];

  const closeProfileModal = () => {

    setViewCompany(null);

  };

  const openEditCompany = (company: Company) => {

    setEditCompany(company);

    setDropdownOpen(null);

setFormState({
  ...company,
  sector_id: company.sector_id
});
    setFormErrors({});

  };

  const closeEditModal = () => {

    setEditCompany(null);

    setFormErrors({});

    setSaveError('');

  };

  const closeProgressModal = () => {

    setViewProgress(null);

  };

  const toggleDropdown = (companyId: string) => {

    setDropdownOpen(
      dropdownOpen === companyId
        ? null
        : companyId
    );

  };

  const handleAction = (
    action: 'view' | 'edit' | 'progress',
    company: Company
  ) => {

    if (action === 'view') {

      openCompanyProfile(company);

    } else if (action === 'edit') {

      openEditCompany(company);

    } else if (action === 'progress') {

      setViewProgress(company);

      setDropdownOpen(null);

    }

  };

  const getStatusLabel = (
    status: Company['status']
  ) => {

    switch (status) {

      case 'active':
        return t('statusActive' as any);

      case 'pending':
        return t('statusPending' as any);

      case 'suspended':
        return t('statusDisabled' as any);

      default:
        return status;

    }

  };

const handleFormChange = (
  field: keyof Omit<Company, 'logo'>,
  value: any
) => {

    setFormState((prev) => ({
      ...prev,
      [field]: value
    }));

  };

  const validateForm = () => {

    const errors: Record<string, string> = {};

    if (!formState.name)
      errors.name = 'Required';

    if (!formState.email)
      errors.email = 'Required';

    if (!formState.phoneNumber)
      errors.phoneNumber = 'Required';

    return errors;

  };

  const handleSaveChanges = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();

    setSaveError('');

    const errors = validateForm();

    if (Object.keys(errors).length) {

      setFormErrors(errors);

      return;

    }

    if (!editCompany) return;

    setIsSaving(true);

    try {
      const response = await fetch(
        `${API_URL}/companies/${editCompany.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders()
          },
          body: JSON.stringify({
            name: formState.name,
            manager_name: formState.representativeName,
            country: formState.address,
            sector_id: formState.sector_id,

            status:
              formState.status === 'active'
                ? 'APPROVED'
                : formState.status === 'pending'
                ? 'UNDER_REVIEW'
                : 'REJECTED',

            phone: formState.phoneNumber,
            email: formState.email,

            branches_count: formState.branches_count,
            description: formState.description,
            founders: formState.founders
          })
        }
      );

      const result = await response.json().catch(() => ({}));

      // The save used to be trusted unconditionally: the response body was only
      // console.logged, local state was updated optimistically and the modal
      // closed. A rejected status change then "reverted" on the next refresh.
      // Keep the modal open and surface the server's message instead.
      if (!response.ok) {
        setSaveError(result?.message || t('updateFailed'));
        return;
      }

      // Re-read from the server so what is displayed is what was persisted,
      // rather than the values we hoped were written.
      await fetchCompanies();

      closeEditModal();

    } catch (error) {

      console.error(error);

      setSaveError(t('networkError'));

    } finally {

      setIsSaving(false);

    }

  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy dark:text-cream-dark mb-2">
            {t('companies')}
          </h1>
<p className="text-gray-500 dark:text-gray-400">
  {t("companiesDescription")}
</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center bg-white dark:bg-navy-card rounded-xl px-4 py-2.5 border border-gray-200 dark:border-navy-light focus-within:border-gold/50 transition-colors flex-1 sm:w-64">
            <SearchIcon size={18} className="text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t('searchCompanies')}
              aria-label={t('searchCompanies')}
              className="bg-transparent border-none outline-none px-3 w-full text-sm text-navy dark:text-cream-dark placeholder-gray-400" />

          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`rounded-2xl px-4 py-2 text-sm font-medium transition-colors ${filter === option.value ? 'bg-navy text-white dark:bg-navy-light dark:text-cream-dark shadow-md' : 'bg-white dark:bg-navy-card text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-navy-light hover:border-gold/30 hover:text-gold'}`}>
            {t(option.label as any)}
          </button>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="bg-white dark:bg-navy-card rounded-2xl border border-dashed border-gray-200 dark:border-navy-light py-16 px-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-navy/5 dark:bg-cream/5 text-gray-400">
            <SearchIcon size={22} />
          </div>
          <p className="text-lg font-semibold text-navy dark:text-cream-dark">
            {t('noResultsFound')}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('noResultsHint')}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCompanies.map((company, index) =>
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: index * 0.05
          }}
          key={company.id}
          className="bg-white dark:bg-navy-card rounded-2xl p-6 shadow-sm border border-transparent hover:border-gold/30 transition-all duration-300 group flex flex-col">
          
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-navy/5 dark:bg-cream/5 flex items-center justify-center text-navy dark:text-cream-dark group-hover:scale-110 transition-transform duration-300">
                <BuildingIcon size={24} />
              </div>
              <button
                type="button"
                onClick={() => toggleDropdown(company.id)}
                className={`p-1.5 text-gray-400 hover:text-navy dark:hover:text-cream-dark rounded-md transition-colors relative ${isRtl ? 'order-first' : 'order-last'}`}>
                <MoreHorizontalIcon size={20} />
                {dropdownOpen === company.id && (
                  <div className={`absolute top-full ${isRtl ? 'right-0' : 'left-0'} mt-2 w-48 bg-white dark:bg-navy-card rounded-xl shadow-lg border border-gray-200 dark:border-navy-light z-10`}>
                    <button
                      type="button"
                      onClick={() => handleAction('view', company)}
                      className="w-full text-left px-4 py-3 text-sm text-navy dark:text-cream-dark hover:bg-gray-50 dark:hover:bg-navy-light/20 transition-colors rounded-t-xl">
                      {t('viewCompanyProfile' as any)}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction('progress', company)}
                      className="w-full text-left px-4 py-3 text-sm text-navy dark:text-cream-dark hover:bg-gray-50 dark:hover:bg-navy-light/20 transition-colors">
                      {t('viewProgress' as any)}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction('edit', company)}
                      className="w-full text-left px-4 py-3 text-sm text-navy dark:text-cream-dark hover:bg-gray-50 dark:hover:bg-navy-light/20 transition-colors rounded-b-xl">
                      {t('editCompany' as any)}
                    </button>
                  </div>
                )}
              </button>
            </div>

            <div className="mb-4 flex-1">
              <h3
              className="text-lg font-bold text-navy dark:text-cream-dark mb-1 truncate"
              title={company.name}>
              
                {company.name}
              </h3>
<span className="inline-block px-2.5 py-1 bg-gray-100 dark:bg-navy-light/30 text-gray-600 dark:text-gray-300 rounded-md text-xs font-medium capitalize mb-3">
  {t(company.sector as any)}
</span>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <MapPinIcon size={14} />
                  <span className="truncate">{company.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <CalendarIcon size={14} />
                  <span>
  {company.registrationDate
    ? new Date(company.registrationDate).toLocaleDateString(
        language === "ar" ? "ar-SA" : "en-US"
      )
    : ""}
</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-navy-light">
              <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}>
              
                {getStatusLabel(company.status)}
              </span>
              <button
                type="button"
                onClick={() => openCompanyProfile(company)}
                className="text-sm font-medium text-gold hover:text-gold-dark transition-colors">
                {t('viewCompanyProfile' as any)}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {viewCompany && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeProfileModal}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-3xl rounded-3xl bg-white dark:bg-navy-card border border-gray-200 dark:border-navy-light shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-navy-light p-6">
              <div>
                <h2 className="text-2xl font-semibold text-navy dark:text-cream-dark">
                  {viewCompany.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('viewCompanyProfile' as any)}
                </p>
              </div>
              <button
                type="button"
                onClick={closeProfileModal}
                className="rounded-full p-2 text-gray-400 hover:text-navy dark:hover:text-cream-dark transition-colors">
                <XCircleIcon size={20} />
              </button>
            </div>
            <div className="grid gap-6 p-6 sm:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                    {t('name')}
                  </p>
                  <p className="mt-2 text-sm font-medium text-navy dark:text-cream-dark">
                    {viewCompany.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                    {t('email')}
                  </p>
                  <p className="mt-2 text-sm font-medium text-navy dark:text-cream-dark">
                    {viewCompany.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                    {t('address')}
                  </p>
                  <p className="mt-2 text-sm font-medium text-navy dark:text-cream-dark">
                    {viewCompany.address}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                    {t('sector')}
                  </p>
                  <p className="mt-2 text-sm font-medium text-navy dark:text-cream-dark">
<p className="mt-2 text-sm font-medium text-navy dark:text-cream-dark">
  {language === "ar"
    ? viewCompany.sector === "Entrepreneurial"
      ? "ريادي"
      : viewCompany.sector === "Industrial"
      ? "صناعي"
      : viewCompany.sector === "Commercial"
      ? "تجاري"
      : viewCompany.sector === "Real Estate"
      ? "عقاري"
      : viewCompany.sector
    : viewCompany.sector}
</p>
</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                    {t('status')}
                  </p>
                  <p className="mt-2 text-sm font-medium text-navy dark:text-cream-dark">
                    {getStatusLabel(viewCompany.status)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                    {t('representativeName')}
                  </p>
                  <p className="mt-2 text-sm font-medium text-navy dark:text-cream-dark">
                    {viewCompany.representativeName}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                    {t('phoneNumber')}
                  </p>
                  <p className="mt-2 text-sm font-medium text-navy dark:text-cream-dark">
                    {viewCompany.phoneNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                    {t('relatedInfo')}
                  </p>
                  <p className="mt-2 text-sm font-medium text-navy dark:text-cream-dark">
                    {t("type")}: {t(viewCompany.type as any)} ·
                    {t("registered")}:{" "}
{viewCompany.registrationDate
  ? new Date(viewCompany.registrationDate).toLocaleDateString(
      language === "ar" ? "ar-SA" : "en-US"
    )
  : ""}
                   </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      {editCompany && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeEditModal}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-3xl rounded-3xl bg-white dark:bg-navy-card border border-gray-200 dark:border-navy-light shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-navy-light p-6">
              <div>
                <h2 className="text-2xl font-semibold text-navy dark:text-cream-dark">
                  {t('editCompany' as any)}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-full p-2 text-gray-400 hover:text-navy dark:hover:text-cream-dark transition-colors">
                <XCircleIcon size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveChanges} className="space-y-6 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">{t('name')}</span>
                  <input
                    value={formState.name}
                    onChange={(event) => handleFormChange('name', event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-navy dark:border-navy-light dark:bg-navy-card dark:text-cream-dark outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/20"
                  />
                  {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
                </label>
                <label className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">{t('email')}</span>
                  <input
                    type="email"
                    value={formState.email}
                    onChange={(event) => handleFormChange('email', event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-navy dark:border-navy-light dark:bg-navy-card dark:text-cream-dark outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/20"
                  />
                  {formErrors.email && <p className="text-xs text-red-500">{formErrors.email}</p>}
                </label>
                <label className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">{t('address')}</span>
                  <input
                    name="address"
                    value={formState.address}
                    onChange={(event) => handleFormChange('address', event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-navy dark:border-navy-light dark:bg-navy-card dark:text-cream-dark outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/20"
                  />
                  {formErrors.address && <p className="text-xs text-red-500">{formErrors.address}</p>}
                </label>
                <label className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">{t('sector')}</span>
                  <select
                    name="sector"
                    value={formState.sector_id}
onChange={(event) =>
  handleFormChange(
    'sector_id',
    Number(event.target.value)
  )
}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-navy dark:border-navy-light dark:bg-navy-card dark:text-cream-dark outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/20">
                    {sectorOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {t(option.label as any)}
                      </option>
                    ))}
                  </select>
                  {formErrors.sector && <p className="text-xs text-red-500">{formErrors.sector}</p>}
                </label>
               <label className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
<span className="font-medium">
  {t("numberOfBranches")}
</span>
  <input
    type="number"
    value={formState.branches_count}
    onChange={(e) =>
      handleFormChange(
        "branches_count",
        Number(e.target.value)
      )
    }
    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm"
  />
</label>

<label className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
<span className="font-medium">
  {t("companyDescription")}
</span>

  <textarea
    value={formState.description}
    onChange={(e) =>
      handleFormChange(
        "description",
        e.target.value
      )
    }
    rows={4}
    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm"
  />
</label>

<label className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
<span className="font-medium">
  {t("companyFounders")}
</span>

  <input
    type="text"
    value={formState.founders.join(", ")}
    onChange={(e) =>
      handleFormChange(
        "founders",
        e.target.value
          .split(",")
          .map((x) => x.trim())
      )
    }
placeholder={t("foundersPlaceholder")}
    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm"
  />
</label>
                <label className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">{t('representativeName')}</span>
                  <input
                    value={formState.representativeName}
                    onChange={(event) => handleFormChange('representativeName', event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-navy dark:border-navy-light dark:bg-navy-card dark:text-cream-dark outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/20"
                  />
                  {formErrors.representativeName && <p className="text-xs text-red-500">{formErrors.representativeName}</p>}
                </label>
                <label className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">{t('phoneNumber')}</span>
                  <input
                    value={formState.phoneNumber}
                    onChange={(event) => handleFormChange('phoneNumber', event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-navy dark:border-navy-light dark:bg-navy-card dark:text-cream-dark outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/20"
                  />
                  {formErrors.phoneNumber && <p className="text-xs text-red-500">{formErrors.phoneNumber}</p>}
                </label>
                <label className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">{t('status')}</span>
                  <select
                    value={formState.status}
                    onChange={(event) => handleFormChange('status', event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-navy dark:border-navy-light dark:bg-navy-card dark:text-cream-dark outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/20">
                    {statusOptions
                      .filter((option) => option.value !== 'all')
                      .map((option) => (
                        <option key={option.value} value={option.value}>
                          {t(option.label as any)}
                        </option>
                      ))}
                  </select>
                  {formErrors.status && <p className="text-xs text-red-500">{formErrors.status}</p>}
                </label>
              </div>
              {saveError ? (
                <div
                  role="alert"
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-200">
                  {saveError}
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-navy-light">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-600 dark:border-navy-light dark:bg-navy-card dark:text-gray-300 hover:bg-gray-50 transition-colors">
                  {t('cancel' as any)}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-2xl bg-gold px-5 py-3 text-sm font-medium text-white hover:bg-gold-dark transition-colors disabled:cursor-not-allowed disabled:opacity-60">
                  {t('saveChanges' as any)}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
      {viewProgress && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeProgressModal}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-3xl rounded-3xl bg-white dark:bg-navy-card border border-gray-200 dark:border-navy-light shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-navy-light p-6">
              <div>
                <h2 className="text-2xl font-semibold text-navy dark:text-cream-dark">
                  {viewProgress.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('viewProgress' as any)}
                </p>
              </div>
              <button
                type="button"
                onClick={closeProgressModal}
                className="rounded-full p-2 text-gray-400 hover:text-navy dark:hover:text-cream-dark transition-colors">
                <XCircleIcon size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-navy dark:text-cream-dark mb-2">
{t("progress")}: {viewProgress.progress}%
                </h3>
                <div className="relative w-full h-2 bg-gray-100 dark:bg-navy-light rounded-full">
                  <div
                    className="absolute top-0 left-0 h-full bg-gold rounded-full transition-all duration-1000"
                    style={{ width: `${viewProgress.progress}%` }}>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-navy dark:text-cream-dark">
                  {t('onboardingProgress')}
                </h4>
                <div className="relative">
                  <div className="absolute top-1/2 left-0 w-full h-1.5 bg-gray-100 dark:bg-navy-light -translate-y-1/2 rounded-full z-0"></div>
                  <div
                    className={`absolute top-1/2 ${isRtl ? 'right-0' : 'left-0'} h-1.5 bg-gold -translate-y-1/2 rounded-full z-0 transition-all duration-1000`}
style={{
  width: `${(
    stagesList.indexOf(
      viewProgress.currentStage?.toLowerCase()
    ) /
    (stagesList.length - 1)
  ) * 100}%`
}}
>
                  </div>
                  <div className="relative z-10 flex justify-between">
                    {[
                      { id: 1, label: 'registration' },
                      { id: 2, label: 'compliance' },
                      { id: 3, label: 'licensing' },
                      { id: 4, label: 'final_approval' }
                    ].map((stage) => {

                      const stageIndex = [
                        'registration',
                        'compliance',
                        'licensing',
                        'final_approval'
                      ].indexOf(viewProgress.currentStage);

                      const isCompleted = stage.id - 1 < stageIndex;
const isCurrent = stage.id - 1 === stageIndex;

                      return (
                        <div key={stage.id} className="flex flex-col items-center gap-3">
<div
  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${
    isCompleted
  ? 'bg-gold text-white'
  : isCurrent
  ? 'bg-gold/20 text-gold border-gold'
  : 'bg-gray-200 dark:bg-navy-light text-gray-400'
  }`}
>
                            {isCompleted ? (
                              <CheckIcon size={16} className="font-bold" />
                            ) : (
                              <span>{stage.id}</span>
                            )}
                          </div>
                          <span
                            className={`text-sm font-medium ${
                              isCompleted || isCurrent
                                ? 'text-navy dark:text-cream-dark'
                                : 'text-gray-400'
                            }`}>
                            {t(stage.label as any)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>);

};