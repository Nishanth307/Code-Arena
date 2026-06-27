import axiosInstance from "./axiosInstance";

export const loginUser = async (email, password) => {
    const response = await axiosInstance.post("user/login", { email, password });
    const data = response.data;
    if (data.token) {
        localStorage.setItem("token", data.token);
    }
    if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
};

export const registerUser = async (firstName, lastName, email, password) => {
    const response = await axiosInstance.post("user/register", { firstName, lastName, email, password });
    const data = response.data;
    if (data.token) {
        localStorage.setItem("token", data.token);
    }
    if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
};

export const logoutUser = async () => {
    const response = await axiosInstance.post("user/logout");
    return response.data;
};

export const updateProfile = async (profileData) => {
    const response = await axiosInstance.put("user/profile", profileData);
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await axiosInstance.get("user/get-current-user");
    return response.data;
};
