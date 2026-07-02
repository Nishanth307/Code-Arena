import axios from "axios";
import settings from "../config/settings";

const axiosInstance = axios.create({
    baseURL: settings.VITE_API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("RAW AXIOS ERROR:", error.code, error.message, error.config?.url);
        return Promise.reject(error);
    }
);

export default axiosInstance;
