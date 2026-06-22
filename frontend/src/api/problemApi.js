import axiosInstance from "./axiosInstance";
import settings from "../config/settings";

const BASE = `${settings.BASE_URL}/api/problem`;

export const getProblems = async () => {
    const response = await axiosInstance.get(`${BASE}`);
    return response.data;
}

export const getProblemById = async (id) => {
    const response = await axiosInstance.get(`${BASE}/${id}`);
    return response.data;
}

export const createProblem = async (ProblemData) => {
    const response = await axiosInstance.post(
        `${BASE}/create`,
        ProblemData
    );  
    return response.data;
}

export const updateProblem = async (id, ProblemData) => {
    const response = await axiosInstance.put(
        `${BASE}/update/${id}`,
        ProblemData
    );
    return response.data;
}

export const deleteProblem = async (id) => {
    const response = await axiosInstance.delete(
        `${BASE}/delete/${id}`
    );
    return response.data;
}


