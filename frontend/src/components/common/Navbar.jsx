import { Link } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";

function Navbar() {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem 2rem",
                borderBottom: "1px solid #ddd",
                backgroundColor: "#fff"
            }}
        >
            <h2 style={{ margin: 0 }}>Online Judge</h2>
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "1.5rem"
            }}>
                <Link to="/problems" style={{ textDecoration: "none", color: "#333", fontWeight: "500" }}>Problems</Link>
                <Link to="/contests" style={{ textDecoration: "none", color: "#333", fontWeight: "500" }}>Contests</Link>
                <Link to="/submissions" style={{ textDecoration: "none", color: "#333", fontWeight: "500" }}>Submissions</Link>
                {user ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <Link to="/dashboard" style={{ textDecoration: "none", color: "#007bff", fontWeight: "bold" }}>
                            Dashboard ({user.firstName})
                        </Link>
                        <button 
                            onClick={logout} 
                            style={{ 
                                padding: "0.4rem 0.8rem", 
                                border: "1px solid #dc3545", 
                                borderRadius: "4px", 
                                backgroundColor: "transparent", 
                                color: "#dc3545", 
                                cursor: "pointer" 
                            }}
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <Link to="/login" style={{ textDecoration: "none", color: "#007bff", fontWeight: "500" }}>Login</Link>
                        <Link 
                            to="/register" 
                            style={{ 
                                textDecoration: "none", 
                                color: "#fff", 
                                backgroundColor: "#007bff", 
                                padding: "0.4rem 0.8rem", 
                                borderRadius: "4px",
                                fontWeight: "500" 
                            }}
                        >
                            Register
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;