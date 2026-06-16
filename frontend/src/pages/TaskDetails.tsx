import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CompanyHeader from "../components/CompanyHeader";
import { useTranslation } from "react-i18next";

export default function TaskDetails() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { id } = useParams();

  const [selectedFiles, setSelectedFiles] = useState<{
    [documentName: string]: File | null;
  }>({});

  const [task, setTask] = useState<any>(null);
const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/companies/tasks/${id}`
        );

        const data = await response.json();
        console.log(data);
        setTask(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchTask();
  }, []);

  if (!task) {
    return <div>Loading...</div>;
  }

return (
  <>
    <CompanyHeader />

    <div className="min-h-screen bg-[#F8F5EF]">
      <div className="max-w-7xl mx-auto px-8 pt-8">

      <div className="flex items-center justify-between mb-8">
  <div>
    <h1 className="text-4xl font-bold text-[#1E3A5F]">
{i18n.language.startsWith("ar")
  ? (task.title_ar || task.title)
  : task.title}
      </h1>

    <p className="text-gray-500 mt-2">
{t("task.reviewAndUpload")}
    </p>
  </div>

  <button
    onClick={() => navigate(-1)}
    className="bg-[#C5A55A] hover:bg-[#B18F46] text-white px-6 py-3 rounded-xl transition"
  >
{t("back")}
  </button>
</div>  
  

<div className="space-y-8">
          {/* STATUS */}
<div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-[#ECE7DD]">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 mb-2">{t("task.currentStatus")}</p>

<span
  className={`px-4 py-2 rounded-full font-semibold ${
    task.status === "COMPLETED"
      ? "bg-green-100 text-green-700"
      : task.status === "UNDER_REVIEW"
      ? "bg-yellow-100 text-yellow-700"
      : task.status === "NEEDS_RESUBMISSION"
      ? "bg-red-100 text-red-700"
      : "bg-blue-100 text-blue-700"
  }`}
>
{t(`status.${task.status}`)}
</span>
            </div>
          </div>
        </div>

        {/* DESCRIPTION */}
<div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-[#ECE7DD]">
          <h2 className="text-2xl font-bold text-[#4B5563] mb-5">
{t("task.whatYouNeedToDo")}
          </h2>

          <p className="text-gray-600 leading-8">{i18n.language.startsWith("ar")
  ? (task.description_ar || task.description)
  : task.description}</p>
        </div>

        {/* REQUIRED DOCUMENTS */}
<div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-[#ECE7DD]">
          <h2 className="text-2xl font-bold text-[#4B5563] mb-6">
{t("task.requiredDocuments")}
          </h2>

          <div className="space-y-4">
            {task?.requiredDocuments?.map((doc: any, index: number) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl p-4 flex justify-between"
              >
                <div>
<p className="font-semibold text-[#1E3A5F]">
📄 {
  i18n.language.startsWith("ar")
    ? (doc.document_name_ar || doc.document_name)
    : doc.document_name
}</p>
                  {doc.status === "APPROVED" && (
                    <p className="text-xs text-green-600">Approved ✓</p>
                  )}

                  {doc.status === "NEEDS_RESUBMISSION" && (
                    <>
                      <p className="text-xs text-red-600">
                        Needs Re-upload
                      </p>

                      {doc.rejection_reason && (
                        <p className="text-xs text-red-500">
                          {doc.rejection_reason}
                        </p>
                      )}
                    </>
                  )}

                  {doc.status === "PENDING" && (
                    <p className="text-xs text-gray-500">Pending</p>
                  )}
                </div>

                <span className="text-red-500">*</span>
              </div>
            ))}
          </div>
        </div>

        {/* UPLOAD SECTION */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-[#ECE7DD]">
          <h2 className="text-2xl font-bold text-[#4B5563] mb-6">
{t("task.uploadDocuments")}
          </h2>

          <div className="space-y-4">
            {task?.requiredDocuments
              ?.filter(
                (doc: any) =>
                  doc.status === "PENDING" ||
                  doc.status === "NEEDS_RESUBMISSION"
              )
              .map((doc: any) => (
                <div
                  key={doc.document_name}
                  className="bg-[#FCFCFC] border border-dashed border-[#C5A55A] rounded-2xl p-5 flex justify-between items-center hover:bg-[#FFFCF6] transition"
                >
                  <div>
<p className="font-semibold">
  {i18n.language.startsWith("ar")
    ? (doc.document_name_ar || doc.document_name)
    : doc.document_name}
</p>

                    {doc.status === "NEEDS_RESUBMISSION" && (
                      <p className="text-red-600 text-sm">
                        Needs Re-upload
                        {doc.rejection_reason &&
                          ` - ${doc.rejection_reason}`}
                      </p>
                    )}

                    {selectedFiles[doc.document_name] && (
                      <p className="text-sm text-green-600">
                        {selectedFiles[doc.document_name]?.name}
                      </p>
                    )}
                  </div>

                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];

                      if (!file) return;

                      setSelectedFiles((prev) => ({
                        ...prev,
                        [doc.document_name]: file,
                      }));
                    }}
                  />
                </div>
              ))}
          </div>

{showSuccess && (
  <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4">
    <h3 className="font-semibold text-green-700">
{t("task.documentsSubmitted")}
    </h3>

    <p className="mt-1 text-sm text-green-600">
{t("task.documentsUnderReview")}
    </p>
  </div>
)}

{/* ACTION BUTTONS */}
<div className="flex justify-end mt-8 pt-4">
  {!showSuccess &&
  task?.requiredDocuments?.some(
    (doc: any) =>
      doc.status === "PENDING" ||
      doc.status === "NEEDS_RESUBMISSION"
  ) && (
    <button
className="bg-[#C5A55A] hover:bg-[#B18F46] transition text-white px-8 py-3 rounded-xl font-semibold shadow-md"
                onClick={async () => {
                  if (Object.keys(selectedFiles).length === 0) {
alert(t("task.selectFiles"));
                    return;
                  }

                  try {
                    const formData = new FormData();

                    Object.entries(selectedFiles).forEach(
                      ([documentName, file]) => {
                        if (!file) return;

                        formData.append("files", file);

                        formData.append(
                          "required_document_name",
                          documentName
                        );
                      }
                    );

                    formData.append(
                      "company_task_id",
                      id || ""
                    );

                    const response = await fetch(
                      `http://localhost:3000/companies/tasks/${id}/upload`,
                      {
                        method: "POST",
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem(
                            "token"
                          )}`,
                        },
                        body: formData,
                      }
                    );

                    const data = await response.json();
                    console.log(data);

                    // تنظيف الملفات المختارة
                    setSelectedFiles({});

                    // تحديث الحالة محلياً
                    setTask((prev: any) => ({
                      ...prev,
                      status: "UNDER_REVIEW",
                    }));

setShowSuccess(true);
                  } catch (error) {
                    console.error(error);
                  }
                }}
              >
{t("task.submitTask")}
              </button>
            )}
            </div>
        </div> 
        </div>   
      </div>    
    </div>      
  </>
);
}