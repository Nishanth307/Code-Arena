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
