import { Navigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";

function ProtectedRoute({ children }) {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div style={{ padding: "2rem", textAlign: "center" }}><h2>Loading...</h2></div>;
    }

    const token = localStorage.getItem("token");
    if (!token && !user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;
