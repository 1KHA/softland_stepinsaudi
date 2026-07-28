import React, {
  useEffect,
  useState
} from 'react';
import CompanyHeader from "../components/CompanyHeader";
import { useNavigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';
import axios from 'axios';

import { API_URL } from "../config";
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
const [showApprovedPopup, setShowApprovedPopup] =
  useState(false);

  useEffect(() => {

    const fetchDashboard = async () => {

      try {

        const token =
          localStorage.getItem("token");

        const companyId =
          user?.company_id;
const companyResponse =
  await axios.get(
    `${API_URL}/companies/${companyId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

if (
  companyResponse.data.status === "APPROVED" &&
  localStorage.getItem("approval_popup_seen") !== "true"
) {
  setShowApprovedPopup(true);
}

        // stages
        const stagesResponse =
          await axios.get(
            `${API_URL}/companies/${companyId}/stages`,
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

        console.log(companyStages);

        // tasks
        const tasksResponse =
          await axios.get(
            `${API_URL}/companies/${companyId}/tasks`,
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

console.log(
  "TASKS FROM API",
  tasksResponse.data.tasks
);


        // progress
const progressResponse =
  await axios.get(
    `${API_URL}/companies/${companyId}/progress`,
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
console.log("ALL TASKS", companyTasks);
const currentStageTasks =
  companyTasks.filter(
    (task: any) =>
task.company_stage_id === activeStage?.id
    );

  console.log("ACTIVE STAGE");
console.log(activeStage);

console.log("CURRENT STAGE TASKS");
console.log(currentStageTasks);

console.log(
  companyTasks.map(t => ({
    taskId: t.task_id,
    title: t.title,
    company_stage_id: t.company_stage_id
  }))
);

return (
  <>
    <CompanyHeader />

    <div className="min-h-screen bg-[#F7F3EE]">

      {/* Progress Card */}
      <div className="p-8">

<div className="bg-white rounded-3xl p-8 shadow-lg border border-[#ECE7DD]">
          <div className="flex items-center justify-between mb-6">

            <div>

              <p className="text-gray-500">
                {t('dashboard.currentStage')}
              </p>

<h2 className="text-2xl font-bold text-[#1E3A5F]">
  {i18n.language.startsWith("ar")
    ? (
        companyStages.find(
          (s: any) => s.stage_name === currentStage
        )?.stage_name_ar || currentStage
      )
    : currentStage}
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
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : stage.status ===
                        "IN_PROGRESS"
                      ? "bg-[#FFF7E5] text-[#C5A55A] border border-[#F3D48B]"
                      : "bg-gray-100 text-gray-500 border border-gray-200"
                  }`}
                >

{i18n.language.startsWith("ar")
  ? (stage.stage_name_ar || stage.stage_name)
  : stage.stage_name}

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
                className="bg-white border border-[#ECE7DD] rounded-3xl p-6 flex items-center justify-between shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >

                <div>

<h3 className="text-[#1E3A5F] text-xl font-bold">
  {i18n.language.startsWith("ar")
    ? (task.title_ar || task.title)
    : task.title}
</h3>

                </div>

                <div className="flex gap-3">
<span
  className={`px-4 py-2 rounded-full text-sm font-semibold ${
    task.status === "COMPLETED"
      ? "bg-green-100 text-green-700 border border-green-300"
      : task.status === "IN_PROGRESS"
      ? "bg-[#FFF7E5] text-[#C5A55A] border border-[#F3D48B]"
      : task.status === "PENDING"
      ? "bg-gray-100 text-gray-700"
      : "bg-red-100 text-red-700"
  }`}
>
{t(`status.${task.status}`)}
</span>

                <button
  onClick={() => navigate(`/company-task/${task.id}`)}
className="bg-[#C5A55A] text-white px-5 py-2 rounded-xl hover:bg-[#B18F46] transition">
{t("view")}
</button>

                </div>

              </div>

            )
          )}

        </div>

      </div>


    </div>
    {showApprovedPopup && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
      <h2 className="text-3xl font-bold text-green-600 mb-4">
🎉 {t("dashboard.approvedTitle")}
      </h2>

      <p className="text-gray-600 mb-6">
{t("dashboard.approvedMessage")}
      </p>

      <button
onClick={() => {
  localStorage.setItem(
    "approval_popup_seen",
    "true"
  );

  setShowApprovedPopup(false);
}}        className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700"
      >
        {t("ok")}
      </button>
    </div>
  </div>
)}
  </>
);
}