import React, { useEffect, useState } from "react";
import axios from "axios";
import CompanyHeader from "../components/CompanyHeader";
import { FileCheck } from "lucide-react";
export default function CompanyLicenses() {
  const [licenses, setLicenses] = useState<any[]>([]);

  useEffect(() => {
    const fetchLicenses = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:3000/companies/licenses",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

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
                  Licenses
                </h1>

                <p className="text-gray-500 mt-2">
                  View and download your issued licenses.
                </p>
              </div>

              <div className="bg-[#C5A55A] text-white px-4 py-2 rounded-full font-semibold">
                {licenses.length} Licenses
              </div>
            </div>

            {licenses.length === 0 ? (
              <div className="border-2 border-dashed border-[#E5E5E5] rounded-3xl p-12 text-center">
                <h3 className="text-xl font-semibold text-[#1E3A5F]">
                  No licenses available
                </h3>

                <p className="text-gray-500 mt-2">
                  Issued licenses will appear here once uploaded by the administrator.
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
    {license.license_name}
  </h2>
</div>

                    <p className="text-gray-500 mt-2">
Final License Issued
                    </p>

                    <p className="text-sm text-gray-400 mt-4">
                      {new Date(
                        license.uploaded_at
                      ).toLocaleDateString("en-GB")}
                    </p>

                    <div className="flex gap-3 mt-6">
                      <a
                        href={license.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 text-center bg-[#1E3A5F] text-white py-3 rounded-xl hover:opacity-90"
                      >
                        View
                      </a>

                      <a
                        href={license.file_url}
                        download
                        className="flex-1 text-center bg-[#C5A55A] text-white py-3 rounded-xl hover:opacity-90"
                      >
                        Download
                      </a>
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