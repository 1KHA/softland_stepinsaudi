import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Bell,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import CompanyHeader from "../components/CompanyHeader";
export default function CompanyNotifications() {
    const [notifications, setNotifications] = useState<any[]>([]);

useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:3000/companies/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications(res.data.notifications || []);
      await axios.put(
  "http://localhost:3000/companies/notifications/read",
  {},
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
    } catch (error) {
      console.log(error);
    }
  };

  fetchNotifications();
}, []);
  return (
    <>
      <CompanyHeader />

      <div className="min-h-screen bg-[#F5F2EA] p-8">
<div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-3xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
 <div className="flex items-center gap-4">
  <div className="w-14 h-14 rounded-2xl bg-[#C5A55A]/10 flex items-center justify-center">
    <Bell
      size={28}
      className="text-[#C5A55A]"
    />
  </div>

  <div>
    <h1 className="text-4xl font-bold text-[#1E3A5F]">
      Notifications
    </h1>

    <p className="text-gray-500 mt-2">
      Stay updated with the latest status of your documents and requests.
    </p>
  </div>
</div>

  <div className="bg-[#C5A55A] text-white px-4 py-2 rounded-full font-semibold">
    {notifications.length} Notifications
  </div>
</div>

<div className="mt-8 space-y-4">
  {notifications.length === 0 ? (
<div className="border-2 border-dashed border-[#E5E5E5] rounded-3xl p-12 text-center">
  <h3 className="text-xl font-semibold text-[#1E3A5F]">
    No notifications yet
  </h3>

  <p className="text-gray-500 mt-2">
    We'll notify you whenever there is an update on your requests or documents.
  </p>
</div>
  ) : (
    notifications.map((item: any) => {
      const rejected = item.type === "RESUBMISSION_REQUESTED";
const approved = item.type === "DOCUMENT_APPROVED";
const licenseIssued = item.type === "LICENSE_ISSUED";
      return (
<div
  key={item.id}
  className={`
    flex items-start gap-5
    rounded-3xl
    border
    p-6
    transition-all
    duration-300
    hover:shadow-xl
    hover:-translate-y-1

   ${
  rejected
    ? "bg-red-50 border-red-100"
    : licenseIssued
    ? "bg-[#FFF9EC] border-[#E8D39A]"
    : "bg-green-50 border-green-100"
}
  `}
>
          <div
className={`w-14 h-14 rounded-full flex items-center justify-center ${
  rejected
    ? "bg-red-100 text-red-500"
    : licenseIssued
    ? "bg-[#C5A55A]/20 text-[#C5A55A]"
    : "bg-green-100 text-green-600"
}`}
          >
            {rejected ? (
              <AlertTriangle size={22} />
            ) : (
              <CheckCircle2 size={22} />
            )}
          </div>

          <div className="flex-1">
<h3 className="text-lg font-bold text-[#1E3A5F]">
{rejected
  ? "Document Needs Re-upload"
  : approved
  ? "Document Approved"
  : licenseIssued
  ? "License Issued"
  : "System Notification"}
            </h3>

            <p className="text-gray-600 mt-2">
              {item.message}
            </p>

            <p className="text-xs text-gray-400 mt-3">
{new Date(item.created_at).toLocaleDateString("en-GB")} •{" "}
{new Date(item.created_at).toLocaleTimeString("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
})}            </p>
          </div>
        </div>
      );
    })
  )}
</div>
          </div>
        </div>
      </div>
    </>
  );
}