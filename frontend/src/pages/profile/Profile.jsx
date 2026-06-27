import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import { updateProfile } from "../../api/userApi";
import { getUserRanking } from "../../api/leaderboardApi";

export default function Profile() {
    const { user, setUser, fetchCurrentUser } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [form, setForm] = useState({ firstName: "", lastName: "", currentPassword: "", newPassword: "" });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setForm({ firstName: user.firstName, lastName: user.lastName, currentPassword: "", newPassword: "" });
            getUserRanking(user._id).then((res) => setStats(res.entry)).catch(() => {});
        }
    }, [user]);

    if (!user) {
        return (
            <div className="profile-container" style={{ padding: "2rem", textAlign: "center" }}>
                <h2>Please log in to view your profile.</h2>
                <Link to="/login" style={{ color: "#007bff" }}>Sign in</Link>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);
        try {
            const payload = { firstName: form.firstName, lastName: form.lastName };
            if (form.newPassword) {
                payload.currentPassword = form.currentPassword;
                payload.newPassword = form.newPassword;
            }
            const res = await updateProfile(payload);
            setMessage(res.message || "Profile updated");
            localStorage.setItem("user", JSON.stringify(res.data));
            setUser(res.data);
            await fetchCurrentUser();
            setForm((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-container" style={{ maxWidth: "700px", margin: "2rem auto", padding: "2rem" }}>
            <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
                <h1 style={{ margin: 0, fontSize: "2rem" }}>My Profile</h1>
                <p style={{ color: "var(--text)", marginTop: "0.25rem" }}>Manage your account and view your ranking.</p>
            </div>

            {stats && (
                <div style={{ marginBottom: "2rem", padding: "1rem", border: "1px solid var(--border)", borderRadius: "8px" }}>
                    <strong>Leaderboard Rank:</strong> {stats.rank ? `#${stats.rank}` : "Unranked"} |{" "}
                    <strong>Score:</strong> {stats.totalScore} |{" "}
                    <strong>Solved:</strong> {stats.problemsSolved}
                    <Link to={`/leaderboard/user/${user._id}`} style={{ marginLeft: "1rem", color: "#007bff" }}>View full stats</Link>
                </div>
            )}

            <div style={{ padding: "1.5rem", border: "1px solid var(--border)", borderRadius: "8px", marginBottom: "2rem" }}>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <h3>Update Profile</h3>
                <input
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    placeholder="First Name"
                    required
                    style={{ padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border)" }}
                />
                <input
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    placeholder="Last Name"
                    required
                    style={{ padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border)" }}
                />
                <input
                    type="password"
                    value={form.currentPassword}
                    onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                    placeholder="Current Password (required to change password)"
                    style={{ padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border)" }}
                />
                <input
                    type="password"
                    value={form.newPassword}
                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                    placeholder="New Password (optional)"
                    style={{ padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border)" }}
                />
                {message && <p style={{ color: "#155724" }}>{message}</p>}
                {error && <p style={{ color: "#721c24" }}>{error}</p>}
                <button type="submit" disabled={loading} style={{ padding: "0.7rem", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </form>
        </div>
    );
}
