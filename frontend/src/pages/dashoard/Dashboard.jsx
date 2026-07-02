import { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getSubmissionById, getSubmissions } from "../../api/submissionApi";
import { getUserRanking } from "../../api/leaderboardApi";
import AuthContext from "../../context/AuthContext";

export default function Dashboard() {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const [submissions, setSubmissions] = useState([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(true);
    const [lastSubmission, setLastSubmission] = useState(null);
    const [polling, setPolling] = useState(false);
    const [ranking, setRanking] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        fetchUserSubmissions(user._id);
        getUserRanking(user._id).then((res) => setRanking(res.entry)).catch(() => {});
    }, [user, navigate]);

    const fetchUserSubmissions = async (userId) => {
        try {
            setLoadingSubmissions(true);
            const res = await getSubmissions();
            setSubmissions(res.submissions || []);
        } catch (error) {
            console.error("Error fetching user submissions:", error);
        } finally {
            setLoadingSubmissions(false);
        }
    };

    useEffect(() => {
        const subId = localStorage.getItem("last_submission_id");
        if (!subId) return;

        let intervalId;
        const fetchStatus = async () => {
            try {
                setPolling(true);
                const res = await getSubmissionById(subId);
                setLastSubmission(res.submission);
                if (res.submission?.verdict !== "PENDING") {
                    clearInterval(intervalId);
                    setPolling(false);
                    if (user) fetchUserSubmissions(user._id);
                }
            } catch (error) {
                console.error("Error polling submission status:", error);
            }
        };

        fetchStatus();
        intervalId = setInterval(fetchStatus, 800);
        return () => clearInterval(intervalId);
    }, [user]);

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const handleClearTracking = () => {
        localStorage.removeItem("last_submission_id");
        setLastSubmission(null);
    };

    if (!user) return null;

    const totalSubmissions = submissions.length;
    const solvedProblems = new Set(
        submissions.filter((sub) => sub.verdict === "ACCEPTED").map((sub) => sub.problemId?._id || sub.problemId)
    );
    const problemsSolved = solvedProblems.size;

    const getVerdictStyle = (verdict) => {
        switch (verdict) {
            case "ACCEPTED":
                return { backgroundColor: "#d4edda", color: "#155724", border: "1px solid #c3e6cb", padding: "0.2rem 0.6rem", borderRadius: "4px", fontSize: "0.85rem", fontWeight: "bold" };
            case "COMPILATION_ERROR":
            case "WRONG_ANSWER":
            case "TIME_LIMIT_EXCEEDED":
            case "MEMORY_LIMIT_EXCEEDED":
            case "RUNTIME_ERROR":
                return { backgroundColor: "#f8d7da", color: "#721c24", border: "1px solid #f5c6cb", padding: "0.2rem 0.6rem", borderRadius: "4px", fontSize: "0.85rem", fontWeight: "bold" };
            default:
                return { backgroundColor: "#fff3cd", color: "#856404", border: "1px solid #ffeeba", padding: "0.2rem 0.6rem", borderRadius: "4px", fontSize: "0.85rem", fontWeight: "bold" };
        }
    };

    return (
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "1rem", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: "2rem" }}>Dashboard</h1>
                    <p style={{ color: "var(--text)", margin: "0.25rem 0 0 0" }}>Welcome back, {user.firstName}!</p>
                </div>
                <button onClick={handleLogout} style={{ padding: "0.5rem 1rem", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
                    Logout
                </button>
            </div>

            {lastSubmission && (
                <div style={{ padding: "1.2rem", border: "1px solid #ffeeba", borderRadius: "8px", backgroundColor: "#fff3cd", color: "#856404", marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <strong style={{ fontSize: "1.1rem" }}>Live Submission Tracking:</strong>
                        <span style={{ marginLeft: "1rem" }}>
                            Submission #{lastSubmission._id.slice(-6)} &rarr;
                            <span style={{ marginLeft: "0.5rem", padding: "0.25rem 0.5rem", borderRadius: "4px", fontWeight: "bold", backgroundColor: lastSubmission.verdict === "PENDING" ? "#ffeeba" : lastSubmission.verdict === "ACCEPTED" ? "#d4edda" : "#f8d7da" }}>
                                {lastSubmission.verdict}{polling && " ..."}
                            </span>
                        </span>
                        <Link to={`/submissions/${lastSubmission._id}`} style={{ marginLeft: "1rem", color: "#856404", fontWeight: "600" }}>View Details</Link>
                    </div>
                    <button onClick={handleClearTracking} style={{ border: "none", backgroundColor: "transparent", color: "#856404", cursor: "pointer", fontWeight: "bold", textDecoration: "underline" }}>
                        Dismiss
                    </button>
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
                <div style={{ padding: "1.5rem", border: "1px solid var(--border)", borderRadius: "8px", backgroundColor: "var(--bg)", boxShadow: "var(--shadow)" }}>
                    <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--text)" }}>Problems Solved</span>
                    <h2 style={{ fontSize: "2.5rem", margin: "0.5rem 0 0 0", color: "var(--text-h)" }}>{problemsSolved}</h2>
                </div>
                <div style={{ padding: "1.5rem", border: "1px solid var(--border)", borderRadius: "8px", backgroundColor: "var(--bg)", boxShadow: "var(--shadow)" }}>
                    <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--text)" }}>Total Submissions</span>
                    <h2 style={{ fontSize: "2.5rem", margin: "0.5rem 0 0 0", color: "var(--text-h)" }}>{totalSubmissions}</h2>
                </div>
                <div style={{ padding: "1.5rem", border: "1px solid var(--border)", borderRadius: "8px", backgroundColor: "var(--bg)", boxShadow: "var(--shadow)" }}>
                    <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--text)" }}>Leaderboard Score</span>
                    <h2 style={{ fontSize: "2.5rem", margin: "0.5rem 0 0 0", color: "#007bff" }}>{ranking?.totalScore ?? 0}</h2>
                    {ranking?.rank && <Link to={`/leaderboard/user/${user._id}`} style={{ fontSize: "0.85rem", color: "#007bff" }}>Rank #{ranking.rank}</Link>}
                </div>
                <div style={{ padding: "1.5rem", border: "1px solid var(--border)", borderRadius: "8px", backgroundColor: "var(--bg)", boxShadow: "var(--shadow)" }}>
                    <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--text)" }}>Quick Links</span>
                    <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <Link to="/problems" style={{ color: "#007bff", fontWeight: "600", textDecoration: "none" }}>Browse Problems</Link>
                        <Link to="/contests" style={{ color: "#007bff", fontWeight: "600", textDecoration: "none" }}>View Contests</Link>
                        <Link to="/leaderboard" style={{ color: "#007bff", fontWeight: "600", textDecoration: "none" }}>Leaderboard</Link>
                    </div>
                </div>
            </div>

            <div style={{ padding: "1.5rem", border: "1px solid var(--border)", borderRadius: "8px", backgroundColor: "var(--bg)", boxShadow: "var(--shadow)" }}>
                <h3 style={{ margin: "0 0 1.2rem 0", fontSize: "1.25rem", color: "var(--text-h)" }}>Recent Submissions</h3>
                {loadingSubmissions ? (
                    <p style={{ color: "var(--text)" }}>Loading submission logs...</p>
                ) : submissions.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2rem 0" }}>
                        <p style={{ color: "var(--text)", marginBottom: "1rem" }}>You haven't submitted any solutions yet.</p>
                        <Link to="/problems" style={{ textDecoration: "none", color: "#fff", backgroundColor: "#007bff", padding: "0.5rem 1rem", borderRadius: "6px", fontWeight: "bold" }}>
                            Browse Problems
                        </Link>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead>
                                <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--text)", fontWeight: "600" }}>
                                    <th style={{ padding: "0.75rem 0.5rem" }}>Problem</th>
                                    <th style={{ padding: "0.75rem 0.5rem" }}>Language</th>
                                    <th style={{ padding: "0.75rem 0.5rem" }}>Submitted At</th>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>Verdict</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.slice(0, 5).map((sub) => (
                                    <tr key={sub._id} style={{ borderBottom: "1px solid var(--border)" }}>
                                        <td style={{ padding: "1rem 0.5rem", fontWeight: "500" }}>
                                            <Link to={`/submissions/${sub._id}`} style={{ color: "var(--text-h)", textDecoration: "none" }}>
                                                {sub.problemId?.title || "Unknown Problem"}
                                            </Link>
                                        </td>
                                        <td style={{ padding: "1rem 0.5rem", textTransform: "uppercase", fontSize: "0.9rem", color: "var(--text)" }}>{sub.language}</td>
                                        <td style={{ padding: "1rem 0.5rem", fontSize: "0.9rem", color: "var(--text)" }}>{new Date(sub.submittedAt).toLocaleString()}</td>
                                        <td style={{ padding: "1rem 0.5rem", textAlign: "right" }}>
                                            <Link to={`/submissions/${sub._id}`} style={{ textDecoration: "none" }}>
                                                <span style={getVerdictStyle(sub.verdict)}>{sub.verdict}</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                         {submissions.length > 5 && (
                            <div style={{ marginTop: "1rem", textAlign: "center" }}>
                                <Link to="/submissions" style={{ color: "#007bff", fontWeight: "bold", textDecoration: "none" }}>View All Submissions &rarr;</Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
