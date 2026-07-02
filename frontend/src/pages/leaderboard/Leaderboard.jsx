import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { getLeaderboard } from "../../api/leaderboardApi";

function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const loadLeaderboard = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await getLeaderboard();
            setLeaderboard(res.leaderboard || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
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
                <div style={{ color: "var(--text)", fontSize: "1rem", fontWeight: "500" }}>Loading leaderboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", maxWidth: "500px", margin: "0 auto", padding: "2rem", textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
                <h3 style={{ marginBottom: "0.5rem", color: "var(--text-h)" }}>Failed to load leaderboard</h3>
                <p style={{ color: "var(--text)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>{error}</p>
                <button
                    onClick={loadLeaderboard}
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
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "1.5rem" }}>
            <h1 style={{ marginBottom: "0.5rem" }}>Global Leaderboard</h1>
            <p style={{ color: "var(--text)", marginBottom: "1.5rem" }}>
                Rankings based on problems solved, difficulty score, success rate, and execution performance.
            </p>

            {leaderboard.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", border: "1px dashed var(--border)", borderRadius: "8px" }}>
                    <p style={{ color: "var(--text)", marginBottom: "1rem" }}>No rankings yet. Be the first to solve a problem!</p>
                    <Link to="/problems" style={{ color: "#fff", backgroundColor: "#007bff", padding: "0.5rem 1rem", borderRadius: "6px", textDecoration: "none", fontWeight: "600" }}>
                        Browse Problems
                    </Link>
                </div>
            ) : (
                <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: "8px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "var(--bg)" }}>
                        <thead>
                            <tr style={{ borderBottom: "2px solid var(--border)" }}>
                                <th style={{ padding: "1rem" }}>Rank</th>
                                <th style={{ padding: "1rem" }}>User</th>
                                <th style={{ padding: "1rem" }}>Score</th>
                                <th style={{ padding: "1rem" }}>Solved</th>
                                <th style={{ padding: "1rem" }}>Success Rate</th>
                                <th style={{ padding: "1rem" }}>Avg Time</th>
                                <th style={{ padding: "1rem" }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((entry) => (
                                <tr key={entry.userId} style={{ borderBottom: "1px solid var(--border)" }}>
                                    <td style={{ padding: "1rem", fontWeight: "bold" }}>
                                        {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`}
                                    </td>
                                    <td style={{ padding: "1rem", fontWeight: "600" }}>
                                        {entry.firstName} {entry.lastName}
                                    </td>
                                    <td style={{ padding: "1rem", color: "#007bff", fontWeight: "bold" }}>{entry.totalScore}</td>
                                    <td style={{ padding: "1rem" }}>{entry.problemsSolved}</td>
                                    <td style={{ padding: "1rem" }}>{entry.successRate}%</td>
                                    <td style={{ padding: "1rem" }}>{entry.avgExecutionTime} ms</td>
                                    <td style={{ padding: "1rem" }}>
                                        <Link to={`/leaderboard/user/${entry.userId}`} style={{ color: "#007bff" }}>Stats</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div style={{ marginTop: "1.5rem", padding: "1rem", backgroundColor: "var(--code-bg)", borderRadius: "8px", fontSize: "0.9rem" }}>
                <strong>Scoring:</strong> Easy = 10 pts | Medium = 30 pts | Hard = 50 pts | Performance bonus up to +2 pts per fast solve
            </div>
        </div>
    );
}

export default Leaderboard;
