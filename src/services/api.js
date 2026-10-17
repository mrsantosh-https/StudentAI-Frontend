import axios from "axios";

export const API_URL =
  // import.meta.env.VITE_API_URL ||
  // "http://127.0.0.1:8000/api";
  import.meta.env.VITE_API_URL ||
  "https://studentai-backend.dockhosting.dev/api";

const api = axios.create({
  baseURL: API_URL,
  
  headers: {
    Accept: "application/json",
  },
});
console.log("StudentAI API URL:", API_URL);

// =========================================================
// REQUEST INTERCEPTOR
// =========================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
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

      localStorage.removeItem("token");
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