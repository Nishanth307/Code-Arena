import axiosInstance from "./axiosInstance";
import settings from "../config/settings";

const BASE = `${settings.BASE_URL}/api/compiler`;

export const runCode = async (language, code, input) => {
    const response = await axiosInstance.post(`${BASE}/run`, {
        language,
        code,
        input
    });
    return response.data;
};