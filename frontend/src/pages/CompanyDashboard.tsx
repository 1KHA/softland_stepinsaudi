import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../node_modules/react-i18next';

export default function CompanyDashboard() {

  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <div className="min-h-screen bg-[#F7F3EE]">

      {/* Header */}
      <div className="bg-white shadow-sm px-8 py-5 flex items-center justify-between">

        {/* Left */}
        <div>
          <h1 className="text-3xl font-bold text-[#1E3A5F]">
            {t('dashboard.welcome')}، {user?.name}
          </h1>

          <p className="text-gray-500 mt-2">
            {t('dashboard.title')}
          </p>
        </div>
        
{/* Center Nav */}
<div className="hidden md:flex items-center gap-10">

  <button
    onClick={() => navigate('/dashboard-overview')}
    className="text-[#1E3A5F] font-semibold hover:text-[#C5A55A] transition"
  >
    {t('dashboard.dashboard')}
  </button>

  <button
    onClick={() => navigate('/company-profile')}
    className="text-[#1E3A5F] font-semibold hover:text-[#C5A55A] transition"
  >
    {t('dashboard.profile')}
  </button>

  <button
    className="text-[#1E3A5F] font-semibold hover:text-[#C5A55A] transition"
  >
    {t('dashboard.progress')}
  </button>

  <button
    className="text-[#1E3A5F] font-semibold hover:text-[#C5A55A] transition"
  >
    {t('dashboard.notifications')}
  </button>

</div>

        {/* Right */}
        <div>

          <button
            onClick={() =>
              i18n.changeLanguage(
                i18n.language === 'en' ? 'ar' : 'en'
              )
            }
            className="flex items-center gap-2 border border-gray-200 bg-white px-5 py-3 rounded-full hover:bg-gray-50 transition"
          >
            <span className="text-lg">
              🌐
            </span>

            <span className="text-[#1E3A5F] font-medium">
              {i18n.language === 'en' ? 'AR' : 'EN'}
            </span>
          </button>

        </div>

      </div>

      {/* Action Buttons */}
      <div className="px-8 pt-8 flex gap-4">

        <button
          onClick={() => navigate('/company-profile')}
          className="bg-white border border-gray-200 px-6 py-3 rounded-2xl shadow-sm hover:bg-gray-50 transition"
        >
          {t('dashboard.editProfile')}
        </button>

<label className="bg-[#C5A55A] text-white border border-[#C5A55A] px-6 py-3 rounded-2xl shadow-sm hover:opacity-90 transition cursor-pointer flex items-center justify-center">

  {t('dashboard.uploadDocuments')}

  <input
    type="file"
    className="hidden"
    onChange={(e) => {

      const file = e.target.files?.[0];

      if (file) {
        console.log("Selected File:", file);
      }

    }}
  />

</label>
      </div>

      {/* Progress Card */}
      <div className="p-8">

        <div className="bg-white rounded-3xl p-8 shadow-sm">

          <div className="flex items-center justify-between mb-6">

            <div>
              <p className="text-gray-500">
                {t('dashboard.currentStage')}
              </p>

              <h2 className="text-2xl font-bold text-[#1E3A5F]">
                {t('dashboard.licensing')}
              </h2>
            </div>

            <h1 className="text-5xl font-bold text-[#C5A55A]">
              45%
            </h1>

          </div>

          {/* Progress */}
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div className="w-[45%] h-full bg-[#C5A55A] rounded-full"></div>
          </div>

          {/* Stages */}
          <div className="flex gap-3 mt-8 flex-wrap">

            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm">
              {t('dashboard.registration')} ✓
            </div>

            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm">
              {t('dashboard.compliance')} ✓
            </div>

            <div className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm">
              {t('dashboard.licensing')}
            </div>

            <div className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm">
              {t('dashboard.finalApproval')}
            </div>

          </div>

        </div>

        {/* Tasks */}
        <div className="mt-10 space-y-5">

          {/* Task */}
          <div className="bg-[#8E8686] rounded-3xl p-6 flex items-center justify-between">

            <div>
              <h3 className="text-white text-xl font-semibold">
                {t('dashboard.tasks.commercialRegister.title')}
              </h3>

              <p className="text-gray-200 text-sm mt-1">
                {t('dashboard.tasks.commercialRegister.due')}
              </p>
            </div>

            <div className="flex gap-3">

              <button className="bg-[#C5A55A] text-white px-5 py-2 rounded-xl">
                {t('dashboard.inProgress')}
              </button>

              <button className="bg-white px-5 py-2 rounded-xl">
                {t('dashboard.follow')}
              </button>

            </div>

          </div>

          {/* Task */}
          <div className="bg-[#8E8686] rounded-3xl p-6 flex items-center justify-between">

            <div>
              <h3 className="text-white text-xl font-semibold">
                {t('dashboard.tasks.documents.title')}
              </h3>

              <p className="text-gray-200 text-sm mt-1">
                {t('dashboard.tasks.documents.status')}
              </p>
            </div>

            <div className="flex gap-3">

              <button className="bg-blue-600 text-white px-5 py-2 rounded-xl">
                {t('dashboard.underReview')}
              </button>

              <button className="bg-white px-5 py-2 rounded-xl">
                {t('dashboard.view')}
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}