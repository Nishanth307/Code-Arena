import axiosInstance from "./axiosInstance";
import settings from "../config/settings";

const BASE = `${settings.BASE_URL}/api/submission`;

export const getSubmissions = async () => {
    const response = await axiosInstance.get(`${BASE}/`);
    return response.data;
}

export const getSubmissionById = async (id) => {
    const response = await axiosInstance.get(`${BASE}/${id}`);
    return response.data;
}

export const createSubmission = async (submissionData) => {
    const response = await axiosInstance.post(
        `${BASE}/submit`,
        submissionData
    );
    return response.data;
}