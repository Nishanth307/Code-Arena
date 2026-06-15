import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                // Ignore parsing errors
            }
        } else {
            navigate("/login");
        }
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:5000/api/auth/logout", {
                method: "POST",
                credentials: "include"
            });
        } catch (e) {
            console.error("Logout failed on server", e);
        } finally {
            localStorage.removeItem("user");
            navigate("/login");
        }
    };

    if (!user) return null;

    return (
        <div>
            <h1>Hello World</h1>
            <h3>Authentication Status: Success</h3>
            <p>Welcome, <strong>{user.firstName} {user.lastName}</strong></p>
            <p>Email: {user.email}</p>
            <button onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
}
