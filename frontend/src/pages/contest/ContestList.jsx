import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { getContests, deleteContest } from "../../api/contestApi";
import AuthContext from "../../context/AuthContext";

function ContestList() {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchContests();
    }, []);

    const fetchContests = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getContests();
            // Backend returns { success: true, message: "...", contests: [...] }
            // Let's resolve the crash by safely extracting the array
            const list = Array.isArray(data) ? data : (data?.contests || []);
            setContests(list);
        } catch (err) {
            console.error("Error fetching contests:", err);
            setError(err.response?.data?.message || err.message || "Failed to load contests. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this contest?");
        if (!confirmDelete) return;
        try {
            await deleteContest(id);
            fetchContests();
        } catch (err) {
            console.error("Error deleting contest:", err);
            alert(err.response?.data?.message || err.message || "Failed to delete contest");
        }
    };

    const getContestStatus = (contest) => {
        const now = new Date();
        const start = new Date(contest.startTime);
        const end = new Date(contest.endTime);

        if (now < start) {
            return { label: "Upcoming", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)" };
        } else if (now >= start && now <= end) {
            return { label: "Running", color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" };
        } else {
            return { label: "Completed", color: "#6b7280", bg: "rgba(107, 114, 128, 0.1)" };
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

    const isAdmin = user?.role === "ADMIN";

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
                <div style={{ color: "var(--text)", fontSize: "1rem", fontWeight: "500" }}>Loading contests...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", maxWidth: "500px", margin: "0 auto", padding: "2rem", textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
                <h3 style={{ marginBottom: "0.5rem", color: "var(--text-h)" }}>Failed to load contests</h3>
                <p style={{ color: "var(--text)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>{error}</p>
                <button
                    onClick={fetchContests}
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
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: "2rem", color: "var(--text-h)" }}>Contests</h1>
                    <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.9rem", color: "var(--text)" }}>Join running or practice completed coding challenges.</p>
                </div>
                {isAdmin && (
                    <Link
                        to="/contests/create"
                        style={{
                            textDecoration: "none",
                            color: "#fff",
                            backgroundColor: "#28a745",
                            padding: "0.5rem 1.2rem",
                            borderRadius: "6px",
                            fontWeight: "bold",
                            fontSize: "0.9rem",
                            boxShadow: "0 2px 4px rgba(40, 167, 69, 0.15)",
                            transition: "background-color 0.2s"
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#218838"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "#28a745"}
                    >
                        + Create Contest
                    </Link>
                )}
            </div>

            {contests.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 2rem", border: "1px dashed var(--border)", borderRadius: "12px", backgroundColor: "var(--bg)", marginTop: "2rem" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📅</div>
                    <h3 style={{ color: "var(--text-h)", marginBottom: "0.5rem" }}>No contests available</h3>
                    <p style={{ color: "var(--text)", margin: 0 }}>Check back later for upcoming coding challenges!</p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
                    {contests.map((contest) => {
                        const statusInfo = getContestStatus(contest);
                        return (
                            <div
                                key={contest._id}
                                style={{
                                    padding: "1.5rem",
                                    border: "1px solid var(--border)",
                                    borderRadius: "10px",
                                    backgroundColor: "var(--bg)",
                                    boxShadow: "var(--shadow)",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    gap: "1.2rem",
                                    transition: "transform 0.2s, box-shadow 0.2s"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    e.currentTarget.style.boxShadow = "var(--shadow-md)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "none";
                                    e.currentTarget.style.boxShadow = "var(--shadow)";
                                }}
                            >
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "0.75rem" }}>
                                        <h3 style={{ margin: 0, fontSize: "1.2rem", color: "var(--text-h)", fontWeight: "600", lineHeight: "1.3" }}>
                                            {contest.title}
                                        </h3>
                                        <span style={{
                                            backgroundColor: statusInfo.bg,
                                            color: statusInfo.color,
                                            padding: "0.25rem 0.6rem",
                                            borderRadius: "9999px",
                                            fontWeight: "600",
                                            fontSize: "0.75rem",
                                            whiteSpace: "nowrap",
                                            border: `1px solid ${statusInfo.color}33`
                                        }}>
                                            {statusInfo.label}
                                        </span>
                                    </div>
                                    <p style={{
                                        color: "var(--text)",
                                        fontSize: "0.9rem",
                                        margin: "0 0 1.2rem 0",
                                        display: "-webkit-box",
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                        lineHeight: "1.4"
                                    }}>
                                        {contest.description || "No description provided."}
                                    </p>

                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text)", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ fontWeight: "500", opacity: 0.8 }}>Starts:</span>
                                            <span style={{ fontWeight: "600", color: "var(--text-h)" }}>{formatDate(contest.startTime)}</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ fontWeight: "500", opacity: 0.8 }}>Ends:</span>
                                            <span style={{ fontWeight: "600", color: "var(--text-h)" }}>{formatDate(contest.endTime)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "0.8rem", marginTop: "0.2rem" }}>
                                    <Link
                                        to={`/contests/${contest._id}`}
                                        style={{
                                            textDecoration: "none",
                                            color: "#fff",
                                            backgroundColor: "var(--accent)",
                                            padding: "0.5rem 1rem",
                                            borderRadius: "6px",
                                            fontWeight: "600",
                                            fontSize: "0.85rem",
                                            textAlign: "center",
                                            flex: isAdmin ? "0 1 auto" : "1",
                                            transition: "background-color 0.2s"
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = "var(--accent-hover)"}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = "var(--accent)"}
                                    >
                                        View Details
                                    </Link>

                                    {isAdmin && (
                                        <div style={{ display: "flex", gap: "0.5rem", marginLeft: "1rem" }}>
                                            <Link
                                                to={`/contests/edit/${contest._id}`}
                                                style={{
                                                    textDecoration: "none",
                                                    color: "var(--text)",
                                                    fontWeight: "600",
                                                    fontSize: "0.85rem",
                                                    border: "1px solid var(--border)",
                                                    padding: "0.4rem 0.8rem",
                                                    borderRadius: "6px",
                                                    transition: "background-color 0.2s"
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.backgroundColor = "var(--code-bg)";
                                                    e.target.style.color = "var(--text-h)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.backgroundColor = "transparent";
                                                    e.target.style.color = "var(--text)";
                                                }}
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(contest._id)}
                                                style={{
                                                    backgroundColor: "transparent",
                                                    border: "1px solid rgba(220, 53, 69, 0.2)",
                                                    color: "#dc3545",
                                                    fontWeight: "600",
                                                    fontSize: "0.85rem",
                                                    cursor: "pointer",
                                                    padding: "0.4rem 0.8rem",
                                                    borderRadius: "6px",
                                                    transition: "all 0.2s"
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.backgroundColor = "rgba(220, 53, 69, 0.05)";
                                                    e.target.style.borderColor = "#dc3545";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.backgroundColor = "transparent";
                                                    e.target.style.borderColor = "rgba(220, 53, 69, 0.2)";
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default ContestList;