import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import {
  FileTextIcon,
  SearchIcon,
  FilterIcon,
  ChevronDownIcon } from
'lucide-react';
import { motion } from 'framer-motion';
interface Request {
  id: string;
  company: string;
  type: string;
  status: 'submitted' | 'underReview' | 'approved' | 'rejected';
  assignedTo: string | null;
  date: string;
}
export const Requests: React.FC = () => {
  const { t, language } = useAppContext();
  const isRtl = language === 'ar';
  const [requests, setRequests] = useState<Request[]>([
  {
    id: 'REQ-2023-001',
    company: 'TechNova Solutions',
    type: 'New Registration',
    status: 'approved',
    assignedTo: 'Ahmed Ali',
    date: '2023-10-15'
  },
  {
    id: 'REQ-2023-002',
    company: 'Global Industries',
    type: 'License Renewal',
    status: 'underReview',
    assignedTo: 'Sarah Smith',
    date: '2023-11-02'
  },
  {
    id: 'REQ-2023-003',
    company: 'Desert Startups',
    type: 'Stage Update',
    status: 'submitted',
    assignedTo: null,
    date: '2023-11-05'
  },
  {
    id: 'REQ-2023-004',
    company: 'Future Retail',
    type: 'New Registration',
    status: 'rejected',
    assignedTo: 'Mohammed K.',
    date: '2023-10-20'
  },
  {
    id: 'REQ-2023-005',
    company: 'Oasis Tech',
    type: 'Document Update',
    status: 'approved',
    assignedTo: 'Ahmed Ali',
    date: '2023-09-12'
  },
  {
    id: 'REQ-2023-006',
    company: 'Pioneer Manufacturing',
    type: 'License Addition',
    status: 'underReview',
    assignedTo: 'Sarah Smith',
    date: '2023-11-01'
  },
  {
    id: 'REQ-2023-007',
    company: 'NextGen Commerce',
    type: 'New Registration',
    status: 'submitted',
    assignedTo: null,
    date: '2023-11-06'
  },
  {
    id: 'REQ-2023-008',
    company: 'Alpha Innovations',
    type: 'Stage Update',
    status: 'approved',
    assignedTo: 'Mohammed K.',
    date: '2023-08-30'
  }]
  );
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const statusOptions = [
    { value: 'approved', label: 'statusApproved' },
    { value: 'underReview', label: 'statusUnderReview' },
    { value: 'submitted', label: 'statusSubmitted' },
    { value: 'rejected', label: 'statusRejected' }
  ];

  const filteredRequests = requests.filter((request) => {
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(request.status)) {
      return false;
    }
    if (startDate && request.date < startDate) return false;
    if (endDate && request.date > endDate) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        request.company.toLowerCase().includes(query) ||
        request.id.toLowerCase().includes(query) ||
        request.type.toLowerCase().includes(query)
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

  const employees = [
  'Ahmed Ali',
  'Sarah Smith',
  'Mohammed K.',
  'Fatima N.',
  'Omar H.'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'underReview':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'rejected':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };
  const handleAssign = (id: string, employee: string) => {
    setRequests(
      requests.map((r) =>
      r.id === id ?
      {
        ...r,
        assignedTo: employee
      } :
      r
      )
    );
  };
  return (
    <div className="space-y-8 pb-8" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy dark:text-cream-dark mb-2">
            {t('requests')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage and process company requests and applications.
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
                <th className="px-6 py-4 font-medium">{t('type')}</th>
                <th className="px-6 py-4 font-medium">{t('status')}</th>
                <th className="px-6 py-4 font-medium">{t('assignedTo')}</th>
                <th className="px-6 py-4 font-medium">{t('date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-navy-light text-sm">
              {filteredRequests.map((request) =>
              <tr
                key={request.id}
                className="hover:bg-gray-50/50 dark:hover:bg-navy-light/10 transition-colors">
                
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileTextIcon size={16} className="text-gray-400" />
                      <span className="font-medium text-navy dark:text-cream-dark">
                        {request.id}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">
                    {request.company}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {request.type}
                  </td>
                  <td className="px-6 py-4">
                    <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    
                      {t(request.status as any)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative group">
                      <select
                      value={request.assignedTo || ''}
                      onChange={(e) =>
                      handleAssign(request.id, e.target.value)
                      }
                      className={`appearance-none bg-transparent border-none focus:ring-0 cursor-pointer pr-8 py-1 ${request.assignedTo ? 'text-navy dark:text-cream-dark font-medium' : 'text-gray-400 italic'}`}>
                      
                        <option value="" disabled>
                          {t('unassigned')}
                        </option>
                        {employees.map((emp) =>
                      <option key={emp} value={emp}>
                            {emp}
                          </option>
                      )}
                      </select>
                      <ChevronDownIcon
                      size={14}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {request.date}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>);

};