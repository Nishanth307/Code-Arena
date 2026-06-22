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
                borderBottom: "1px solid var(--border)",
                backgroundColor: "var(--bg)",
                position: "sticky",
                top: 0,
                zIndex: 100,
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
            }}
        >
            <Link to="/" style={{ textDecoration: "none", color: "var(--text-h)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "700", letterSpacing: "-0.5px" }}>Online Judge</h2>
            </Link>
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "1.5rem"
            }}>
                <Link to="/problems" style={{ textDecoration: "none", color: "var(--text-h)", fontSize: "0.95rem", fontWeight: "500" }}>Problems</Link>
                <Link to="/contests" style={{ textDecoration: "none", color: "var(--text-h)", fontSize: "0.95rem", fontWeight: "500" }}>Contests</Link>
                <Link to="/submissions" style={{ textDecoration: "none", color: "var(--text-h)", fontSize: "0.95rem", fontWeight: "500" }}>Submissions</Link>
                
                {user ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", marginLeft: "0.5rem", borderLeft: "1px solid var(--border)", paddingLeft: "1.2rem" }}>
                        <Link to="/dashboard" style={{ textDecoration: "none", color: "var(--text-h)", fontSize: "0.95rem", fontWeight: "500" }}>
                            Dashboard
                        </Link>
                        <Link to="/profile" style={{ textDecoration: "none", color: "#007bff", fontSize: "0.95rem", fontWeight: "600" }}>
                            {user.firstName} {user.lastName} ({user.role})
                        </Link>
                        <button 
                            onClick={logout} 
                            style={{ 
                                padding: "0.4rem 0.8rem", 
                                border: "1px solid #dc3545", 
                                borderRadius: "6px", 
                                backgroundColor: "transparent", 
                                color: "#dc3545", 
                                fontWeight: "600",
                                fontSize: "0.85rem",
                                cursor: "pointer",
                                transition: "all 0.2s"
                            }}
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginLeft: "0.5rem", borderLeft: "1px solid var(--border)", paddingLeft: "1.2rem" }}>
                        <Link to="/login" style={{ textDecoration: "none", color: "var(--text-h)", fontSize: "0.95rem", fontWeight: "500" }}>Login</Link>
                        <Link 
                            to="/register" 
                            style={{ 
                                textDecoration: "none", 
                                color: "#fff", 
                                backgroundColor: "#007bff", 
                                padding: "0.4rem 0.9rem", 
                                borderRadius: "6px",
                                fontWeight: "600",
                                fontSize: "0.85rem"
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