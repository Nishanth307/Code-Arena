import { useContext } from "react";
import AuthContext from "../../context/AuthContext";

export default function Profile() {
    const { user } = useContext(AuthContext);

    if (!user) {
        return (
            <div className="profile-container" style={{ padding: "2rem", textAlign: "center" }}>
                <h2>Please log in to view your profile.</h2>
            </div>
        );
    }

    return (
        <div className="profile-container" style={{ maxWidth: "600px", margin: "2rem auto", padding: "2rem" }}>
            <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
                <h1 style={{ margin: 0, fontSize: "2rem" }}>My Profile</h1>
                <p style={{ color: "var(--text)", marginTop: "0.25rem" }}>Manage your account details and role permissions.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {/* Profile Detail Card */}
                <div style={{
                    padding: "1.5rem",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    backgroundColor: "var(--bg)",
                    boxShadow: "var(--shadow)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.2rem"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "0.8rem" }}>
                        <span style={{ fontWeight: "600", color: "var(--text)" }}>First Name</span>
                        <span style={{ color: "var(--text-h)", fontWeight: "500" }}>{user.firstName}</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "0.8rem" }}>
                        <span style={{ fontWeight: "600", color: "var(--text)" }}>Last Name</span>
                        <span style={{ color: "var(--text-h)", fontWeight: "500" }}>{user.lastName}</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "0.8rem" }}>
                        <span style={{ fontWeight: "600", color: "var(--text)" }}>Email Address</span>
                        <span style={{ color: "var(--text-h)", fontWeight: "500" }}>{user.email}</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "0.8rem" }}>
                        <span style={{ fontWeight: "600", color: "var(--text)" }}>Account Status</span>
                        <span style={{
                            color: "#155724",
                            backgroundColor: "#d4edda",
                            padding: "0.2rem 0.6rem",
                            borderRadius: "4px",
                            fontSize: "0.85rem",
                            fontWeight: "bold"
                        }}>
                            Active / Authenticated
                        </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.2rem" }}>
                        <span style={{ fontWeight: "600", color: "var(--text)" }}>System Role</span>
                        <span style={{
                            color: user.role === "ADMIN" ? "#721c24" : "#0c5460",
                            backgroundColor: user.role === "ADMIN" ? "#f8d7da" : "#e8f4fd",
                            padding: "0.2rem 0.6rem",
                            borderRadius: "4px",
                            fontSize: "0.85rem",
                            fontWeight: "bold"
                        }}>
                            {user.role}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
