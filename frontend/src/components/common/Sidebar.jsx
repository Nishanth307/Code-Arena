import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";

function Sidebar() {
    const { user } = useContext(AuthContext);
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const linkStyle = (path) => ({
        display: "block",
        padding: "0.6rem 1rem",
        borderRadius: "6px",
        color: isActive(path) ? "#007bff" : "var(--text)",
        backgroundColor: isActive(path) ? "rgba(0, 123, 255, 0.08)" : "transparent",
        fontWeight: isActive(path) ? "600" : "500",
        textDecoration: "none",
        transition: "all 0.2s",
        marginBottom: "0.25rem"
    });

    return (
        <aside
            className="app-sidebar"
            style={{
                width: "220px",
                padding: "1.5rem 1rem",
                borderRight: "1px solid var(--border)",
                minHeight: "calc(100vh - 70px)",
                boxSizing: "border-box",
                backgroundColor: "var(--bg)"
            }}
        >
            <div style={{ marginBottom: "1.5rem" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", color: "var(--text)", paddingLeft: "1rem", letterSpacing: "0.5px" }}>Menu</span>
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {user && (
                    <li>
                        <Link to="/dashboard" style={linkStyle("/dashboard")}>
                            Dashboard
                        </Link>
                    </li>
                )}
                <li>
                    <Link to="/problems" style={linkStyle("/problems")}>
                        Problems
                    </Link>
                </li>
                <li>
                    <Link to="/contests" style={linkStyle("/contests")}>
                        Contests
                    </Link>
                </li>
                {user && (
                    <li>
                        <Link to="/submissions" style={linkStyle("/submissions")}>
                            Submissions
                        </Link>
                    </li>
                )}
                <li>
                    <Link to="/leaderboard" style={linkStyle("/leaderboard")}>
                        Leaderboard
                    </Link>
                </li>
                {user && (
                    <li>
                        <Link to="/profile" style={linkStyle("/profile")}>
                            Profile
                        </Link>
                    </li>
                )}
            </ul>

            {user?.role === "ADMIN" && (
                <div style={{ marginTop: "2rem" }}>
                    <div style={{ marginBottom: "1rem" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", color: "#dc3545", paddingLeft: "1rem", letterSpacing: "0.5px" }}>Admin Panel</span>
                    </div>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        <li>
                            <Link to="/problems/create" style={linkStyle("/problems/create")}>
                                + Create Problem
                            </Link>
                        </li>
                        <li>
                            <Link to="/contests/create" style={linkStyle("/contests/create")}>
                                + Create Contest
                            </Link>
                        </li>
                    </ul>
                </div>
            )}
        </aside>
    );
}

export default Sidebar;