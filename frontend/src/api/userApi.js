import settings from "../config/settings";
import axiosInstance from "./axiosInstance";

const BASE = `${settings.BASE_URL}/api/user`;

export const loginUser = async(email,password) => {
    const res = await fetch(`${BASE}/login`,{
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({email, password}),
        credentials: "include"
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Login failed");
    
    // Save token for Axios request interceptor
    if (data.token) {
        localStorage.setItem("token", data.token);
    }
    return data;
};

export const registerUser = async (firstName, lastName, email, password) => {
    const res = await fetch(`${BASE}/register`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({firstName, lastName, email, password}),
        credentials: "include"
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");
    return data; 
};

// check
export const logoutUser = async (logoutData) => {
    const res = await axiosInstance.post(
        "user/logout",
    );
    return res.data;
}