import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import {
  FileTextIcon,
  SearchIcon,
  FilterIcon,
 } from
'lucide-react';
import { motion } from 'framer-motion';

import { API_URL } from "../config";
export const Requests: React.FC = () => {
  const { t, language } = useAppContext();
  const navigate = useNavigate();
  const isRtl = language === 'ar';
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
  fetchRequests();
}, []);

const fetchRequests = async () => {
  try {

    const token = localStorage.getItem('token');

    const response = await fetch(
      `${API_URL}/employee/requests`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    if (data.success) {
      setRequests(data.requests);
    }

  } catch (error) {
    console.error(error);
  }
};

const statusOptions = [
  { value: 'APPROVED', label: 'statusApproved' },
  { value: 'UNDER_REVIEW', label: 'statusUnderReview' },
  { value: 'REJECTED', label: 'statusRejected' },
  { value: 'NEEDS_COMPLETION', label: 'needsCompletion' }
];

  const filteredRequests = requests.filter((request) => {
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(request.status)) {
      return false;
    }
    if (startDate && request.created_at < startDate) return false;
if (endDate && request.created_at > endDate) return false;

if (searchQuery) {
  const query = searchQuery.toLowerCase();

  return (
    request.company_name?.toLowerCase().includes(query) ||
    String(request.id).includes(query) ||
    request.current_stage_name?.toLowerCase().includes(query)
  );
}
    return true;
  });

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleApplyFilters = () => {
    setFilterDropdownOpen(false);
  };

  const handleResetFilters = () => {
    setSelectedStatuses([]);
    setStartDate('');
    setEndDate('');
    setFilterDropdownOpen(false);
  };

  const hasActiveFilters = selectedStatuses.length > 0 || startDate || endDate;

const formatLastUpdated = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();

  const isToday =
    date.toDateString() === now.toDateString();

  if (isToday) {
return `${t("today")} • ${date.toLocaleTimeString(
  isRtl ? "ar-SA" : "en-US",
  {
    hour: "2-digit",
    minute: "2-digit",
  }
)}`;
  }

  return date.toLocaleString(
    isRtl ? "ar-SA" : "en-US",
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return 'bg-green-100 text-green-700';

    case 'UNDER_REVIEW':
      return 'bg-yellow-100 text-yellow-700';

    case 'REJECTED':
      return 'bg-red-100 text-red-700';

    default:
      return 'bg-blue-100 text-blue-700';
  }
};

  return (
    <div className="space-y-8 pb-8" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy dark:text-cream-dark mb-2">
            {t('requests')}
          </h1>
<p className="text-gray-500 dark:text-gray-400">
  {t("requestsDescription")}
</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto relative">
          <div className="flex items-center bg-white dark:bg-navy-card rounded-xl px-4 py-2.5 border border-gray-200 dark:border-navy-light focus-within:border-gold/50 transition-colors flex-1 sm:w-64">
            <SearchIcon size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none px-3 w-full text-sm text-navy dark:text-cream-dark placeholder-gray-400" />
            
          </div>
          <div className="relative">
            <button 
              onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
              className={`p-2.5 rounded-xl border transition-colors ${
                hasActiveFilters
                  ? 'bg-gold text-white border-gold'
                  : 'bg-white dark:bg-navy-card text-gray-500 dark:text-gray-400 border-gray-200 dark:border-navy-light hover:text-gold dark:hover:text-gold'
              }`}>
              <FilterIcon size={20} />
            </button>

            {filterDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setFilterDropdownOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute top-full ${isRtl ? 'left-0' : 'right-0'} mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-navy-card rounded-2xl shadow-lg border border-gray-200 dark:border-navy-light z-50 p-6 space-y-6`}>
                  
                  {/* Status Filter */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-navy dark:text-cream-dark">
                      {t('status')}
                    </h3>
                    <div className="space-y-2">
                      {statusOptions.map((option) => (
                        <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedStatuses.includes(option.value)}
                            onChange={() => handleStatusToggle(option.value)}
                            className="w-4 h-4 rounded border-gray-300 text-gold accent-gold cursor-pointer"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {t(option.label as any)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Date Range Filter */}
                  <div className="space-y-3 border-t border-gray-100 dark:border-navy-light pt-6">
                    <h3 className="text-sm font-semibold text-navy dark:text-cream-dark">
                      {t('dateRange' as any)}
                    </h3>
                    <div className="space-y-2">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 dark:border-navy-light bg-white dark:bg-navy-card px-3 py-2 text-sm text-navy dark:text-cream-dark focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-colors"
                      />
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 dark:border-navy-light bg-white dark:bg-navy-card px-3 py-2 text-sm text-navy dark:text-cream-dark focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 border-t border-gray-100 dark:border-navy-light pt-6">
                    <button
                      onClick={handleResetFilters}
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-navy-light/30 rounded-xl hover:bg-gray-200 dark:hover:bg-navy-light/50 transition-colors">
                      {t('reset' as any)}
                    </button>
                    <button
                      onClick={handleApplyFilters}
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gold rounded-xl hover:bg-gold-dark transition-colors">
                      {t('apply' as any)}
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-navy-card rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-navy-light/20 text-gray-500 dark:text-gray-400 text-sm border-b border-gray-100 dark:border-navy-light">
                <th className="px-6 py-4 font-medium">{t('id')}</th>
                <th className="px-6 py-4 font-medium">{t('company')}</th>
                <th className="px-6 py-4 font-medium">
                {t("stage")}
                </th>
                <th className="px-6 py-4 font-medium">{t('status')}</th>
                <th className="px-6 py-4 font-medium">
                {t("updated")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-navy-light text-sm">
              {filteredRequests.map((request) =>
              <tr
  key={request.id}
  onClick={() => navigate(`/admin/requests/${request.id}`)}
  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-navy-light/10 transition-colors"
>
                
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileTextIcon size={16} className="text-gray-400" />
                      <span className="font-medium text-navy dark:text-cream-dark">
                        {request.id}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">
                    {request.company_name}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                  {language === "ar"
                  ? (request.current_stage_name_ar || request.current_stage_name)
                  : request.current_stage_name}
                  </td>
                  
                  <td className="px-6 py-4">
                    <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    
                      {t(request.status as any)}
                    </span>
                  </td>
                  
<td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">
  {formatLastUpdated(
    request.updated_at || request.created_at
  )}
</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>);

};