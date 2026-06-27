import axiosInstance from "./axiosInstance";

export const getSubmissions = async (params) => {
    const response = await axiosInstance.get("submission/", { params });
    return response.data;
};

export const getSubmissionById = async (id) => {
    const response = await axiosInstance.get(`submission/${id}`);
    return response.data;
};

export const createSubmission = async (submissionData) => {
    const response = await axiosInstance.post("submission/submit", submissionData);
    return response.data;
};
