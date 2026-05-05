import React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
export default function TaskDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

const [selectedFiles, setSelectedFiles] =
  useState<File[]>([]);

const [task, setTask] = useState<any>(null);

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
    <div className="min-h-screen bg-[#F8F5EF]">
      
{/* PAGE HEADER */}
<div className="bg-white border-b border-gray-100 px-10 py-5">

  {/* NAVBAR */}
  <div className="flex items-center justify-center gap-14 text-[#4B5563] font-medium mb-10">

    <button
      onClick={() => navigate("/company-dashboard")}
      className="hover:text-[#D6B36A] transition"
    >
      Dashboard
    </button>

    <button
      onClick={() => navigate("/company-profile")}
      className="hover:text-[#D6B36A] transition"
    >
      My Profile
    </button>

    <button
      onClick={() => navigate("/company-dashboard")}
      className="hover:text-[#D6B36A] transition"
    >
      Progress Tracking
    </button>

    <button className="hover:text-[#D6B36A] transition">
      Notifications
    </button>

  </div>

  {/* TITLE */}
  <div className="flex justify-between items-start">

    <div>

<h1 className="text-3xl font-bold text-[#4B5563] mb-2">
            {task.title}
      </h1>

<p className="text-base text-gray-400">
            Task Details
      </p>

    </div>

    <button
      onClick={() => navigate(-1)}
className="bg-[#D6B36A] text-white px-5 py-2 rounded-xl text-sm"    >
      Back
    </button>

  </div>

</div>

      <div className="p-10 space-y-8">

        {/* STATUS */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 mb-2">
                Current Status
              </p>

              <h2 className="text-3xl font-bold text-[#4B5563]">
                {task.status}
              </h2>
            </div>

            <div className="bg-[#D6B36A] text-white px-5 py-2 rounded-full">
              Stage Task
            </div>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-[#4B5563] mb-5">
            What You Need To Do
          </h2>

          <p className="text-gray-600 leading-8">
            {task.description}
          </p>
        </div>

        {/* REQUIRED DOCUMENTS */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-[#4B5563] mb-6">
            Required Documents
          </h2>

          <div className="space-y-4">
{task?.requiredDocuments?.map((doc: string, index: number) => (
                  <div
                key={index}
                className="border border-gray-200 rounded-xl p-4 flex justify-between"
              >
                <span>{doc}</span>

                <span className="text-red-500">*</span>
              </div>
            ))}
          </div>
        </div>

        {/* UPLOAD SECTION */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-[#4B5563] mb-6">
            Upload Documents
          </h2>

          <label className="border-2 border-dashed border-gray-300 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-[#D6B36A] transition">
            
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
              const files = Array.from(
              e.target.files || []
             );

             setSelectedFiles((prev) => [
             ...prev,
              ...files
             ]);
              }}
            />

            <p className="text-lg text-gray-500">
              Click to upload file
            </p>

            <p className="text-sm text-gray-400 mt-2">
              PDF, JPG, PNG
            </p>
          </label>

          {/* FILE PREVIEW */}
{selectedFiles.length > 0 && (

  <div className="space-y-4 mt-6">

    {selectedFiles.map(
      (file, index) => (

        <div
          key={index}
          className="border rounded-2xl p-5 flex justify-between items-center"
        >

          <div>

            <p className="font-semibold">
              {file.name}
            </p>

            <p className="text-sm text-gray-500">
              {(file.size / 1024).toFixed(2)} KB
            </p>

          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                window.open(
                  URL.createObjectURL(file),
                  "_blank"
                )
              }
              className="bg-[#4B5563] text-white px-4 py-2 rounded-lg"
            >
              Preview
            </button>

            <button
              onClick={() => {

                setSelectedFiles(
                  selectedFiles.filter(
                    (_, i) => i !== index
                  )
                );

              }}
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              Remove
            </button>

          </div>

        </div>

      )
    )}

  </div>

)}

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-4 mt-8">

            <button className="bg-gray-200 px-6 py-3 rounded-xl">
              Save Draft
            </button>

<button
  className="bg-[#D6B36A] text-white px-6 py-3 rounded-xl"

  onClick={async () => {

if (selectedFiles.length === 0) {

  alert("Please select files");

  return;

}

    try {

      const formData = new FormData();

selectedFiles.forEach((file) => {

  formData.append(
    "files",
    file
  );

});

formData.append(
  "company_task_id",
  id || ""
);

      const response = await fetch(
 "http://localhost:3000/companies/tasks/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      console.log(data);

      await fetch(
`http://localhost:3000/tasks/${id}/status`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            status: "UNDER_REVIEW",
          }),

        }
      );

      setTask({
        ...task,
        status: "UNDER_REVIEW",
      });

      alert(
        "File uploaded successfully ✅"
      );

    } catch (error) {

      console.error(error);

    }

  }}

>
  Submit Task

</button>
          </div>
        </div>
      </div>
    </div>
  );
}