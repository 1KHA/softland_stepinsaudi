// Base URL of the backend API.
// Override locally by setting VITE_API_URL in frontend/.env.development.local
// (e.g. VITE_API_URL=http://localhost:4000). Defaults to production.
export const API_URL =
  import.meta.env.VITE_API_URL || "https://soft-landing-platform.onrender.com";
