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
        let friendlyMessage = "Something went wrong. Please try again.";

        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;

            if (status === 502 || status === 503 || status === 504) {
                friendlyMessage = "The service is temporarily unavailable. Please try again in a few moments.";
            } else if (status === 401) {
                friendlyMessage = data?.message || "Authentication required. Please log in.";
            } else if (status === 403) {
                friendlyMessage = data?.message || "Access denied. You do not have permission to perform this action.";
            } else if (status === 404) {
                friendlyMessage = data?.message || "The requested resource was not found.";
            } else if (status === 500) {
                friendlyMessage = data?.message || "Internal server error. Please try again later.";
            } else if (data && data.message) {
                friendlyMessage = data.message;
            } else if (data && data.errors && Array.isArray(data.errors)) {
                friendlyMessage = data.errors.join(" ");
            }
        } else if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
            friendlyMessage = "Unable to connect to the server right now. Please try again later.";
        } else if (error.message) {
            friendlyMessage = error.message;
        }

        error.message = friendlyMessage;
        console.error("Axios intercepted error message:", friendlyMessage);
        return Promise.reject(error);
    }
);

export default axiosInstance;
