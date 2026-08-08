// Base URL of the backend API.
//
// Defaults to the Railway production API. The previous default was the Render
// deployment (soft-landing-platform.onrender.com), which was retired: it runs
// stale code, and on the free tier it cold-starts — a trivial request measured
// 22s, which surfaced to users as the signup form hanging for minutes before
// failing with "Email failed".
//
// Override locally by setting VITE_API_URL in frontend/.env.development.local
// (e.g. VITE_API_URL=http://localhost:4000). That file applies to `npm run dev`
// ONLY — production builds fall back to the default below unless VITE_API_URL
// is set in the build environment.
export const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://softlandstepinsaudi-production.up.railway.app";
