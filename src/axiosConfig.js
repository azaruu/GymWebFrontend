// src/axiosConfig.js
import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: "https://localhost:7128/api",
  // ❌ no need for withCredentials since we're not relying on HttpOnly cookies
});

// Attach JWT token from cookies
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("auth"); // ✅ unified cookie name
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
