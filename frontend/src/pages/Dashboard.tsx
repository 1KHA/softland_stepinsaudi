import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import {
  BuildingIcon,
  FileTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  Bell,
  FileIcon,
  CheckIcon,
  XIcon } from
'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from "../config";
export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useAppContext();
  const isRtl = language === 'ar';

    const getNotificationTitle = (type: string) => {
  switch (type) {
    case "DOCUMENT":
      return t("newDocumentUploaded");

    case "NEW_COMPANY":
      return t("newCompanyRegistered");

    case "REQUEST_APPROVED":
      return t("requestApproved");

    case "REQUEST_REJECTED":
      return t("requestRejected");

    case "RESUBMISSION_REQUESTED":
      return t("resubmissionRequested");

    default:
      return type;
  }
};

const getNotificationDescription = (
  type: string,
  description: string
) => {
  const isArabic = language === "ar";

  switch (type) {
    case "DOCUMENT":
      return isArabic
        ? `قامت شركة ${description} برفع مستند جديد للمراجعة`
        : `Company ${description} uploaded a new document for review`;

    case "NEW_COMPANY":
      return isArabic
        ? `تم تسجيل شركة جديدة: ${description}`
        : `New company registered: ${description}`;

    default:
      return description;
  }
};

const fetchStats = async () => {

  try {

    const token = localStorage.getItem('token');

    const response = await fetch(
      `${API_URL}/employee/dashboard/stats`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    if (data.success) {

setStats(data.stats);

setStageStats(data.stageStats || []);
    }

  } catch (error) {

    console.error(error);

  }

};

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

      setRecentRequests(
        data.requests.slice(0, 5)
      );

    }

  } catch (error) {

    console.error(error);

  }

};

const [stats, setStats] = useState({
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  needsCompletion: 0,
  activeCompanies: 0
});
const [stageStats, setStageStats] = useState<any[]>([]);

const fetchNotifications = async () => {

  try {

    const token = localStorage.getItem('token');

    const response = await fetch(
      `${API_URL}/employee/notifications`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    if (data.success) {
      setNotifications(
        data.notifications.slice(0, 3)
      );
    }

  } catch (error) {

    console.error(error);

  }

};

useEffect(() => {

  fetchStats();
  fetchRequests();
  fetchNotifications();

}, []);


const dashboardStats = [
  {
    label: 'totalCompanies',
    value: stats.total,
    icon: BuildingIcon,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10'
  },
  {
    label: 'pendingRequests',
    value: stats.pending,
    icon: ClockIcon,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10'
  },
  {
    label: 'approvedRequests',
    value: stats.approved,
    icon: CheckCircleIcon,
    color: 'text-green-500',
    bg: 'bg-green-500/10'
  },
  {
    label: 'rejectedRequests',
    value: stats.rejected,
    icon: XIcon,
    color: 'text-red-500',
    bg: 'bg-red-500/10'
  }
];

const stages = stageStats.map((stage) => ({
  id: stage.id,
  label:
    language === "ar"
      ? (stage.name_ar || stage.name)
      : stage.name,
  total: stage.total,
}));

  const [recentRequests, setRecentRequests] =
  useState<any[]>([]);

  const [notifications, setNotifications] =
  useState<any[]>([]);

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
  const getNotificationIconColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-500 bg-green-500/10';
      case 'error':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-blue-500 bg-blue-500/10';
    }
  };
  return (
    <div className="space-y-8 pb-8">
<div className="flex justify-between items-center mb-2">
  <div className="flex items-center gap-4">



  </div>
</div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
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
                delay: index * 0.1
              }}
              key={stat.label}
              className="bg-white dark:bg-navy-card rounded-2xl p-6 shadow-sm border border-transparent hover:border-gold/30 transition-all duration-300 group">
              
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                  
                  <Icon size={24} />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-navy dark:text-cream-dark mb-1">
                {stat.value}
              </h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
               {t(stat.label as any)} 
              </p>
            </motion.div>);

        })}
      </div>

      {/* Onboarding Progress */}
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
          delay: 0.4
        }}
        className="bg-white dark:bg-navy-card rounded-2xl p-8 shadow-sm">
        
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold text-navy dark:text-cream-dark">
            {t('onboardingProgress')}
          </h2>
<span className="text-sm font-semibold text-gold">
  {t("activeCompanies")}: {stats.activeCompanies}
