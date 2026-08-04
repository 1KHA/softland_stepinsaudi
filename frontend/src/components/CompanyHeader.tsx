import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import axios from "axios";
import { API_URL } from "../config";
import { StepInLogo, SpectrumBar } from "./StepInLogo";
import { authHeaders, logout } from "../lib/session";
export default function CompanyHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
const isArabic = i18n.language.startsWith("ar");

  const [unreadCount, setUnreadCount] = useState(0);
const handleLogout = async () => {

try {

await axios.post(
`${API_URL}/auth/logout`,
null,
{
headers: {
...authHeaders()
}
}
);

} catch (err) {

console.log(err);

}

logout(
navigate
);

};
useEffect(() => {
  
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${API_URL}/companies/notifications/unread-count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUnreadCount(res.data.count || 0);
    } catch (error) {
      console.log(error);
    }
  };

  fetchUnreadCount();
}, [location.pathname]);
const navItems = [
  {
    label: t("dashboard.dashboard"),
    path: "/company-dashboard",
  },
  {
    label: t("dashboard.profile"),
    path: "/company-profile",
  },
  {
    label: t("dashboard.licensing"),
    path: "/company-licenses",
  },
  {
    label: t("dashboard.notifications"),
    path: "/company-notifications",
  },
];

  return (
    <div className="bg-white border-b border-brand-navy/10 shadow-sm">
      {/* شريط الطيف — brand §02: the spectrum rule tops the shell. */}
      <SpectrumBar />
<div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between gap-8">
            {/* Logo */}
        <div
          onClick={() => navigate("/company-dashboard")}
          className="flex items-center gap-3 cursor-pointer"
        >
          {/* Brand §01: primary lockup on a light background. */}
          <StepInLogo size="md" />

          <div className="border-s border-brand-navy/15 ps-3">
            <p className="text-xs text-brand-gray">
              {t("companyHeader.subtitle")}
            </p>
          </div>
        </div>

        {/* Navigation */}
<div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
const active =
  location.pathname === item.path ||
  location.pathname.startsWith(item.path + "/");

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
  px-5 py-2.5
  rounded-xl
  text-sm
  font-semibold
  transition-all
  duration-300
  ease-in-out

  ${
    active
      ? "bg-[#1DBAEA] text-white shadow-md"
      : "text-[#2B3E8F] hover:bg-[#F4F7FB] hover:text-[#1DBAEA] hover:-translate-y-0.5"
  }
`}
>
<>
  {item.label}

  {item.path === "/company-notifications" &&
    unreadCount > 0 && (
      <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
        {unreadCount}
      </span>
    )}
</>
              </button>
            );
          })}
          <button
  onClick={handleLogout}
  title={t("logout")}
  className={`
    ${isArabic ? "ml-4" : "mr-4"}
    p-2
    rounded-xl
    text-red-500
    hover:bg-red-50
    transition
  `}
>
  <LogOut className="w-6 h-6" />
</button>
        </div>
        <button
onClick={() => {
  const newLang = isArabic ? "en" : "ar";

  localStorage.setItem("language", newLang);

  i18n.changeLanguage(newLang);
}}
  className="px-4 py-2 rounded-xl border border-[#D8E4F5] text-sm font-semibold text-[#2B3E8F] hover:bg-[#F4F7FB]"
>
  🌐 {isArabic ? "EN" : "AR"}
</button>
      </div>
    </div>
  );
}
