import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Bell,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import CompanyHeader from "../components/CompanyHeader";
import { useTranslation } from "react-i18next";

import { API_URL } from "../config";
export default function CompanyNotifications() {
    const { t, i18n } = useTranslation();
    const [notifications, setNotifications] = useState<any[]>([]);

useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${API_URL}/companies/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications(res.data.notifications || []);
      await axios.put(
  `${API_URL}/companies/notifications/read`,
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

      <div className="min-h-screen bg-[#F4F7FB] p-8">
<div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-3xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
 <div className="flex items-center gap-4">
  <div className="w-14 h-14 rounded-2xl bg-[#1DBAEA]/10 flex items-center justify-center">
    <Bell
      size={28}
      className="text-[#1DBAEA]"
    />
  </div>

  <div>
    <h1 className="text-4xl font-bold text-[#2B3E8F]">
{t("notifications")}
    </h1>

<p className="text-gray-500 mt-2">
  {t("notificationsPage.subtitle")}
</p>
  </div>
</div>

  <div className="bg-[#1DBAEA] text-white px-4 py-2 rounded-full font-semibold">
{notifications.length} {t("notifications")}
  </div>
</div>

<div className="mt-8 space-y-4">
  {notifications.length === 0 ? (
<div className="border-2 border-dashed border-[#E5E5E5] rounded-3xl p-12 text-center">
<h3 className="text-xl font-semibold text-[#2B3E8F]">
  {t("notificationsPage.noNotifications")}
</h3>

<p className="text-gray-500 mt-2">
  {t("notificationsPage.noNotificationsDescription")}
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
    ? "bg-[#E8F7FD] border-[#4ECBF0]"
    : "bg-green-50 border-green-100"
}
  `}
>
          <div
className={`w-14 h-14 rounded-full flex items-center justify-center ${
  rejected
    ? "bg-red-100 text-red-500"
    : licenseIssued
    ? "bg-[#1DBAEA]/20 text-[#1DBAEA]"
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
<h3 className="text-lg font-bold text-[#2B3E8F]">
{rejected
  ? t("notificationsPage.documentNeedsReupload")
  : approved
  ? t("notificationsPage.documentApproved")
  : licenseIssued
  ? t("notificationsPage.licenseIssued")
  : t("notificationsPage.systemNotification")}
            </h3>

<p className="text-gray-600 mt-2">
  {item.type === "RESUBMISSION_REQUESTED"
? t("notificationsPage.resubmissionRequestedDesc")
    : item.type === "DOCUMENT_APPROVED"
? t("notificationsPage.documentApprovedDesc")
    : item.type === "LICENSE_ISSUED"
? t("notificationsPage.licenseIssuedDesc", {

license:
  i18n.language.startsWith("ar")
    ? item.message_ar?.split("|")[1] || ""
    : item.message?.split("|")[1] || ""
  })
  
    : i18n.language.startsWith("ar")
    ? (item.message_ar || item.message)
    : item.message}
</p>
<p className="text-xs text-gray-400 mt-3">
  {new Date(item.created_at).toLocaleDateString(
    i18n.language.startsWith("ar") ? "ar-SA" : "en-GB"
  )}{" "}
  •{" "}
  {new Date(item.created_at).toLocaleTimeString(
    i18n.language.startsWith("ar") ? "ar-SA" : "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  )}
</p>
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