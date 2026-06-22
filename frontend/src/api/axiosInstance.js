import axios from "axios";
import settings from "../config/settings";

const axiosInstance = axios.create({
    baseURL: settings.VITE_API_URL,
    withCredentials: true,
    headers:{
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;

