import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRole }: any) => {
  const token = localStorage.getItem("token");

  // ❌ مافيه توكن
  if (!token) {
    return <Navigate to="/login" />;
  }

  // 🔓 نفك التوكن
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Support single role or array of roles
  if (allowedRole) {
    const allowed = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
    if (!allowed.includes(user.role)) {
      return <Navigate to="/login" />;
    }
  }

  return children;
};

export default ProtectedRoute;
