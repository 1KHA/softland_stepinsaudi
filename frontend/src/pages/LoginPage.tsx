import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowRight, Phone, Building2, UserCog, Globe2, BriefcaseBusiness, FileText, Users, GitBranch, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../node_modules/react-i18next';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
        const sectors = [
  { id: 1, name: 'Commercial' },
  { id: 2, name: 'Industrial' },
  { id: 3, name: 'Real Estate' },
  { id: 4, name: 'Entrepreneurial' }
];
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
  const isArabic = i18n.language.startsWith('ar');
  const BackIcon = isArabic ? ArrowRight : ArrowLeft;
const navigate = useNavigate();
const handleLogin = async () => {
  try {
    const res = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    });


    const data = await res.json();

if (res.ok) {
  localStorage.setItem("user", JSON.stringify(data.user));

  //alert('تم تسجيل الدخول 🎉');

  if (res.ok) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  const role = data.user.role;
// توجيه الصفحات حسب كل دور ***********************************************************
  if (role === "ADMIN") {
    navigate("/admin-dashboard");
  } else if (role === "CLIENT") {
    navigate("/company-dashboard");
  } else {
    navigate("/employee-dashboard");
  }

} else {
  alert(data.message);
}
} else {
  alert(data.message);
}

  } catch (err) {
    console.error(err);
    alert('خطأ في الاتصال بالسيرفر');
  }
};
  const renderInput = ({
    label,
    placeholder,
    type = 'text',
    value,
    onChange,
    icon,
    dir,
    required = false,
    min
  }: {
    label: string;
    placeholder: string;
    type?: string;
    value: string;
    onChange: (value: string) => void;
    icon: React.ReactNode;
    dir?: 'ltr' | 'rtl';
    required?: boolean;
    min?: number;
  }) => (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 px-4 pl-12 text-brand-navy placeholder-gray-400 transition-all focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
          dir={dir}
          required={required}
          min={min}
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
      </div>
    </div>
  );

  const renderFileInput = ({
    label,
    hint,
    file,
    onChange,
    required = false
  }: {
    label: string;
    hint: string;
    file: File | null;
    onChange: (file: File | null) => void;
    required?: boolean;
  }) => (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3.5 text-gray-500 transition-all hover:border-brand-gold hover:bg-brand-cream/60">
        <Upload className="h-5 w-5 text-brand-gold" />
        <span>{file ? file.name : hint}</span>
        <input
          type="file"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          required={required}
        />
      </label>
    </div>
  );

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  console.log("SUBMIT CLICKED", isLogin);
  // تسجيل دخول
if (isLogin) {
  await handleLogin(); // 👈 هذا أهم سطر
  return;
}

 // إنشاء حساب
