import axiosInstance from "./axiosInstance";

export const getSubmissions = async () => {
    const response = await axiosInstance.get("submission/");
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

export const generateAiAnalysis = async (submissionId) => {
    const response = await axiosInstance.post(`submissions/${submissionId}/ai-analysis`, {}, {
        timeout: 90000 // 90 seconds timeout for AI generation
    });
    return response.data;
};

export const getAiLimit = async (submissionId) => {
    const response = await axiosInstance.get(`submissions/${submissionId}/ai-limit`);
    return response.data;
};
