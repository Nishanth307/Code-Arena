import axiosInstance from "./axiosInstance";

// User / Common API calls
export const getContests = async () => {
    const response = await axiosInstance.get("contests/");
    return response.data;
};

export const getContestById = async (id) => {
    const response = await axiosInstance.get(`contests/${id}`);
    return response.data;
};

export const registerContest = async (id) => {
    const response = await axiosInstance.post(`contests/${id}/register`);
    return response.data;
};

export const joinContest = async (id) => {
    const response = await axiosInstance.post(`contests/${id}/join`);
    return response.data;
};

export const getContestLeaderboard = async (id) => {
    const response = await axiosInstance.get(`contests/${id}/leaderboard`);
    return response.data;
};

export const getContestRegistrationStatus = async (id) => {
    const response = await axiosInstance.get(`contests/${id}/status`);
    return response.data;
};

// Admin API calls
export const createContest = async (contestData) => {
    const response = await axiosInstance.post("admin/contests", contestData);
    return response.data;
};

export const updateContest = async (id, contestData) => {
    const response = await axiosInstance.put(`admin/contests/${id}`, contestData);
    return response.data;
};

export const deleteContest = async (id) => {
    const response = await axiosInstance.delete(`admin/contests/${id}`);
    return response.data;
};

export const getContestParticipants = async (id) => {
    const response = await axiosInstance.get(`admin/contests/${id}/participants`);
    return response.data;
};
