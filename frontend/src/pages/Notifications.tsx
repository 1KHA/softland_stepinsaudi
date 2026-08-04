import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import {
  BellIcon,
  FileIcon,
  CheckCircleIcon,
  XCircleIcon,
  GitBranchIcon,
  AlertCircleIcon,
  CheckIcon } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from "../config";
import { authHeaders } from "../lib/session";
import {
  normalizeNotifications,
  NormalizedNotification,
  NotificationTone } from
'../lib/notifications';
// The row shape is owned by lib/notifications.ts: `tone`, `actions` and
// `status` are always populated, even for backend types the UI has never seen.
type Notification = NormalizedNotification;
export const Notifications: React.FC = () => {
  const { t, language } = useAppContext();
  const isRtl = language === 'ar';
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
const [notifications, setNotifications] = useState<Notification[]>([]);

useEffect(() => {
  fetchNotifications();
}, []);

const getNotificationTitle = (type: string) => {
  switch (type) {
    case "DOCUMENT":
      return t("newDocumentUploaded");
    case "REQUEST_APPROVED":
      return t("requestApproved");
    case "REQUEST_REJECTED":
      return t("requestRejected");
    case "RESUBMISSION_REQUESTED":
      return t("resubmissionRequested");
    case "NEW_COMPANY":
      return t("newCompanyRegistered");
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

const fetchNotifications = async () => {
  try {
    const response = await fetch(
      `${API_URL}/companies/notifications`,
      {
        headers: {
          ...authHeaders()
        }
      }
    );

    const data = await response.json();

    console.log("Notifications API:", data);

    setNotifications(
      normalizeNotifications(data.notifications)
    );

  } catch (error) {
    console.error(error);
  }
};
  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
    prev.map((n) =>
    n.id === id ?
    {
      ...n,
      read: true
    } :
    n
    )
    );
  };
  const markAllAsRead = () => {
    setNotifications((prev) =>
    prev.map((n) => ({
      ...n,
      read: true
    }))
    );
  };
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const actionLabelMap: Record<string, string> = {
    preview: 'Preview',
    approve: 'Approve',
    reject: 'Reject',
    view: 'View',
    edit: 'Edit',
    notify: 'Notify',
    changeStage: 'Change stage'
  };

  const handleOpenNotification = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    setSelectedNotification(notification);
  };

  const handleCloseModal = () => {
    setSelectedNotification(null);
  };

  const handleAction = (action: string) => {
    console.log('Notification action:', action, selectedNotification?.id);
  };

  const getIcon = (tone: NotificationTone) => {
    switch (tone) {
      case 'document':
        return <FileIcon size={20} className="text-blue-500" />;
      case 'approved':
        return <CheckCircleIcon size={20} className="text-green-500" />;
      case 'rejected':
        return <XCircleIcon size={20} className="text-red-500" />;
      case 'stage':
        return <GitBranchIcon size={20} className="text-purple-500" />;
      case 'alert':
        return <AlertCircleIcon size={20} className="text-yellow-500" />;
      default:
        return <BellIcon size={20} className="text-gray-500" />;
    }
  };
  const getIconBg = (tone: NotificationTone) => {
    switch (tone) {
      case 'document':
        return 'bg-blue-500/10';
      case 'approved':
        return 'bg-green-500/10';
      case 'rejected':
        return 'bg-red-500/10';
      case 'stage':
        return 'bg-purple-500/10';
      case 'alert':
        return 'bg-yellow-500/10';
      default:
        return 'bg-gray-500/10';
    }
  };
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy dark:text-cream-dark mb-2">
            {t('notifications')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t("notificationsDescription")}          </p>
        </div>
        <button
          onClick={markAllAsRead}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-navy-card text-navy dark:text-cream-dark rounded-xl shadow-sm hover:text-gold dark:hover:text-gold transition-colors text-sm font-medium border border-transparent hover:border-gold/30">
          
          <CheckIcon size={16} />
          {t('markAllAsRead')}
        </button>
      </div>

      <div className="bg-white dark:bg-navy-card rounded-2xl shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="flex border-b border-gray-100 dark:border-navy-light p-2 gap-2">
          {(['all', 'unread', 'read'] as const).map((f) =>
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${filter === f ? 'bg-navy text-white dark:bg-navy-light dark:text-cream-dark shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-navy-light/20'}`}>
            
              {t(f as any)}
              {f === 'unread' &&
            <span
              className={`ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs ${filter === f ? 'bg-gold text-white' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
              
                  {notifications.filter((n) => !n.read).length}
                </span>
            }
            </button>
          )}
        </div>

        {/* List */}
        <div className="divide-y divide-gray-100 dark:divide-navy-light">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length > 0 ?
            filteredNotifications.map((notification) =>
            <motion.div
              layout
              initial={{
                opacity: 0,
                y: 10
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                scale: 0.95
              }}
              key={notification.id}
              onClick={() => handleOpenNotification(notification)}
              className={`p-6 flex gap-4 transition-colors duration-300 relative ${!notification.read ? 'bg-gold/5 dark:bg-gold/5 cursor-pointer hover:bg-gold/10 dark:hover:bg-gold/10' : 'hover:bg-gray-50 dark:hover:bg-navy-light/10'}`}>
              
                  {!notification.read &&
              <div
                className={`absolute top-0 bottom-0 w-1 bg-gold ${isRtl ? 'right-0' : 'left-0'}`} />

              }

                  <div
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBg(notification.tone)}`}>

                    {getIcon(notification.tone)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4 mb-1">
                      <h3
                    className={`text-base font-semibold truncate ${!notification.read ? 'text-navy dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                 {getNotificationTitle(notification.type)}
                      </h3>
<span className="text-xs font-medium text-gray-400 whitespace-nowrap mt-1">
  {new Date(notification.timestamp).toLocaleString(
    language === "ar" ? "ar-SA" : "en-US"
  )}
</span>
                    </div>
<p
  className={`text-sm ${!notification.read ? 'text-gray-600 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
  {getNotificationDescription(
    notification.type,
    notification.description
  )}
</p>
                  </div>
                </motion.div>
            ) :

            <motion.div
              initial={{
                opacity: 0
              }}
              animate={{
                opacity: 1
              }}
              className="p-12 text-center flex flex-col items-center justify-center">
              
                <div className="w-16 h-16 bg-gray-50 dark:bg-navy-light/20 rounded-full flex items-center justify-center mb-4">
                  <BellIcon size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-navy dark:text-cream-dark mb-1">
                 {t("noNotifications")} 
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                 {t("noNotificationsDescription")}
                </p>
              </motion.div>
            }
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence>
        {selectedNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-xl rounded-3xl bg-white dark:bg-navy-card border border-gray-200 dark:border-navy-light shadow-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-navy dark:text-cream-dark">
                      {getNotificationTitle(selectedNotification.type)}
                    </h2>
                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                      {getNotificationDescription(
                        selectedNotification.type,
                        selectedNotification.description
                      )}
                    </p>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="rounded-full p-2 text-gray-400 hover:text-navy dark:hover:text-cream-dark transition-colors">
                    <XCircleIcon size={20} />
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 mb-6">
                  <div className="rounded-3xl bg-gray-50 dark:bg-navy-light/70 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                      Time
                    </p>
                    <p className="mt-2 text-sm font-medium text-navy dark:text-cream-dark">
                      {selectedNotification.timestamp}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-gray-50 dark:bg-navy-light/70 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                      Status
                    </p>
                    <p className="mt-2 text-sm font-medium text-navy dark:text-cream-dark">
                      {selectedNotification.status}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {selectedNotification.actions.map((action) => (
                    <button
                      key={action}
                      onClick={() => handleAction(action)}
                      className="rounded-xl border border-gray-200 dark:border-navy-light bg-white dark:bg-navy-card px-4 py-2 text-sm font-medium text-navy dark:text-cream-dark hover:bg-gray-50 dark:hover:bg-navy-light transition-colors">
                      {actionLabelMap[action]}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>);

};