// In production (Vercel), we use relative paths like "/api/..." which get rewritten.
// In development, we fallback to localhost:8000.
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "development" ? "http://localhost:8000" : "");

export default API_BASE_URL;
