import React, { useEffect, useState } from "react";
import axios from "axios";
import CompanyHeader from "../components/CompanyHeader";
import { FileCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

import { API_URL } from "../config";
import { openDocument } from "../lib/files";
export default function CompanyLicenses() {
  const { t, i18n } = useTranslation();

  const [licenses, setLicenses] = useState<any[]>([]);

  useEffect(() => {
    const fetchLicenses = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${API_URL}/companies/licenses`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
console.log(res.data.licenses);
        setLicenses(res.data.licenses || []);
      } catch (error) {
        console.log(error);
      }
    };

    fetchLicenses();
  }, []);

  return (
    <>
      <CompanyHeader />

      <div className="min-h-screen bg-[#F5F2EA] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl shadow-sm p-8">

            <div className="flex items-center justify-between mb-8">
              <div>
<h1 className="text-4xl font-bold text-[#1E3A5F]">
  {t("licensesPage.title")}
</h1>

<p className="text-gray-500 mt-2">
  {t("licensesPage.subtitle")}
</p>
              </div>

              <div className="bg-[#C5A55A] text-white px-4 py-2 rounded-full font-semibold">
{`${licenses.length} ${t("licenses")}`}
              </div>
            </div>

            {licenses.length === 0 ? (
              <div className="border-2 border-dashed border-[#E5E5E5] rounded-3xl p-12 text-center">
<h3 className="text-xl font-semibold text-[#1E3A5F]">
  {t("licensesPage.noLicenses")}
</h3>

<p className="text-gray-500 mt-2">
  {t("licensesPage.noLicensesDescription")}
</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {licenses.map((license: any) => (
                  <div
                    key={license.id}
                    className="bg-[#FCFCFC] border border-[#ECE7DD] rounded-3xl p-6 shadow-sm hover:shadow-lg transition"
                  >
<div className="flex items-center gap-2">
  <FileCheck size={24} className="text-[#C5A55A]" />

<h2 className="text-xl font-bold text-[#1E3A5F]">
  {i18n.language.startsWith("ar")
    ? (license.license_name_ar || license.license_name)
    : license.license_name}
</h2>
</div>

                    <p className="text-gray-500 mt-2">
{t("licensesPage.finalLicenseIssued")}
                    </p>

                    <p className="text-sm text-gray-400 mt-4">
                      {new Date(license.uploaded_at).toLocaleDateString(
  i18n.language.startsWith("ar")
    ? "ar-SA"
    : "en-GB"
)}
                    </p>

                    <div className="flex gap-3 mt-6">
{/* R-12: documents are behind an authenticated endpoint now, and an
    anchor cannot send an Authorization header — see lib/files.ts */}
<button
  type="button"
  onClick={() => openDocument(license.id, "view")}
  className="flex-1 text-center bg-[#1E3A5F] text-white py-3 rounded-xl hover:opacity-90"
>
  {t("view")}
</button>
                      <button
                        type="button"
                        onClick={() => openDocument(license.id, "download")}
                        className="flex-1 text-center bg-[#C5A55A] text-white py-3 rounded-xl hover:opacity-90"
                      >
                         {t("download")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}