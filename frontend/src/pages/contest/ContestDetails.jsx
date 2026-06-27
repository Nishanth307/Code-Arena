import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { getContestById, registerContest, joinContest, getContestLeaderboard, getContestRegistrationStatus } from "../../api/contestApi";
import AuthContext from "../../context/AuthContext";

function ContestDetails() {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [contest, setContest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [isRegistered, setIsRegistered] = useState(false);
    const [hasJoined, setHasJoined] = useState(() => {
        return sessionStorage.getItem(`joined_contest_${id}`) === "true";
    });
    const [leaderboard, setLeaderboard] = useState([]);
    const [activeTab, setActiveTab] = useState("problems");
    const [actionLoading, setActionLoading] = useState(false);
    const [actionMessage, setActionMessage] = useState(null);

    useEffect(() => {
        fetchContest();
    }, [id]);

    useEffect(() => {
        if (activeTab === "leaderboard") {
            fetchLeaderboard();
        }
    }, [activeTab]);

    const fetchContest = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getContestById(id);
            setContest(res.contest || res.data?.contest || res.data || res);
            
            if (user) {
                try {
                    const statusRes = await getContestRegistrationStatus(id);
                    setIsRegistered(statusRes.registered);
                } catch (statusErr) {
                    console.error("Error fetching registration status:", statusErr);
                    setIsRegistered(res.isRegistered);
                }
            } else {
                setIsRegistered(false);
            }
        } catch (err) {
            console.error("Error fetching contest details:", err);
            setError(err.response?.data?.message || err.message || "Failed to load contest details.");
        } finally {
            setLoading(false);
        }
    };

    const fetchLeaderboard = async () => {
        try {
            const res = await getContestLeaderboard(id);
            setLeaderboard(res.leaderboard || []);
        } catch (err) {
            console.error("Error fetching leaderboard:", err);
        }
    };

    const handleRegister = async () => {
        setActionLoading(true);
        setActionMessage(null);
        try {
            await registerContest(id);
            setIsRegistered(true);
            setActionMessage({ type: "success", text: "Successfully registered for this contest!" });
            fetchContest();
        } catch (err) {
            setActionMessage({ type: "error", text: err.response?.data?.message || "Registration failed." });
        } finally {
            setActionLoading(false);
        }
    };

    const handleJoin = async () => {
        setActionLoading(true);
        setActionMessage(null);
        try {
            await joinContest(id);
            setHasJoined(true);
            sessionStorage.setItem(`joined_contest_${id}`, "true");
            setActionMessage({ type: "success", text: "Welcome to the contest!" });
        } catch (err) {
            setActionMessage({ type: "error", text: err.response?.data?.message || "Failed to join contest." });
        } finally {
            setActionLoading(false);
        }
    };

    const getContestStatus = (startStr, endStr) => {
        const now = new Date();
        const start = new Date(startStr);
        const end = new Date(endStr);

        if (now < start) {
            return { label: "Upcoming", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)", isUpcoming: true, isActive: false };
        } else if (now >= start && now <= end) {
            return { label: "Running", color: "#10b981", bg: "rgba(16, 185, 129, 0.1)", isUpcoming: false, isActive: true };
        } else {
            return { label: "Completed", color: "#6b7280", bg: "rgba(107, 114, 128, 0.1)", isUpcoming: false, isActive: false };
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
    const isAdmin = user?.role === "ADMIN";
    const renderUserAction = () => {
        if (isAdmin) return null;
        
        const now = new Date();
        const start = new Date(contest.startTime);
        const end = new Date(contest.endTime);

        if (now > end) {
            return (
                <span style={{ color: "var(--text)", fontWeight: "600", fontSize: "0.95rem" }}>
                    Contest Ended
                </span>
            );
        }

        if (now >= start && now <= end) {
            if (isRegistered) {
                if (!hasJoined) {
                    return (
                        <button
                            onClick={handleJoin}
                            disabled={actionLoading}
                            style={{
                                padding: "0.6rem 1.5rem",
                                backgroundColor: "#10b981",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "background-color 0.2s"
                            }}
                        >
                            {actionLoading ? "Joining..." : "Enter Contest"}
                        </button>
                    );
                } else {
                    return (
                        <span style={{ color: "#10b981", fontWeight: "600", fontSize: "0.95rem" }}>
                            ✓ You have entered the contest and are participating
                        </span>
                    );
                }
            } else {
                return (
                    <span style={{ color: "#ef4444", fontWeight: "600", fontSize: "0.95rem" }}>
                        Registration Closed
                    </span>
                );
            }
        }

        // Upcoming contest (now < start)
        if (isRegistered) {
            return (
                <span style={{ color: "#10b981", fontWeight: "600", fontSize: "0.95rem" }}>
                    Registered ✓
                </span>
            );
        }

        return (
            <button
                onClick={handleRegister}
                disabled={actionLoading}
                style={{
                    padding: "0.6rem 1.5rem",
                    backgroundColor: "var(--accent)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "background-color 0.2s"
                }}
            >
                {actionLoading ? "Registering..." : "Register"}
            </button>
        );
    };

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
                    fontSize: "0.9rem",
                    marginBottom: "1.5rem"
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

                {/* Actions Section */}
                {actionMessage && (
                    <div style={{
                        padding: "0.8rem 1rem",
                        borderRadius: "6px",
                        marginBottom: "1rem",
                        backgroundColor: actionMessage.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                        color: actionMessage.type === "success" ? "#10b981" : "#ef4444",
                        fontSize: "0.9rem",
                        fontWeight: "500"
                    }}>
                        {actionMessage.text}
                    </div>
                )}

                {renderUserAction()}
                {isAdmin && (
                    <div style={{ color: "var(--text)", fontStyle: "italic", fontSize: "0.9rem" }}>
                        You are viewing this contest as an Admin. Admins cannot register or participate.
                    </div>
                )}
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: "1.5rem" }}>
                <button
                    onClick={() => setActiveTab("problems")}
                    style={{
                        padding: "0.75rem 1.5rem",
                        backgroundColor: "transparent",
                        border: "none",
                        borderBottom: activeTab === "problems" ? "2px solid var(--accent)" : "2px solid transparent",
                        color: activeTab === "problems" ? "var(--accent)" : "var(--text)",
                        fontWeight: "600",
                        cursor: "pointer"
                    }}
                >
                    Problems
                </button>
                <button
                    onClick={() => setActiveTab("leaderboard")}
                    style={{
                        padding: "0.75rem 1.5rem",
                        backgroundColor: "transparent",
                        border: "none",
                        borderBottom: activeTab === "leaderboard" ? "2px solid var(--accent)" : "2px solid transparent",
                        color: activeTab === "leaderboard" ? "var(--accent)" : "var(--text)",
                        fontWeight: "600",
                        cursor: "pointer"
                    }}
                >
                    Leaderboard
                </button>
            </div>

            {/* Tab Contents */}
            {activeTab === "problems" && (
                <div>
                    {statusInfo.isUpcoming && !isAdmin ? (
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
                    ) : !isAdmin && !hasJoined ? (
                        <div style={{
                            textAlign: "center",
                            padding: "3rem 1.5rem",
                            border: "1px dashed var(--border)",
                            borderRadius: "8px",
                            backgroundColor: "var(--bg)"
                        }}>
                            <span style={{ fontSize: "2rem", display: "block", marginBottom: "0.75rem" }}>🔑</span>
                            <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--text-h)" }}>Access Locked</h4>
                            <p style={{ color: "var(--text)", margin: 0, fontSize: "0.9rem" }}>
                                Please register and join the contest to view problems.
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
                                                    to={`/problems/${problem._id}?contestId=${contest._id}`}
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
            )}

            {activeTab === "leaderboard" && (
                <div>
                    {leaderboard.length === 0 ? (
                        <div style={{
                            textAlign: "center",
                            padding: "3rem 1.5rem",
                            border: "1px dashed var(--border)",
                            borderRadius: "8px",
                            backgroundColor: "var(--bg)",
                            color: "var(--text)"
                        }}>
                            No registered participants have submitted code yet.
                        </div>
                    ) : (
                        <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: "8px", boxShadow: "var(--shadow)" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", backgroundColor: "var(--bg)" }}>
                                <thead>
                                    <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--text)", fontWeight: "600", fontSize: "0.9rem" }}>
                                        <th style={{ padding: "1rem" }}>Rank</th>
                                        <th style={{ padding: "1rem" }}>Name</th>
                                        <th style={{ padding: "1rem" }}>Solved</th>
                                        <th style={{ padding: "1rem" }}>Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboard.map((row) => (
                                        <tr key={row.userId} style={{ borderBottom: "1px solid var(--border)" }}>
                                            <td style={{ padding: "1rem", color: "var(--text)", fontWeight: "600" }}>{row.rank}</td>
                                            <td style={{ padding: "1rem", fontWeight: "600", color: "var(--text-h)" }}>{row.firstName} {row.lastName}</td>
                                            <td style={{ padding: "1rem", color: "var(--text)" }}>{row.problemsSolved}</td>
                                            <td style={{ padding: "1rem", color: "var(--accent)", fontWeight: "bold" }}>{row.score}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default ContestDetails;