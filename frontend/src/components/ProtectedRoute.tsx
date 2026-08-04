import { Navigate } from "react-router-dom";
import { getToken, getUser } from "../lib/session";

// NOTE: this is a UX convenience, not a security control — the role is read
// from localStorage and is trusted. Real enforcement lives on the server.
const ProtectedRoute = ({ children, allowedRole }: any) => {
  const token = getToken();

  // ❌ مافيه توكن
  if (!token) {
    return <Navigate to="/login" />;
  }

  // 🔓 نفك التوكن — getUser() never throws, it returns null on bad JSON.
  const user = getUser();

  // Support single role or array of roles
  if (allowedRole) {
    const allowed = Array.isArray(allowedRole) ? allowedRole : [allowedRole];

    // A token with no (or a malformed) user object cannot satisfy a role.
    if (!user || !allowed.includes(user.role)) {
      return <Navigate to="/login" />;
    }
  }

  return children;
};

export default ProtectedRoute;
