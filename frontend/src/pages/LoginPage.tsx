import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowRight, Phone, Building2, UserCog, Globe2, BriefcaseBusiness, FileText, Users, GitBranch, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { API_URL } from "../config";
import { setSession } from "../lib/session";
import { StepInLogo, SpectrumBar } from "../components/StepInLogo";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
type Sector = { id: number; name_en: string | null; name_ar: string | null };

// Fallback when GET /sectors is unreachable — must stay aligned with the DB
// seed (prisma/seed.js), where these ids drive workflow task matching.
const FALLBACK_SECTORS: Sector[] = [
  { id: 1, name_en: 'Commercial', name_ar: 'تجاري' },
  { id: 2, name_en: 'Industrial', name_ar: 'صناعي' },
  { id: 3, name_en: 'Real Estate', name_ar: 'عقاري' },
  { id: 4, name_en: 'Entrepreneurial', name_ar: 'ريادي' }
];

// Sector 5 is the "All Sectors" task-template wildcard (see workflow.service.js),
// not a real company sector — never offer it at registration.
const ALL_SECTORS_ID = 5;

// Option values stay in English — the backend stores `country` as a plain
// string and existing rows use these exact values; only the labels translate.
const COUNTRIES = [
  { value: 'Saudi Arabia', key: 'saudiArabia' },
  { value: 'United Arab Emirates', key: 'uae' },
  { value: 'Kuwait', key: 'kuwait' },
  { value: 'Qatar', key: 'qatar' },
  { value: 'Bahrain', key: 'bahrain' },
  { value: 'Oman', key: 'oman' }
];

export function LoginPage() {
  const [sectors, setSectors] = useState<Sector[]>(FALLBACK_SECTORS);

  useEffect(() => {
    fetch(`${API_URL}/sectors`)
      .then((res) => res.json())
      .then((data) => {
        const rows = (data.sectors || []).filter((s: Sector) => s.id !== ALL_SECTORS_ID);
        if (rows.length) setSectors(rows);
      })
      .catch(() => {});
  }, []);
  const { t, i18n } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyManager, setCompanyManager] = useState('');
  const [country, setCountry] = useState('');
  const [sector, setSector] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [founders, setFounders] = useState('');
  const [branchesCount, setBranchesCount] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [companyProfile, setCompanyProfile] = useState<File | null>(null);
  const [confirmPassword, setConfirmPassword] = useState('');

  // Submit-time validation state. `fieldErrors` drives the inline messages
  // under each control; `formError` is the banner above the submit button.
  // Both replace the alert() dialogs this form used to rely on.
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isArabic = i18n.language.startsWith('ar');
  const BackIcon = isArabic ? ArrowRight : ArrowLeft;
