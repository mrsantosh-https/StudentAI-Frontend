import axios from "axios";

export const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// =========================================================
// REQUEST INTERCEPTOR
// =========================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    } else if (config.headers) {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =========================================================
// RESPONSE INTERCEPTOR
// =========================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.error(
        "401 Unauthorized:",
        error.response?.data
      );

      // Token invalid/expired
      localStorage.removeItem("token");

      // IMPORTANT:
      // Do not automatically redirect here.
      // Your individual pages can handle 401.
    }

    if (status === 403) {
      console.error(
        "403 Forbidden:",
        error.response?.data
      );
    }

    return Promise.reject(error);
  }
);

export default api;