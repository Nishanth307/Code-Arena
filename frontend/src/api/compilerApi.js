import axiosInstance from "./axiosInstance";

export const runCode = async (language, code, input) => {
    const response = await axiosInstance.post("compiler/run", { language, code, input });
    return response.data;
};
