import React, {
  useEffect,
  useState
} from 'react';

import { useNavigate } from 'react-router-dom';

import { useTranslation } from '../../node_modules/react-i18next';

import axios from 'axios';

export default function CompanyDashboard() {

  const navigate = useNavigate();

  const { t, i18n } = useTranslation();

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const [companyStages, setCompanyStages] =
    useState<any[]>([]);

  const [companyTasks, setCompanyTasks] =
    useState<any[]>([]);

  const [progress, setProgress] =
    useState(0);

  const [currentStage, setCurrentStage] =
    useState("");

  useEffect(() => {

    const fetchDashboard = async () => {

      try {

        const token =
          localStorage.getItem("token");

        const companyId =
          user?.company_id;

        // stages
        const stagesResponse =
          await axios.get(
            `http://localhost:3000/companies/${companyId}/stages`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );

        setCompanyStages(
          stagesResponse.data.stages
        );

        // tasks
        const tasksResponse =
          await axios.get(
            `http://localhost:3000/companies/${companyId}/tasks`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );

        setCompanyTasks(
          tasksResponse.data.tasks
        );

        // progress
const progressResponse =
  await axios.get(
    `http://localhost:3000/companies/${companyId}/progress`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`
      }
    }
  );

setProgress(
  progressResponse.data.progress
);

        // current stage
        const activeStage =
          stagesResponse.data.stages.find(
            (stage: any) =>
              stage.status ===
              "IN_PROGRESS"
          );

        if (activeStage) {

          setCurrentStage(
            activeStage.stage_name
          );

        }

      } catch (error) {

        console.log(error);

      }

    };

    fetchDashboard();

  }, []);

const activeStage =
  [...companyStages]
    .sort(
      (a: any, b: any) =>
        a.stage_order - b.stage_order
    )
    .find(
      (stage: any) =>
        stage.status === "IN_PROGRESS"
    );

const currentStageTasks =
  companyTasks.filter(
    (task: any) =>
task.company_stage_id === activeStage?.id
    );

  console.log(activeStage);
console.log(companyTasks);

  return (

    <div className="min-h-screen bg-[#F7F3EE]">

      {/* Header */}
      <div className="bg-white shadow-sm px-8 py-5 flex items-center justify-between">

        {/* Left */}
        <div>

          <h1 className="text-3xl font-bold text-[#1E3A5F]">
            {t('dashboard.welcome')}،
            {" "}
            {user?.name}
          </h1>

          <p className="text-gray-500 mt-2">
            {t('dashboard.title')}
          </p>

        </div>

        {/* Center Nav */}
        <div className="hidden md:flex items-center gap-10">

          <button
            onClick={() =>
              navigate('/dashboard-overview')
            }
            className="text-[#1E3A5F] font-semibold hover:text-[#C5A55A] transition"
          >
            {t('dashboard.dashboard')}
          </button>

          <button
            onClick={() =>
              navigate('/company-profile')
            }
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
                i18n.language === 'en'
                  ? 'ar'
                  : 'en'
              )
            }
            className="flex items-center gap-2 border border-gray-200 bg-white px-5 py-3 rounded-full hover:bg-gray-50 transition"
          >

            <span className="text-lg">
              🌐
            </span>

            <span className="text-[#1E3A5F] font-medium">
              {i18n.language === 'en'
                ? 'AR'
                : 'EN'}
            </span>

          </button>

        </div>

      </div>

      {/* Action Buttons */}
      <div className="px-8 pt-8 flex gap-4">

        <button
          onClick={() =>
            navigate('/company-profile')
          }
          className="bg-white border border-gray-200 px-6 py-3 rounded-2xl shadow-sm hover:bg-gray-50 transition"
        >
          {t('dashboard.editProfile')}
        </button>

        <label className="bg-[#C5A55A] text-white border border-[#C5A55A] px-6 py-3 rounded-2xl shadow-sm hover:opacity-90 transition cursor-pointer flex items-center justify-center">

          {t('dashboard.uploadDocuments')}

          <input
            type="file"
            className="hidden"
            onChange={async (e) => {

  const file = e.target.files?.[0];

  if (!file) return;

  try {

    const token =
      localStorage.getItem("token");

    const firstTask =
      companyTasks[0];

    const formData =
      new FormData();

    formData.append(
      "files",
      file
    );

    const response =
      await axios.post(

        `http://localhost:3000/companies/tasks/${firstTask.id}/upload`,

        formData,

        {

          headers: {

            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "multipart/form-data"

          }

        }

      );

    console.log(response.data);

    alert("Uploaded Successfully ✅");

  } catch (error) {

    console.log(error);

    alert("Upload failed ❌");

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
                {currentStage}
              </h2>

            </div>

            <h1 className="text-5xl font-bold text-[#C5A55A]">
              {progress}%
            </h1>

          </div>

          {/* Progress */}
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">

            <div
              style={{
                width: `${progress}%`
              }}
              className="h-full bg-[#C5A55A] rounded-full"
            ></div>

          </div>

          {/* Stages */}
          <div className="flex gap-3 mt-8 flex-wrap">

            {[...companyStages]
  .sort(
    (a: any, b: any) =>
      a.stage_order - b.stage_order
  )
  .map(
              (stage: any) => (

                <div
                  key={stage.id}
                  className={`px-4 py-2 rounded-full text-sm ${
                    stage.status ===
                    "COMPLETED"
                      ? "bg-green-100 text-green-700"
                      : stage.status ===
                        "IN_PROGRESS"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >

                  {stage.stage_name}

                  {
                    stage.status ===
                    "COMPLETED"
                    && " ✓"
                  }

                </div>

              )
            )}

          </div>

        </div>

        {/* Tasks */}
        <div className="mt-10 space-y-5">

          {currentStageTasks.map(
            (task: any) => (

              <div
                key={task.id}
                className="bg-[#8E8686] rounded-3xl p-6 flex items-center justify-between"
              >

                <div>

                  <h3 className="text-white text-xl font-semibold">
                    {task.title}
                  </h3>

                  <p className="text-gray-200 text-sm mt-1">
                    Status:
                    {" "}
                    {task.status}
                  </p>

                </div>

                <div className="flex gap-3">

                  <button className="bg-[#C5A55A] text-white px-5 py-2 rounded-xl">

                    {task.status}

                  </button>

                <button
  onClick={() => navigate(`/company-task/${task.id}`)}
  className="bg-white px-5 py-2 rounded-xl"
>
  View
</button>

                </div>

              </div>

            )
          )}

        </div>

      </div>

    </div>
  );
}