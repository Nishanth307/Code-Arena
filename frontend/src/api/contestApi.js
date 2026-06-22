import axiosInstance from "./axiosInstance";
import settings from "../config/settings";

const BASE = `${settings.BASE_URL}/api/contest`;

export const getContests = async () => {
    const response = await axiosInstance.get(`${BASE}`);
    return response.data;
}

export const getContestById = async (id) => {
    const response = await axiosInstance.get(`${BASE}/${id}`);
    return response.data;
}

export const createContest = async (contestData) => {
    const response = await axiosInstance.post(
        `${BASE}/create`,
        contestData
    );
    return response.data;
}

export const updateContest = async (id, contestData) => {
    const response = await axiosInstance.put(
        `${BASE}/update/${id}`,
        contestData
    );
    return response.data;
}

export const deleteContest = async (id) => {
    const response = await axiosInstance.delete(
        `${BASE}/delete/${id}`
    );
    return response.data;
}

