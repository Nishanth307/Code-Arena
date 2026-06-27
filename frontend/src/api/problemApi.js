import axiosInstance from "./axiosInstance";

export const getProblems = async () => {
    const response = await axiosInstance.get("problem/");
    return response.data;
};

export const getProblemById = async (id) => {
    const response = await axiosInstance.get(`problem/${id}`);
    return response.data;
};

export const createProblem = async (problemData) => {
    const response = await axiosInstance.post("problem/create", problemData);
    return response.data;
};

export const updateProblem = async (id, problemData) => {
    const response = await axiosInstance.put(`problem/update/${id}`, problemData);
    return response.data;
};

export const deleteProblem = async (id) => {
    const response = await axiosInstance.delete(`problem/delete/${id}`);
    return response.data;
};
