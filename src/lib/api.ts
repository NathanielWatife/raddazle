import axios from "axios";

const raw = import.meta.env.VITE_API_URL as string | undefined;
let baseURL = "/api";
let apiBaseUrl = "";

if (raw && typeof raw === "string") {
  const trimmed = raw.replace(/\/$/, "");
  baseURL = /\/(api)(\/|$)/.test(trimmed) ? trimmed : `${trimmed}/api`;
  apiBaseUrl = trimmed.replace(/\/api$/, "");
}

const PLACEHOLDER_IMAGE = "/img/product-placeholder.jpg";

export const getImageUrl = (imagePath?: string | null): string => {
  if (!imagePath || imagePath === "null" || imagePath === "undefined") return PLACEHOLDER_IMAGE;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
  if (imagePath.startsWith("/uploads")) return apiBaseUrl ? `${apiBaseUrl}${imagePath}` : imagePath;
  return imagePath;
};

const TOKEN_KEY = "authToken";
export const setAuthToken = (token: string | null) => {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};
export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};
export const clearAuthToken = () => setAuthToken(null);

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error?.response?.status === 401) {
      const path = error.config?.url || "";
      if (!path.includes("/auth/me")) console.warn("Unauthorized:", path);
    }
    return Promise.reject(error);
  },
);

export default api;