const navigate = useNavigate();
const handleLogin = async () => {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json().catch(() => ({}));

    // دخول بـ OTP
    if (res.ok && (data.requiresOTP || data.requireOTP)) {
      navigate('/verify-otp', { state: { email, password, isLogin: true } });
      return;
    }

    // دخول مباشر
    if (res.ok) {
      // session.ts is the single writer for the token/user pair.
      setSession(data.token, data.user);

      const role = data.user?.role;

      if (role === 'ADMIN') {
        navigate('/admin');
      } else if (role === 'CLIENT') {
        navigate('/company-dashboard');
      } else {
        navigate('/employee-dashboard');
      }

      return;
    }

    setFormError(data.message || t('login.errors.loginFailed'));
  } catch (err) {
    console.error(err);
    setFormError(t('login.errors.network'));
  }
};

  // Switching between the sign-in and register tabs must not carry stale
  // validation messages across.
  const switchMode = (login: boolean) => {
    setIsLogin(login);
    setFieldErrors({});
    setFormError('');
  };

  // Clears a field's inline error as soon as the user starts correcting it.
  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const renderInput = ({
    name: fieldName,
    label,
    placeholder,
    type = 'text',
    value,
    onChange,
    icon,
    dir,
    min
  }: {
    name: string;
    label: string;
    placeholder: string;
    type?: string;
    value: string;
    onChange: (value: string) => void;
    icon: React.ReactNode;
    dir?: 'ltr' | 'rtl';
    min?: number;
  }) => {
    const error = fieldErrors[fieldName];

    return (
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
        <div className="relative">
          <input
            type={type}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              clearFieldError(fieldName);
            }}
            placeholder={placeholder}
            className={`w-full rounded-xl border bg-gray-50 py-3.5 px-4 pl-12 text-brand-navy placeholder-gray-400 transition-all focus:outline-none focus:ring-2 ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-brand-gold focus:ring-brand-gold/20'}`}
            dir={dir}
            min={min}
            aria-invalid={Boolean(error)}
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
        </div>
        {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
      </div>
    );
  };

  // NOTE: never put `required` on this input. It is `display:none`, and browsers
  // refuse to focus a hidden invalid control — they abort the submit silently and
  // handleSubmit never runs. The file is validated in JS instead (see validate()).
  const renderFileInput = ({
    name: fieldName,
    label,
    hint,
    file,
    onChange
  }: {
    name: string;
    label: string;
    hint: string;
    file: File | null;
    onChange: (file: File | null) => void;
  }) => {
    const error = fieldErrors[fieldName];

    return (
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
        <label
          className={`flex cursor-pointer items-center gap-3 rounded-xl border border-dashed bg-gray-50 px-4 py-3.5 text-gray-500 transition-all hover:border-brand-gold hover:bg-brand-cream/60 ${error ? 'border-red-400' : 'border-gray-300'}`}>
          <Upload className="h-5 w-5 text-brand-gold" />
          <span>{file ? file.name : hint}</span>
          <input
            type="file"
            className="hidden"
            onChange={(e) => {
              onChange(e.target.files?.[0] ?? null);
              clearFieldError(fieldName);
            }}
          />
        </label>
        {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
      </div>
    );
  };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STRONG_PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

// Every required field is validated here rather than by the browser: the form
// is rendered with `noValidate` so that one hidden control can never abort the
// submit without telling the user why (see renderFileInput).
const validate = (): Record<string, string> => {
  const errors: Record<string, string> = {};
  const required = t('login.errors.required');

  if (!email.trim()) {
    errors.email = required;
  } else if (!EMAIL_RE.test(email.trim())) {
    errors.email = t('login.errors.invalidEmail');
  }

  if (!password) {
    errors.password = required;
  }

  if (isLogin) {
    return errors;
  }

  if (!name.trim()) errors.name = required;
  if (!companyName.trim()) errors.companyName = required;
  if (!companyManager.trim()) errors.companyManager = required;
  if (!country) errors.country = t('login.errors.selectCountry');
  if (!sector) errors.sector = t('login.errors.selectSector');
  if (!founders.trim()) errors.founders = required;

  if (!branchesCount.trim()) {
    errors.branchesCount = required;
  } else if (!Number.isFinite(Number(branchesCount)) || Number(branchesCount) < 1) {
    errors.branchesCount = t('login.errors.minBranches');
  }

  if (!contactNumber.trim()) errors.contactNumber = required;

  if (!companyEmail.trim()) {
    errors.companyEmail = required;
  } else if (!EMAIL_RE.test(companyEmail.trim())) {
    errors.companyEmail = t('login.errors.invalidEmail');
  }

  if (!companyDescription.trim()) errors.companyDescription = required;
  if (!companyLogo) errors.companyLogo = t('login.errors.fileRequired');
  if (!companyProfile) errors.companyProfile = t('login.errors.fileRequired');

  if (password && !STRONG_PASSWORD_RE.test(password)) {
    errors.password = t('login.errors.weakPassword');
  }

  if (!confirmPassword) {
    errors.confirmPassword = required;
  } else if (password !== confirmPassword) {
    errors.confirmPassword = t('login.errors.passwordMismatch');
  }

  return errors;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (isSubmitting) return;

  setFormError('');

  const errors = validate();

  if (Object.keys(errors).length > 0) {
    setFieldErrors(errors);
    setFormError(t('login.errors.fixFields'));
    return;
  }

  setFieldErrors({});
  setIsSubmitting(true);

  try {
    if (isLogin) {
      await handleLogin();
      return;
    }

    // إنشاء حساب
    const res = await fetch(`${API_URL}/auth/register-with-company`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        password,
        company_name: companyName,
        manager_name: companyManager,
        sector_id: Number(sector),
        phone: contactNumber,
        description: companyDescription,
        country,
        founders: founders
          .split(',')
          .map((f) => f.trim())
          .filter((f) => f.length > 0)
      })
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.requiresOTP) {
      navigate('/verify-otp', {
        state: {
          email,
          formData: {
            name,
            email,
            password,
            company_name: companyName,
            manager_name: companyManager,
            sector_id: Number(sector),
            phone: contactNumber,
            description: companyDescription,
            country,
            founders: founders
              .split(',')
              .map((f) => f.trim())
              .filter((f) => f.length > 0)
          },
          isLogin: false
        }
      });

      return;
    }

    setFormError(data.message || t('login.errors.registerFailed'));
  } catch (err) {
    console.error(err);
    setFormError(t('login.errors.network'));
  } finally {
    setIsSubmitting(false);
  }
};
  return (
    <div className="min-h-screen bg-brand-cream flex flex-col">
      {/* Top Bar */}
      <div className="bg-white shadow-sm">
        {/* شريط الطيف — brand §02 */}
        <SpectrumBar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 text-brand-navy hover:text-brand-cyan transition-colors group">
            <BackIcon className={`w-5 h-5 transition-transform ${isArabic ? 'group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
            <span className="font-medium">{t('common.backHome')}</span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link to="/" aria-label={t('common.brand')}>
              <StepInLogo size="md" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4">
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
            duration: 0.5
          }}
          className="w-full max-w-3xl">
          
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-brand-navy mb-2">
                  {isLogin ? t('login.loginTitle') : t('login.registerTitle')}
              </h1>
              <p className="text-gray-500">
                  {isLogin ? t('login.loginDescription') : t('login.registerDescription')}
              </p>
            </div>

            <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
              <button
                onClick={() => switchMode(true)}
                className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${isLogin ? 'bg-brand-navy text-white shadow-md' : 'text-gray-500 hover:text-brand-navy'}`}>
                  {t('login.tabLogin')}
              </button>
              <button
                onClick={() => switchMode(false)}
                className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${!isLogin ? 'bg-brand-navy text-white shadow-md' : 'text-gray-500 hover:text-brand-navy'}`}>
                  {t('login.tabRegister')}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {!isLogin &&
              <motion.div
                initial={{
                  opacity: 0,
                  height: 0
                }}
                animate={{
                  opacity: 1,
                  height: 'auto'
                }}
                exit={{
                  opacity: 0,
                  height: 0
                }}>
                
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {renderInput({
                      name: 'name',
                      label: t('login.fullName'),
                      placeholder: t('login.fullNamePlaceholder'),
                      value: name,
                      onChange: setName,
                      icon: <Users className="h-5 w-5" />
                    })}
                    {renderInput({
                      name: 'companyName',
                      label: t('login.companyName'),
                      placeholder: t('login.companyNamePlaceholder'),
                      value: companyName,
                      onChange: setCompanyName,
                      icon: <Building2 className="h-5 w-5" />
                    })}
                    {renderInput({
                      name: 'companyManager',
                      label: t('login.companyManager'),
                      placeholder: t('login.companyManagerPlaceholder'),
                      value: companyManager,
                      onChange: setCompanyManager,
                      icon: <UserCog className="h-5 w-5" />
                    })}
<div className="space-y-2">
  <label className="mb-2 block text-sm font-medium text-gray-700">{t('login.country')}</label>

  <select
    value={country}
    onChange={(e) => {
      setCountry(e.target.value);
      clearFieldError('country');
    }}
    aria-invalid={Boolean(fieldErrors.country)}
    className={`w-full p-3 border rounded ${fieldErrors.country ? 'border-red-400' : ''}`}
  >
    <option value="">{t('login.selectCountry')}</option>

    {COUNTRIES.map((c) => (
      <option key={c.value} value={c.value}>
        {t(`login.countries.${c.key}`)}
      </option>
    ))}
  </select>
  {fieldErrors.country ? <p className="text-xs text-red-600">{fieldErrors.country}</p> : null}
</div>
<div className="space-y-2">
  <label className="mb-2 block text-sm font-medium text-gray-700">{t('login.sector')}</label>

  <select
    value={sector}
    onChange={(e) => {
      setSector(e.target.value);
      clearFieldError('sector');
    }}
    aria-invalid={Boolean(fieldErrors.sector)}
    className={`w-full p-3 border rounded ${fieldErrors.sector ? 'border-red-400' : ''}`}
  >
    <option value="">{t('login.selectSector')}</option>

    {sectors.map((s) => (
      <option key={s.id} value={s.id}>
        {(isArabic ? s.name_ar : s.name_en) || s.name_en || s.name_ar}
      </option>
    ))}
  </select>
  {fieldErrors.sector ? <p className="text-xs text-red-600">{fieldErrors.sector}</p> : null}
</div>
                    {renderInput({
                      name: 'founders',
                      label: t('login.founders'),
                      placeholder: t('login.foundersPlaceholder'),
                      value: founders,
                      onChange: setFounders,
                      icon: <Users className="h-5 w-5" />
                    })}
                    {renderInput({
                      name: 'branchesCount',
                      label: t('login.branchesCount'),
                      placeholder: t('login.branchesCountPlaceholder'),
                      type: 'number',
                      value: branchesCount,
                      onChange: setBranchesCount,
                      icon: <GitBranch className="h-5 w-5" />,
                      min: 1
                    })}
                    {renderInput({
                      name: 'contactNumber',
                      label: t('login.contactNumber'),
                      placeholder: t('login.contactNumberPlaceholder'),
                      type: 'tel',
                      value: contactNumber,
                      onChange: setContactNumber,
                      icon: <Phone className="h-5 w-5" />,
                      dir: 'ltr'
                    })}
                    {renderInput({
                      name: 'companyEmail',
                      label: t('login.companyEmail'),
                      placeholder: t('login.emailPlaceholder'),
                      type: 'email',
                      value: companyEmail,
                      onChange: setCompanyEmail,
                      icon: <Mail className="h-5 w-5" />,
                      dir: 'ltr'
                    })}
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-gray-700">{t('login.companyDescription')}</label>
                      <div className="relative">
                        <textarea
                          value={companyDescription}
                          onChange={(e) => {
                            setCompanyDescription(e.target.value);
                            clearFieldError('companyDescription');
                          }}
                          placeholder={t('login.companyDescriptionPlaceholder')}
                          aria-invalid={Boolean(fieldErrors.companyDescription)}
                          className={`min-h-[120px] w-full rounded-xl border bg-gray-50 py-3.5 px-4 pl-12 text-brand-navy placeholder-gray-400 transition-all focus:outline-none focus:ring-2 ${fieldErrors.companyDescription ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-brand-gold focus:ring-brand-gold/20'}`}
                        />
                        <FileText className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                      </div>
                      {fieldErrors.companyDescription ? (
                        <p className="mt-1.5 text-xs text-red-600">{fieldErrors.companyDescription}</p>
                      ) : null}
                    </div>
                    {renderFileInput({
                      name: 'companyLogo',
                      label: t('login.companyLogo'),
                      hint: t('login.companyLogoHint'),
                      file: companyLogo,
                      onChange: setCompanyLogo
                    })}
                    {renderFileInput({
                      name: 'companyProfile',
                      label: t('login.companyProfile'),
                      hint: t('login.companyProfileHint'),
                      file: companyProfile,
                      onChange: setCompanyProfile
                    })}
                  </div>
                </motion.div>
              }

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('login.email')}</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearFieldError('email');
                    }}
                    placeholder={t('login.emailPlaceholder')}
                    aria-invalid={Boolean(fieldErrors.email)}
                    className={`w-full bg-gray-50 border rounded-xl py-3.5 px-4 pl-12 text-brand-navy placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${fieldErrors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-brand-gold focus:ring-brand-gold/20'}`}
                    dir="ltr" />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                {fieldErrors.email ? <p className="mt-1.5 text-xs text-red-600">{fieldErrors.email}</p> : null}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('login.password')}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearFieldError('password');
                    }}
                    placeholder="••••••••"
                    aria-invalid={Boolean(fieldErrors.password)}
                    className={`w-full bg-gray-50 border rounded-xl py-3.5 px-4 pl-20 text-brand-navy placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${fieldErrors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-brand-gold focus:ring-brand-gold/20'}`}
                    dir="ltr" />
                  <Lock className="absolute left-12 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-navy transition-colors">
                    {showPassword ?
                    <EyeOff className="w-5 h-5" /> :

                    <Eye className="w-5 h-5" />
                    }
                  </button>
                </div>
              </div>

              {!isLogin &&
              <motion.div
                initial={{
                  opacity: 0,
                  height: 0
                }}
                animate={{
                  opacity: 1,
                  height: 'auto'
                }}
                exit={{
                  opacity: 0,
                  height: 0
                }}>
                
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('login.confirmPassword')}</label>
                  <div className="relative">
                    <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      clearFieldError('confirmPassword');
                    }}
                    placeholder="••••••••"
                    aria-invalid={Boolean(fieldErrors.confirmPassword)}
                    className={`w-full bg-gray-50 border rounded-xl py-3.5 px-4 pl-12 text-brand-navy placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${fieldErrors.confirmPassword ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-brand-gold focus:ring-brand-gold/20'}`}
                    dir="ltr" />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {fieldErrors.confirmPassword ? (
                    <p className="mt-1.5 text-xs text-red-600">{fieldErrors.confirmPassword}</p>
                  ) : null}
                </motion.div>
              }

              {isLogin &&
              <div className="flex justify-start">
                <button
type="button"

onClick={() =>
navigate(
"/forgot-password"
)
}

className="
text-sm
text-brand-gold
hover:text-yellow-600
font-medium
transition-colors
"

>

{t('login.forgotPassword')}

</button>
                </div>
              }

{formError ? (
  <div
    role="alert"
    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
    {formError}
  </div>
) : null}

<button
  type="submit"
  disabled={isSubmitting}
  className="w-full bg-brand-gold text-brand-navy hover:bg-yellow-500 font-bold py-4 rounded-xl transition-colors disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-brand-gold"
>
  {isSubmitting
    ? t('login.submitting')
    : isLogin
    ? t('login.submitLogin')
    : t('login.submitRegister')}
</button>
            </form>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-sm text-gray-400">{t('common.or')}</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <button
              onClick={() => switchMode(!isLogin)}
              className="w-full border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white font-bold py-3.5 rounded-xl transition-all duration-300 text-center">
              {isLogin ? t('login.switchToRegister') : t('login.switchToLogin')}
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t('login.agreement')}{' '}
            <a href="#" className="text-brand-gold hover:underline">
              {t('login.terms')}
            </a>{' '}
            {t('login.and')}{' '}
            <a href="#" className="text-brand-gold hover:underline">
              {t('login.privacy')}
            </a>
          </p>
        </motion.div>
      </div>
    </div>
    );
  }