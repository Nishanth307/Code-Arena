import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getContestById } from "../../api/contestApi";

function ContestDetails() {
    const { id } = useParams();
    const [contest, setContest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchContest();
    }, [id]);

    const fetchContest = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getContestById(id);
            setContest(res.data || res);
        } catch (err) {
            console.error("Error fetching contest details:", err);
            setError(err.response?.data?.message || err.message || "Failed to load contest details.");
        } finally {
            setLoading(false);
        }
    };

    const getContestStatus = (startStr, endStr) => {
        const now = new Date();
        const start = new Date(startStr);
        const end = new Date(endStr);

        if (now < start) {
            return { label: "Upcoming", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)", isUpcoming: true };
        } else if (now >= start && now <= end) {
            return { label: "Running", color: "#10b981", bg: "rgba(16, 185, 129, 0.1)", isUpcoming: false };
        } else {
            return { label: "Completed", color: "#6b7280", bg: "rgba(107, 114, 128, 0.1)", isUpcoming: false };
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const options = {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        };
        return new Date(dateString).toLocaleString(undefined, options);
    };

    if (loading) {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
                <div style={{
                    border: "3px solid var(--border)",
                    borderTop: "3px solid var(--accent)",
                    borderRadius: "50%",
                    width: "30px",
                    height: "30px",
                    animation: "spin 1s linear infinite",
                    marginBottom: "1rem"
                }}></div>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
                <div style={{ color: "var(--text)", fontSize: "1rem", fontWeight: "500" }}>Loading contest details...</div>
            </div>
        );
    }

    if (error || !contest) {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", maxWidth: "500px", margin: "0 auto", padding: "2rem", textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
                <h3 style={{ marginBottom: "0.5rem", color: "var(--text-h)" }}>Error Loading Contest</h3>
                <p style={{ color: "var(--text)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>{error || "Contest not found."}</p>
                <Link
                    to="/contests"
                    style={{
                        padding: "0.6rem 1.5rem",
                        backgroundColor: "var(--accent)",
                        color: "#fff",
                        textDecoration: "none",
                        borderRadius: "6px",
                        fontWeight: "600",
                        transition: "background-color 0.2s"
                    }}
                >
                    Back to Contests
                </Link>
            </div>
        );
    }

    const statusInfo = getContestStatus(contest.startTime, contest.endTime);
    const problems = contest.problems || [];

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1.5rem" }}>
            <Link
                to="/contests"
                style={{
                    textDecoration: "none",
                    color: "var(--text)",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    marginBottom: "1.5rem"
                }}
            >
                ← Back to Contests
            </Link>

            <div style={{
                backgroundColor: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "2rem",
                boxShadow: "var(--shadow)",
                marginBottom: "2rem"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
                    <h1 style={{ margin: 0, fontSize: "2rem", color: "var(--text-h)" }}>{contest.title}</h1>
                    <span style={{
                        backgroundColor: statusInfo.bg,
                        color: statusInfo.color,
                        padding: "0.3rem 0.8rem",
                        borderRadius: "9999px",
                        fontWeight: "600",
                        fontSize: "0.8rem",
                        border: `1px solid ${statusInfo.color}33`
                    }}>
                        {statusInfo.label}
                    </span>
                </div>

                <p style={{
                    fontSize: "1.05rem",
                    color: "var(--text)",
                    lineHeight: "1.6",
                    margin: "0 0 2rem 0",
                    whiteSpace: "pre-wrap"
                }}>
                    {contest.description || "No description provided for this contest."}
                </p>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "1.5rem",
                    backgroundColor: "var(--code-bg)",
                    padding: "1.2rem",
                    borderRadius: "8px",
                    fontSize: "0.9rem"
                }}>
                    <div>
                        <span style={{ display: "block", color: "var(--text)", opacity: 0.8, marginBottom: "0.25rem" }}>Start Time</span>
                        <strong style={{ color: "var(--text-h)" }}>{formatDate(contest.startTime)}</strong>
                    </div>
                    <div>
                        <span style={{ display: "block", color: "var(--text)", opacity: 0.8, marginBottom: "0.25rem" }}>End Time</span>
                        <strong style={{ color: "var(--text-h)" }}>{formatDate(contest.endTime)}</strong>
                    </div>
                    <div>
                        <span style={{ display: "block", color: "var(--text)", opacity: 0.8, marginBottom: "0.25rem" }}>Participants</span>
                        <strong style={{ color: "var(--text-h)" }}>{contest.participantCount || 0} registered</strong>
                    </div>
                </div>
            </div>

            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "var(--text-h)" }}>Contest Problems</h2>

            {statusInfo.isUpcoming ? (
                <div style={{
                    textAlign: "center",
                    padding: "3rem 1.5rem",
                    border: "1px dashed var(--border)",
                    borderRadius: "8px",
                    backgroundColor: "var(--bg)"
                }}>
                    <span style={{ fontSize: "2rem", display: "block", marginBottom: "0.75rem" }}>🔒</span>
                    <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--text-h)" }}>Contest Has Not Started</h4>
                    <p style={{ color: "var(--text)", margin: 0, fontSize: "0.9rem" }}>
                        Problems will be revealed on <strong>{formatDate(contest.startTime)}</strong>.
                    </p>
                </div>
            ) : problems.length === 0 ? (
                <div style={{
                    textAlign: "center",
                    padding: "3rem 1.5rem",
                    border: "1px dashed var(--border)",
                    borderRadius: "8px",
                    backgroundColor: "var(--bg)",
                    color: "var(--text)"
                }}>
                    No problems are added to this contest yet.
                </div>
            ) : (
                <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: "8px", boxShadow: "var(--shadow)" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", backgroundColor: "var(--bg)" }}>
                        <thead>
                            <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--text)", fontWeight: "600", fontSize: "0.9rem" }}>
                                <th style={{ padding: "1rem" }}>#</th>
                                <th style={{ padding: "1rem" }}>Problem Title</th>
                                <th style={{ padding: "1rem" }}>Difficulty</th>
                                <th style={{ padding: "1rem", textAlign: "right" }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {problems.map((problem, index) => (
                                <tr key={problem._id} style={{ borderBottom: "1px solid var(--border)" }}>
                                    <td style={{ padding: "1rem", color: "var(--text)", fontWeight: "500" }}>{index + 1}</td>
                                    <td style={{ padding: "1rem", fontWeight: "600", color: "var(--text-h)" }}>{problem.title}</td>
                                    <td style={{ padding: "1rem" }}>
                                        <span style={{
                                            padding: "0.25rem 0.6rem",
                                            borderRadius: "4px",
                                            fontWeight: "bold",
                                            fontSize: "0.8rem",
                                            backgroundColor: problem.difficulty === "EASY" ? "#d4edda" : problem.difficulty === "MEDIUM" ? "#fff3cd" : "#f8d7da",
                                            color: problem.difficulty === "EASY" ? "#155724" : problem.difficulty === "MEDIUM" ? "#856404" : "#721c24"
                                        }}>
                                            {problem.difficulty}
                                        </span>
                                    </td>
                                    <td style={{ padding: "1rem", textAlign: "right" }}>
                                        <Link
                                            to={`/problems/${problem._id}`}
                                            style={{
                                                textDecoration: "none",
                                                color: "#007bff",
                                                fontWeight: "bold",
                                                fontSize: "0.9rem"
                                            }}
                                        >
                                            Solve
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ContestDetails;