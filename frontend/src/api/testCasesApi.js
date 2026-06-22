import axiosInstance from "./axiosInstance";
import settings from "../config/settings";

const BASE = `${settings.BASE_URL}/api/testCase`;

export const createTestCase = async (testCaseData) => {
    const response = await axiosInstance.post(
        `${BASE}/`,
        testCaseData
    )
    return response.data;
}

export const uploadTestCases = async (testCaseData, problemId) => {
    const response = await axiosInstance.post(
        `${BASE}/upload/${problemId}`,
        testCaseData
    );
    return response.data;
}

export const getProblemById = async (problemId) => {
    const response = await axiosInstance.get(`${BASE}/problem/${problemId}`);
    return response.data;
}
