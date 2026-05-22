import React, { useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import {
  UserIcon,
  GlobeIcon,
  MoonIcon,
  SunIcon,
  BellIcon,
  ShieldIcon,
  LogOutIcon,
  KeyIcon } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  verificationCode: string;
};

export const Settings: React.FC = () => {
  const { t, language, theme, toggleLanguage, toggleTheme } = useAppContext();
  const [platformEmail, setPlatformEmail] = useState('support@softlanding.com');
  const [supportContact, setSupportContact] = useState('+971 50 123 4567');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState('');
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsErrors, setSettingsErrors] = useState({ email: '', phone: '' });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    verificationCode: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<Partial<PasswordForm>>({});
  const [isVerificationStep, setIsVerificationStep] = useState(false);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState('');

  const localText = {
    platformEmail: language === 'ar' ? 'البريد الإلكتروني للدعم' : 'Platform Email / Support Email',
    supportContact: language === 'ar' ? 'رقم الاتصال بالدعم' : 'Support Contact Number',
    avatarSizeError: language === 'ar' ? 'يجب أن يكون حجم الصورة أقل من 2 ميغابايت' : 'Image must be smaller than 2MB',
    invalidImage: language === 'ar' ? 'يرجى اختيار ملف صورة بصيغة jpg أو png' : 'Please select a JPG or PNG image',
    changeAvatar: language === 'ar' ? 'تغيير الصورة' : 'Change Avatar',
    verificationSent: language === 'ar' ? 'تم إرسال رمز التحقق إلى البريد الإلكتروني' : 'Verification code sent to email',
    settingsSaved: language === 'ar' ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully',
    passwordChanged: language === 'ar' ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully',
    passwordMismatch: language === 'ar' ? 'كلمة المرور الجديدة وتأكيدها غير متطابقتين' : 'New passwords do not match',
    codeRequired: language === 'ar' ? 'الرجاء إدخال رمز التحقق' : 'Please enter the verification code',
    currentPassword: language === 'ar' ? 'كلمة المرور الحالية' : 'Current Password',
    newPassword: language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password',
    confirmNewPassword: language === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password',
    verificationCode: language === 'ar' ? 'رمز التحقق' : 'Verification Code'
  };

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setAvatarError(localText.invalidImage);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError(localText.avatarSizeError);
      return;
    }
    setAvatarError('');
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleProfileSave = () => {
    const errors = { email: '', phone: '' };
    if (!platformEmail.trim()) {
      errors.email = t('fieldRequired');
    }
    if (!supportContact.trim()) {
      errors.phone = t('fieldRequired');
    }
    if (errors.email || errors.phone) {
      setSettingsErrors(errors);
      return;
    }
    setSettingsErrors({ email: '', phone: '' });
    setSettingsSuccess(localText.settingsSaved);
    window.setTimeout(() => setSettingsSuccess(''), 4000);
  };

  const handlePasswordFieldChange = (field: keyof PasswordForm, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    if (passwordErrors[field]) {
      setPasswordErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handlePasswordSave = () => {
    const errors: Partial<PasswordForm> = {};
    if (!passwordForm.currentPassword.trim()) {
      errors.currentPassword = t('fieldRequired');
    }
    if (!passwordForm.newPassword.trim()) {
      errors.newPassword = t('fieldRequired');
    }
    if (!passwordForm.confirmNewPassword.trim()) {
      errors.confirmNewPassword = t('fieldRequired');
    }
    if (passwordForm.newPassword && passwordForm.confirmNewPassword && passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      errors.confirmNewPassword = localText.passwordMismatch;
    }
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    setPasswordErrors({});
    setIsVerificationStep(true);
  };

  // Simulated API call for password change with verification step
  const handleVerificationSubmit = async () => {

  try {

    if (!passwordForm.verificationCode.trim()) {

      setPasswordErrors({
        verificationCode: localText.codeRequired
      });

      return;

    }

    const token = localStorage.getItem('token');

    const response = await fetch(
      'http://localhost:3000/auth/change-password',
      {
        method: 'PUT',

        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },

        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {

      throw new Error(data.message);

    }

    setPasswordErrors({});

    setPasswordSuccessMessage(
      localText.passwordChanged
    );

    window.setTimeout(() => {

      setIsPasswordModalOpen(false);

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
        verificationCode: ''
      });

      setIsVerificationStep(false);

      setPasswordSuccessMessage('');

    }, 1400);

  } catch (error) {

    console.error(error);

    alert('Error changing password');

  }

};

  const handleOpenPasswordModal = () => {
    setIsPasswordModalOpen(true);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '', verificationCode: '' });
    setPasswordErrors({});
    setIsVerificationStep(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold text-navy dark:text-cream-dark mb-2">
          {t('settings')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage your account preferences and system configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Profile Settings */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          className="bg-white dark:bg-navy-card rounded-2xl shadow-sm overflow-hidden">
          
          <div className="p-6 border-b border-gray-100 dark:border-navy-light flex items-center gap-3 bg-gray-50/50 dark:bg-navy-light/10">
            <div className="w-10 h-10 rounded-xl bg-navy/5 dark:bg-cream/5 flex items-center justify-center text-navy dark:text-cream-dark">
              <UserIcon size={20} />
            </div>
            <h2 className="text-xl font-bold text-navy dark:text-cream-dark">
              {t('profileSettings')}
            </h2>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center gap-6 mb-2">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gold/20 flex items-center justify-center text-gold font-bold text-2xl border-2 border-gold/30">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  'A'
                )}
              </div>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="px-4 py-2 text-sm font-medium text-navy dark:text-cream-dark bg-gray-100 dark:bg-navy-light rounded-xl hover:bg-gray-200 dark:hover:bg-navy-light/80 transition-colors">
                  {localText.changeAvatar}
                </button>
                {avatarError ? (
                  <p className="text-xs text-red-600 dark:text-red-400">{avatarError}</p>
                ) : null}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {localText.platformEmail}
                </label>
                <input
                  type="email"
                  value={platformEmail}
                  onChange={(e) => setPlatformEmail(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-navy dark:text-cream-dark focus:outline-none focus:ring-1 transition-colors ${settingsErrors.email ? 'border-red-300 text-red-700 focus:border-red-500 focus:ring-red-200 dark:border-red-500/50' : 'border-gray-200 dark:border-navy-light focus:border-gold focus:ring-gold'}`}
                />
                {settingsErrors.email ? (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{settingsErrors.email}</p>
                ) : null}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {localText.supportContact}
                </label>
                <input
                  type="tel"
                  value={supportContact}
                  onChange={(e) => setSupportContact(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-navy dark:text-cream-dark focus:outline-none focus:ring-1 transition-colors ${settingsErrors.phone ? 'border-red-300 text-red-700 focus:border-red-500 focus:ring-red-200 dark:border-red-500/50' : 'border-gray-200 dark:border-navy-light focus:border-gold focus:ring-gold'}`}
                />
                {settingsErrors.phone ? (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{settingsErrors.phone}</p>
                ) : null}
              </div>
            </div>

            {settingsSuccess ? (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800/30 dark:bg-green-900/20 dark:text-green-200">
                {settingsSuccess}
              </div>
            ) : null}

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleProfileSave}
                className="px-6 py-2.5 bg-gold hover:bg-gold-dark text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-medium">
                {t('save')}
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Language Settings */}
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
              delay: 0.1
            }}
            className="bg-white dark:bg-navy-card rounded-2xl shadow-sm overflow-hidden">
            
            <div className="p-6 border-b border-gray-100 dark:border-navy-light flex items-center gap-3 bg-gray-50/50 dark:bg-navy-light/10">
              <div className="w-10 h-10 rounded-xl bg-navy/5 dark:bg-cream/5 flex items-center justify-center text-navy dark:text-cream-dark">
                <GlobeIcon size={20} />
              </div>
              <h2 className="text-xl font-bold text-navy dark:text-cream-dark">
                {t('languageSettings')}
              </h2>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-navy-light">
                <div>
                  <p className="font-semibold text-navy dark:text-cream-dark">
                    English (LTR)
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Default system language
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="language"
                    className="sr-only peer"
                    checked={language === 'en'}
                    onChange={toggleLanguage} />
                  
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 peer-checked:border-gold peer-checked:bg-gold flex items-center justify-center">
                    {language === 'en' &&
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                    }
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-navy-light mt-4">
                <div>
                  <p className="font-semibold text-navy dark:text-cream-dark">
                    العربية (RTL)
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    اللغة العربية للنظام
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="language"
                    className="sr-only peer"
                    checked={language === 'ar'}
                    onChange={toggleLanguage} />
                  
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 peer-checked:border-gold peer-checked:bg-gold flex items-center justify-center">
                    {language === 'ar' &&
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                    }
                  </div>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Theme Settings */}
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
              delay: 0.2
            }}
            className="bg-white dark:bg-navy-card rounded-2xl shadow-sm overflow-hidden">
            
            <div className="p-6 border-b border-gray-100 dark:border-navy-light flex items-center gap-3 bg-gray-50/50 dark:bg-navy-light/10">
              <div className="w-10 h-10 rounded-xl bg-navy/5 dark:bg-cream/5 flex items-center justify-center text-navy dark:text-cream-dark">
                {theme === 'light' ?
                <SunIcon size={20} /> :

                <MoonIcon size={20} />
                }
              </div>
              <h2 className="text-xl font-bold text-navy dark:text-cream-dark">
                {t('themeSettings')}
              </h2>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-navy-light">
                <div className="flex items-center gap-3">
                  <SunIcon
                    size={20}
                    className="text-gray-500 dark:text-gray-400" />
                  
                  <div>
                    <p className="font-semibold text-navy dark:text-cream-dark">
                      {t('lightMode')}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    className="sr-only peer"
                    checked={theme === 'light'}
                    onChange={toggleTheme} />
                  
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 peer-checked:border-gold peer-checked:bg-gold flex items-center justify-center">
                    {theme === 'light' &&
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                    }
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-navy-light mt-4">
                <div className="flex items-center gap-3">
                  <MoonIcon
                    size={20}
                    className="text-gray-500 dark:text-gray-400" />
                  
                  <div>
                    <p className="font-semibold text-navy dark:text-cream-dark">
                      {t('darkMode')}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    className="sr-only peer"
                    checked={theme === 'dark'}
                    onChange={toggleTheme} />
                  
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 peer-checked:border-gold peer-checked:bg-gold flex items-center justify-center">
                    {theme === 'dark' &&
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                    }
                  </div>
                </label>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Notifications & Security */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Notification Settings */}
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
              delay: 0.3
            }}
            className="bg-white dark:bg-navy-card rounded-2xl shadow-sm overflow-hidden">
            
            <div className="p-6 border-b border-gray-100 dark:border-navy-light flex items-center gap-3 bg-gray-50/50 dark:bg-navy-light/10">
              <div className="w-10 h-10 rounded-xl bg-navy/5 dark:bg-cream/5 flex items-center justify-center text-navy dark:text-cream-dark">
                <BellIcon size={20} />
              </div>
              <h2 className="text-xl font-bold text-navy dark:text-cream-dark">
                {t('notificationSettings')}
              </h2>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-navy dark:text-cream-dark">
                    {t('requestsNotifications')}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get notified when a new request is submitted
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked />
                  
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gold"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-navy dark:text-cream-dark">
                    {t('systemNotifications')}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Updates, maintenance, and alerts
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked />
                  
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gold"></div>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Security */}
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
            className="bg-white dark:bg-navy-card rounded-2xl shadow-sm overflow-hidden">
            
            <div className="p-6 border-b border-gray-100 dark:border-navy-light flex items-center gap-3 bg-gray-50/50 dark:bg-navy-light/10">
              <div className="w-10 h-10 rounded-xl bg-navy/5 dark:bg-cream/5 flex items-center justify-center text-navy dark:text-cream-dark">
                <ShieldIcon size={20} />
              </div>
              <h2 className="text-xl font-bold text-navy dark:text-cream-dark">
                {t('security')}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <button
                type="button"
                onClick={handleOpenPasswordModal}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-navy-light hover:border-gold/50 dark:hover:border-gold/50 transition-colors group">
                <div className="flex items-center gap-3">
                  <KeyIcon
                    size={20}
                    className="text-gray-400 group-hover:text-gold transition-colors" />
                  
                  <span className="font-semibold text-navy dark:text-cream-dark">
                    {t('changePassword')}
                  </span>
                </div>
              </button>

              <button
                type="button"
                  onClick={() => {

                localStorage.removeItem('token');

                  window.location.href = '/login';

  }}
  className="w-full flex items-center justify-between p-4 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group">

  <div className="flex items-center gap-3">

    <LogOutIcon size={20} className="text-red-500" />

          <span className="font-semibold text-red-600 dark:text-red-400">
           {t('logoutAllDevices')}
                  </span>

                </div>

              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isPasswordModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}>
            <motion.div
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-navy-card border border-gray-200 dark:border-navy-light shadow-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-navy-light p-6">
                <div>
                  <h2 className="text-2xl font-semibold text-navy dark:text-cream-dark">
                    {t('changePassword')}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('changePassword')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="rounded-full p-2 text-gray-400 hover:text-navy dark:hover:text-cream-dark transition-colors">
                  <span className="text-xl">×</span>
                </button>
              </div>

              <div className="p-6 space-y-5">
                {!isVerificationStep ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {localText.currentPassword}
                      </label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => handlePasswordFieldChange('currentPassword', e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-navy dark:text-cream-dark focus:outline-none focus:ring-1 transition-colors ${passwordErrors.currentPassword ? 'border-red-300 text-red-700 focus:border-red-500 focus:ring-red-200 dark:border-red-500/50' : 'border-gray-200 dark:border-navy-light focus:border-gold focus:ring-gold'}`}
                      />
                      {passwordErrors.currentPassword ? (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{passwordErrors.currentPassword}</p>
                      ) : null}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {localText.newPassword}
                      </label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => handlePasswordFieldChange('newPassword', e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-navy dark:text-cream-dark focus:outline-none focus:ring-1 transition-colors ${passwordErrors.newPassword ? 'border-red-300 text-red-700 focus:border-red-500 focus:ring-red-200 dark:border-red-500/50' : 'border-gray-200 dark:border-navy-light focus:border-gold focus:ring-gold'}`}
                      />
                      {passwordErrors.newPassword ? (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{passwordErrors.newPassword}</p>
                      ) : null}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {localText.confirmNewPassword}
                      </label>
                      <input
                        type="password"
                        value={passwordForm.confirmNewPassword}
                        onChange={(e) => handlePasswordFieldChange('confirmNewPassword', e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-navy dark:text-cream-dark focus:outline-none focus:ring-1 transition-colors ${passwordErrors.confirmNewPassword ? 'border-red-300 text-red-700 focus:border-red-500 focus:ring-red-200 dark:border-red-500/50' : 'border-gray-200 dark:border-navy-light focus:border-gold focus:ring-gold'}`}
                      />
                      {passwordErrors.confirmNewPassword ? (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{passwordErrors.confirmNewPassword}</p>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-700 dark:border-navy-light dark:bg-navy-light/40 dark:text-gray-300">
                      {localText.verificationSent}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {localText.verificationCode}
                      </label>
                      <input
                        type="text"
                        value={passwordForm.verificationCode}
                        onChange={(e) => handlePasswordFieldChange('verificationCode', e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-navy dark:text-cream-dark focus:outline-none focus:ring-1 transition-colors ${passwordErrors.verificationCode ? 'border-red-300 text-red-700 focus:border-red-500 focus:ring-red-200 dark:border-red-500/50' : 'border-gray-200 dark:border-navy-light focus:border-gold focus:ring-gold'}`}
                      />
                      {passwordErrors.verificationCode ? (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{passwordErrors.verificationCode}</p>
                      ) : null}
                    </div>
                  </div>
                )}

                {passwordSuccessMessage ? (
                  <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800/30 dark:bg-green-900/20 dark:text-green-200">
                    {passwordSuccessMessage}
                  </div>
                ) : null}
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-navy-light flex justify-end gap-3 bg-gray-50 dark:bg-navy-card/50">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 dark:border-navy-light dark:bg-navy-card dark:text-gray-300 hover:bg-gray-50 transition-colors">
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={isVerificationStep ? handleVerificationSubmit : handlePasswordSave}
                  className="px-5 py-2.5 rounded-xl bg-gold text-sm font-medium text-white hover:bg-gold-dark transition-colors">
                  {t('save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>);

};