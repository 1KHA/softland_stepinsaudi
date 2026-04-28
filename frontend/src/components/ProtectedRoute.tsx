import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRole }: any) => {
  const token = localStorage.getItem("token");

  // ❌ مافيه توكن
  if (!token) {
    return <Navigate to="/login" />;
  }

  // 🔓 نفك التوكن
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // ❌ role غلط
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;