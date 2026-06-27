import {
    createContext,
    useContext,
    useState,
    useEffect
} from "react";
import axiosInstance from "../api/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCurrentUser = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }
            const response = await axiosInstance.get("user/get-current-user");
            if (response.data?.success) {
                setUser(response.data.data);
                localStorage.setItem("user", JSON.stringify(response.data.data));
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const logout = async () => {
        try {
            await axiosInstance.post("user/logout");
        } catch {
            // ignore server logout errors
        } finally {
            setUser(null);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            localStorage.removeItem("last_submission_id");
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, logout, fetchCurrentUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
