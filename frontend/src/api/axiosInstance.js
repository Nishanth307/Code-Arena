import axios from "axios";
import settings from "../config/settings";

const axiosInstance = axios.create({
    baseUrl: settings.VITE_API_URL,
    withCredentials: true,
    headers:{
        "Content-Type": "application/json",
    },
});

// axiosInstance.interceptors.response.use(
//     (response) => response,
//     (error) => {

//         if (error.response?.status === 401) {
//             // redirect to login
//         }

//         return Promise.reject(error);
//     }
// );

export default axiosInstance;

