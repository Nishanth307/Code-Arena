import axiosInstance from "./axiosInstance";

export const getLeaderboard = async (limit = 50) => {
    const response = await axiosInstance.get("leaderboard/", { params: { limit } });
    return response.data;
};

export const getUserRanking = async (userId) => {
    const response = await axiosInstance.get(`leaderboard/user/${userId}`);
    return response.data;
};
