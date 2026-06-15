import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
export default function CompanyHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);
const handleLogout = async () => {

try {

await axios.post(
"http://localhost:3000/auth/logout"
);

} catch (err) {

console.log(err);

}

localStorage.removeItem(
"token"
);

localStorage.removeItem(
"user"
);

navigate(
"/login"
);

};
useEffect(() => {
  
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:3000/companies/notifications/unread-count",
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
    label: "Dashboard",
    path: "/company-dashboard",
  },
  {
    label: "My Profile",
    path: "/company-profile",
  },
  {
    label: "Licenses",
    path: "/company-licenses",
  },
  {
    label: "Notifications",
    path: "/company-notifications",
  },
];

  return (
    <div className="bg-white border-b border-[#ECE7DD] shadow-sm">
<div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between gap-8">
            {/* Logo */}
        <div
          onClick={() => navigate("/company-dashboard")}
          className="flex items-center gap-3 cursor-pointer"
        >
          <img
            src="/StepInLogo.png"
            alt="StepIn"
className="w-12 h-12 object-contain"          />

          <div>
            <h3 className="text-[#1E3A5F] font-bold text-lg">
              STEPIN
            </h3>

<p className="text-xs text-[#8E8E8E]">
                  Saudi market entry simplified
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
      ? "bg-[#C5A55A] text-white shadow-md"
      : "text-[#1E3A5F] hover:bg-[#F7F3EE] hover:text-[#C5A55A] hover:-translate-y-0.5"
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
className="
ml-4
px-5
py-2.5
rounded-xl
text-sm
font-semibold
border
border-red-200
text-red-500
hover:bg-red-50
transition
"
>

Logout

</button>
        </div>
      </div>
    </div>
  );
}