try {

  const res = await fetch('http://localhost:3000/auth/register-with-company', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },

body: JSON.stringify({
  name,
  email,
  password,
  company_name: companyName,
  sector_id: Number(sector),
  phone: contactNumber,
  description: companyDescription,
  country,
founders: founders
  .split(',')
  .map((f) => f.trim())
  .filter((f) => f.length > 0)})

  });

  const data = await res.json();

  console.log("RESPONSE:", data);

  if (res.ok) {

  // حفظ التوكن
  localStorage.setItem("token", data.token);

  // حفظ بيانات المستخدم
  localStorage.setItem("user", JSON.stringify(data.user));

  // تحويل للداشبورد
  navigate('/company-dashboard');

} else {

  alert(data.message || 'صار خطأ');

}

} catch (err) {

  console.error("ERROR:", err);
  alert('خطأ في الاتصال بالسيرفر');

}
};
  return (
    <div className="min-h-screen bg-brand-cream flex flex-col">
      {/* Top Bar */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 text-brand-navy hover:text-brand-gold transition-colors group">
            <BackIcon className={`w-5 h-5 transition-transform ${isArabic ? 'group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
            <span className="font-medium">{t('common.backHome')}</span>
          </Link>
          <Link to="/">
            <img
              src="/Screenshot_2026-04-22_142843.png"
              alt={t('common.brand')}
              className="h-12 w-auto object-contain" />
          </Link>
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
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${isLogin ? 'bg-brand-navy text-white shadow-md' : 'text-gray-500 hover:text-brand-navy'}`}>
                  {t('login.tabLogin')}
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${!isLogin ? 'bg-brand-navy text-white shadow-md' : 'text-gray-500 hover:text-brand-navy'}`}>
                  {t('login.tabRegister')}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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
                      label: t('login.fullName'),
                      placeholder: t('login.fullNamePlaceholder'),
                      value: name,
                      onChange: setName,
                      icon: <Users className="h-5 w-5" />,
                      required: true
                    })}
                    {renderInput({
                      label: t('login.companyName'),
                      placeholder: t('login.companyNamePlaceholder'),
                      value: companyName,
                      onChange: setCompanyName,
                      icon: <Building2 className="h-5 w-5" />,
                      required: true
                    })}
                    {renderInput({
                      label: t('login.companyManager'),
                      placeholder: t('login.companyManagerPlaceholder'),
                      value: companyManager,
                      onChange: setCompanyManager,
                      icon: <UserCog className="h-5 w-5" />,
                      required: true
                    })}
<div className="space-y-2">
  <label>{t('login.country')}</label>

  <select
    value={country}
    onChange={(e) => setCountry(e.target.value)}
    className="w-full p-3 border rounded"
  >
    <option value="">Select country</option>

    <option value="Saudi Arabia">Saudi Arabia</option>
    <option value="United Arab Emirates">United Arab Emirates</option>
    <option value="Kuwait">Kuwait</option>
    <option value="Qatar">Qatar</option>
    <option value="Bahrain">Bahrain</option>
    <option value="Oman">Oman</option>
  </select>
</div>
<div className="space-y-2">
  <label>{t('login.sector')}</label>

  <select
    value={sector}
    onChange={(e) => setSector(e.target.value)}
    className="w-full p-3 border rounded"
  >
    <option value="">Select sector</option>

    {sectors.map((s) => (
      <option key={s.id} value={s.id}>
        {s.name}
      </option>
    ))}
  </select>
</div>
                    {renderInput({
                      label: t('login.founders'),
                      placeholder: t('login.foundersPlaceholder'),
                      value: founders,
                      onChange: setFounders,
                      icon: <Users className="h-5 w-5" />,
                      required: true
                    })}
                    {renderInput({
                      label: t('login.branchesCount'),
                      placeholder: t('login.branchesCountPlaceholder'),
                      type: 'number',
                      value: branchesCount,
                      onChange: setBranchesCount,
                      icon: <GitBranch className="h-5 w-5" />,
                      required: true,
                      min: 1
                    })}
                    {renderInput({
                      label: t('login.contactNumber'),
                      placeholder: t('login.contactNumberPlaceholder'),
                      type: 'tel',
                      value: contactNumber,
                      onChange: setContactNumber,
                      icon: <Phone className="h-5 w-5" />,
                      dir: 'ltr',
                      required: true
                    })}
                    {renderInput({
                      label: t('login.companyEmail'),
                      placeholder: t('login.emailPlaceholder'),
                      type: 'email',
                      value: companyEmail,
                      onChange: setCompanyEmail,
                      icon: <Mail className="h-5 w-5" />,
                      dir: 'ltr',
                      required: true
                    })}
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-gray-700">{t('login.companyDescription')}</label>
                      <div className="relative">
                        <textarea
                          value={companyDescription}
                          onChange={(e) => setCompanyDescription(e.target.value)}
                          placeholder={t('login.companyDescriptionPlaceholder')}
                          className="min-h-[120px] w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 px-4 pl-12 text-brand-navy placeholder-gray-400 transition-all focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                          required
                        />
                        <FileText className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    {renderFileInput({
                      label: t('login.companyLogo'),
                      hint: t('login.companyLogoHint'),
                      file: companyLogo,
                      onChange: setCompanyLogo,
                      required: true
                    })}
                    {renderFileInput({
                      label: t('login.companyProfile'),
                      hint: t('login.companyProfileHint'),
                      file: companyProfile,
                      onChange: setCompanyProfile,
                      required: true
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
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('login.emailPlaceholder')}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 px-4 pl-12 text-brand-navy placeholder-gray-400 focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 transition-all"
                    dir="ltr"
                    required />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('login.password')}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 px-4 pl-20 text-brand-navy placeholder-gray-400 focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 transition-all"
                    dir="ltr"
                    required />
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
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 px-4 pl-12 text-brand-navy placeholder-gray-400 focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 transition-all"
                    dir="ltr"
                    required />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </motion.div>
              }

              {isLogin &&
              <div className="flex justify-start">
                  <button
                  type="button"
                  className="text-sm text-brand-gold hover:text-yellow-600 font-medium transition-colors">
                    {t('login.forgotPassword')}
                  </button>
                </div>
              }

              <button
  type="submit"
  className="w-full bg-brand-gold text-brand-navy hover:bg-yellow-500 font-bold py-4 rounded-xl"
>
  {isLogin ? t('login.submitLogin') : t('login.submitRegister')}
</button>
            </form>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-sm text-gray-400">{t('common.or')}</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <button
              onClick={() => setIsLogin(!isLogin)}
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