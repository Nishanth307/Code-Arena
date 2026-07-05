import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import AuthContext from "../../context/AuthContext";

function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);

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
                {user ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
                        <Link to="/profile" style={{ textDecoration: "none", color: "#007bff", fontSize: "0.95rem", fontWeight: "600" }}>
                            {user.firstName} {user.lastName} ({user.role})
                        </Link>
                        <button 
                            onClick={() => logout()} 
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
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
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

                {/* Mobile Menu Toggle Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="mobile-menu-toggle"
                    style={{
                        display: "none", // Hidden on desktop
                        flexDirection: "column",
                        justifyContent: "space-between",
                        width: "22px",
                        height: "16px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        boxSizing: "border-box"
                    }}
                >
                    <span style={{ width: "22px", height: "2px", backgroundColor: "var(--text-h)", borderRadius: "2px" }} />
                    <span style={{ width: "22px", height: "2px", backgroundColor: "var(--text-h)", borderRadius: "2px" }} />
                    <span style={{ width: "22px", height: "2px", backgroundColor: "var(--text-h)", borderRadius: "2px" }} />
                </button>
            </div>

            {/* Mobile Drawer Overlay */}
            {isOpen && (
                <div 
                    className="mobile-drawer"
                    style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        backgroundColor: "var(--bg)",
                        borderBottom: "1px solid var(--border)",
                        padding: "1rem 2rem",
                        display: "none", // overridden in media query on mobile
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        zIndex: 99
                    }}
                >
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {user && (
                            <li>
                                <Link to="/dashboard" onClick={() => setIsOpen(false)} style={{ textDecoration: "none", color: "var(--text)", fontWeight: "600" }}>Dashboard</Link>
                            </li>
                        )}
                        <li>
                            <Link to="/problems" onClick={() => setIsOpen(false)} style={{ textDecoration: "none", color: "var(--text)", fontWeight: "600" }}>Problems</Link>
                        </li>
                        <li>
                            <Link to="/contests" onClick={() => setIsOpen(false)} style={{ textDecoration: "none", color: "var(--text)", fontWeight: "600" }}>Contests</Link>
                        </li>
                        {user && (
                            <li>
                                <Link to="/submissions" onClick={() => setIsOpen(false)} style={{ textDecoration: "none", color: "var(--text)", fontWeight: "600" }}>Submissions</Link>
                            </li>
                        )}
                        <li>
                            <Link to="/leaderboard" onClick={() => setIsOpen(false)} style={{ textDecoration: "none", color: "var(--text)", fontWeight: "600" }}>Leaderboard</Link>
                        </li>
                        {user && (
                            <li>
                                <Link to="/profile" onClick={() => setIsOpen(false)} style={{ textDecoration: "none", color: "var(--text)", fontWeight: "600" }}>Profile</Link>
                            </li>
                        )}
                        {user?.role === "ADMIN" && (
                            <>
                                <li style={{ borderTop: "1px solid var(--border)", paddingTop: "0.5rem", marginTop: "0.5rem" }}>
                                    <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#dc3545", textTransform: "uppercase" }}>Admin Panel</span>
                                </li>
                                <li>
                                    <Link to="/problems/create" onClick={() => setIsOpen(false)} style={{ textDecoration: "none", color: "#dc3545", fontWeight: "600" }}>+ Create Problem</Link>
                                </li>
                                <li>
                                    <Link to="/contests/create" onClick={() => setIsOpen(false)} style={{ textDecoration: "none", color: "#dc3545", fontWeight: "600" }}>+ Create Contest</Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            )}
        </nav>
    );
}

export default Navbar;