</span>
        </div>

        <div className="relative">
          {/* Progress Bar Background */}
          <div className="absolute top-1/2 left-0 w-full h-1.5 bg-gray-100 dark:bg-navy-light -translate-y-1/2 rounded-full z-0"></div>
          {/* Active Progress Bar */}
          <div
style={{
  width: '100%'
}}>
          </div>

<div className="relative z-10 flex justify-between">
  {stages.map((stage) => (
    <div key={stage.id} className="flex flex-col items-center gap-3">
<div className="w-14 h-14 rounded-full bg-gold text-white flex items-center justify-center font-bold text-lg shadow-md">        {stage.total}
      </div>

      <span className="text-sm font-medium text-navy dark:text-cream-dark">
        {stage.label}
      </span>
    </div>
  ))}
</div>
</div>
</motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Requests Table */}
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
            delay: 0.5
          }}
          className="lg:col-span-2 bg-white dark:bg-navy-card rounded-2xl shadow-sm overflow-hidden flex flex-col">
          
          <div className="p-6 border-b border-gray-100 dark:border-navy-light flex justify-between items-center">
            <h2 className="text-xl font-semibold text-navy dark:text-cream-dark">
              {t('recentRequests')}
            </h2>
            <button
              onClick={() => navigate('/admin/requests')}
              className="text-sm font-medium text-gold hover:text-gold-dark transition-colors">
              {t('viewAll')}
            </button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-navy-light/20 text-gray-500 dark:text-gray-400 text-sm">
                  <th className="px-6 py-4 font-medium">{t('id')}</th>
                  <th className="px-6 py-4 font-medium">{t('company')}</th>
                  <th className="px-6 py-4 font-medium">{t('stage')}</th>
                  <th className="px-6 py-4 font-medium">{t('status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-navy-light text-sm">
                {recentRequests.map((req) =>
                <tr
  key={req.id}
  onClick={() => navigate(`/admin/requests/${req.id}`)}
  className="hover:bg-gray-50/50 dark:hover:bg-navy-light/10 transition-colors cursor-pointer"
>
                  
                    <td className="px-6 py-4 font-medium text-navy dark:text-cream-dark">
                      {req.id}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {req.company_name}
                    </td>
<td className="px-6 py-4 text-gray-600 dark:text-gray-300">
  {language === "ar"
    ? (req.current_stage_name_ar || req.current_stage_name)
    : req.current_stage_name}
</td>

                    <td className="px-6 py-4">
                      <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>
                      
                        {t(req.status as any)}
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Notifications Widget */}
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
            delay: 0.6
          }}
          className="bg-white dark:bg-navy-card rounded-2xl shadow-sm flex flex-col">
          
          <div className="p-6 border-b border-gray-100 dark:border-navy-light flex justify-between items-center">
            <h2 className="text-xl font-semibold text-navy dark:text-cream-dark">
              {t('latestNotifications')}
            </h2>
            <button
              onClick={() => navigate('/admin/notifications')}
              className="text-sm font-medium text-gold hover:text-gold-dark transition-colors">
              {t('viewAll')}
            </button>
          </div>
          <div className="p-2 flex-1 overflow-y-auto">
{notifications.map((notif) => {
  const Icon = Bell;

  return (
    <div
      key={notif.id}
      className="flex gap-4 p-4 hover:bg-gray-50 dark:hover:bg-navy-light/20 rounded-xl transition-colors cursor-pointer group"
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationIconColor(
          notif.type
        )}`}
      >
        <Icon size={18} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-navy dark:text-cream-dark truncate">
          {getNotificationTitle(notif.type)}
        </p>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
          {getNotificationDescription(
            notif.type,
            notif.message?.includes("|")
              ? notif.message.split("|")[1]
              : notif.message
          )}
        </p>

        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          {new Date(notif.created_at).toLocaleString(
            language === "ar" ? "ar-SA" : "en-US"
          )}
        </p>
      </div>

      <div className="flex items-center text-gray-300 dark:text-gray-600 group-hover:text-gold transition-colors">
        {isRtl ? (
          <ChevronLeftIcon size={16} />
        ) : (
          <ChevronRightIcon size={16} />
        )}
      </div>
    </div>
  );
})}
          </div>
        </motion.div>
      </div>
    </div>);

};