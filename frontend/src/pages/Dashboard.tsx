import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import {
  BuildingIcon,
  FileTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  BellIcon,
  FileIcon,
  CheckIcon,
  XIcon } from
'lucide-react';
import { motion } from 'framer-motion';
export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useAppContext();
  const isRtl = language === 'ar';
  const stats = [
  {
    label: 'totalCompanies',
    value: '150',
    icon: BuildingIcon,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10'
  },
  {
    label: 'totalRequests',
    value: '89',
    icon: FileTextIcon,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10'
  },
  {
    label: 'pendingRequests',
    value: '23',
    icon: ClockIcon,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10'
  },
  {
    label: 'approvedRequests',
    value: '54',
    icon: CheckCircleIcon,
    color: 'text-green-500',
    bg: 'bg-green-500/10'
  }] as
  const;
  const stages = [
  {
    id: 1,
    label: 'registration',
    completed: true
  },
  {
    id: 2,
    label: 'compliance',
    completed: true
  },
  {
    id: 3,
    label: 'licensing',
    completed: false
  },
  {
    id: 4,
    label: 'final_approval',
    completed: false
  }] as
  const;

  const completedStages = stages.filter(stage => stage.completed).length;
  const progress = (completedStages / stages.length) * 100;
  const recentRequests = [
  {
    id: 'REQ-001',
    company: 'TechNova Solutions',
    stage: 'Registration',
    employee: 'Ahmed Ali',
    status: 'approved'
  },
  {
    id: 'REQ-002',
    company: 'Global Industries',
    stage: 'Compliance',
    employee: 'Sarah Smith',
    status: 'underReview'
  },
  {
    id: 'REQ-003',
    company: 'Desert Startups',
    stage: 'Operations',
    employee: 'Mohammed K.',
    status: 'submitted'
  },
  {
    id: 'REQ-004',
    company: 'Future Retail',
    stage: 'Registration',
    employee: 'Fatima N.',
    status: 'rejected'
  },
  {
    id: 'REQ-005',
    company: 'Oasis Tech',
    stage: 'Growth',
    employee: 'Omar H.',
    status: 'approved'
  }];

  const notifications = [
  {
    id: 1,
    title: 'Document uploaded',
    desc: 'TechNova uploaded Trade License',
    time: '2 hours ago',
    icon: FileIcon,
    type: 'info'
  },
  {
    id: 2,
    title: 'Request approved',
    desc: 'REQ-001 has been approved',
    time: '5 hours ago',
    icon: CheckIcon,
    type: 'success'
  },
  {
    id: 3,
    title: 'Missing information',
    desc: 'Global Industries needs to update ID',
    time: '1 day ago',
    icon: XIcon,
    type: 'error'
  },
  {
    id: 4,
    title: 'Stage update',
    desc: 'Desert Startups moved to Operations',
    time: '1 day ago',
    icon: BellIcon,
    type: 'info'
  }];

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
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-navy dark:text-cream-dark mb-2">
            {t('dashboard')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Welcome back, Admin. Here's what's happening today.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
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
                {t(stat.label)}
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
          <span className="text-2xl font-bold text-gold">{Math.round(progress)}%</span>
        </div>

        <div className="relative">
          {/* Progress Bar Background */}
          <div className="absolute top-1/2 left-0 w-full h-1.5 bg-gray-100 dark:bg-navy-light -translate-y-1/2 rounded-full z-0"></div>
          {/* Active Progress Bar */}
          <div
            className={`absolute top-1/2 ${isRtl ? 'right-0' : 'left-0'} h-1.5 bg-gold -translate-y-1/2 rounded-full z-0 transition-all duration-1000`}
            style={{
              width: `${progress}%`
            }}>
          </div>

          <div className="relative z-10 flex justify-between">
            {stages.map((stage) =>
            <div key={stage.id} className="flex flex-col items-center gap-3">
                <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white dark:border-navy-card transition-colors duration-500 ${stage.completed ? 'bg-gold text-white' : 'bg-gray-200 dark:bg-navy-light text-gray-400'}`}>
                
                  {stage.completed ?
                <CheckIcon size={16} className="font-bold" /> :

                <span>{stage.id}</span>
                }
                </div>
                <span
                className={`text-sm font-medium ${stage.completed ? 'text-navy dark:text-cream-dark' : 'text-gray-400'}`}>
                
                  {t(stage.label)}
                </span>
              </div>
            )}
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
                  <th className="px-6 py-4 font-medium">{t('employee')}</th>
                  <th className="px-6 py-4 font-medium">{t('status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-navy-light text-sm">
                {recentRequests.map((req) =>
                <tr
                  key={req.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-navy-light/10 transition-colors">
                  
                    <td className="px-6 py-4 font-medium text-navy dark:text-cream-dark">
                      {req.id}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {req.company}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {req.stage}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {req.employee}
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
              const Icon = notif.icon;
              return (
                <div
                  key={notif.id}
                  className="flex gap-4 p-4 hover:bg-gray-50 dark:hover:bg-navy-light/20 rounded-xl transition-colors cursor-pointer group">
                  
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationIconColor(notif.type)}`}>
                    
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy dark:text-cream-dark truncate">
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                      {notif.desc}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {notif.time}
                    </p>
                  </div>
                  <div className="flex items-center text-gray-300 dark:text-gray-600 group-hover:text-gold transition-colors">
                    {isRtl ?
                    <ChevronLeftIcon size={16} /> :

                    <ChevronRightIcon size={16} />
                    }
                  </div>
                </div>);

            })}
          </div>
        </motion.div>
      </div>
    </div>);

};