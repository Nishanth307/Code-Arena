import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getUserRanking } from "../../api/leaderboardApi";

function UserStats() {
    const { id } = useParams();
    const [entry, setEntry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadStats();
    }, [id]);

    const loadStats = async () => {
        try {
            const res = await getUserRanking(id);
            setEntry(res.entry);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load user stats");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: "2rem" }}><h2>Loading stats...</h2></div>;
    if (error) return <div style={{ padding: "2rem" }}><h2>{error}</h2></div>;
    if (!entry) return <div style={{ padding: "2rem" }}><h2>User not found</h2></div>;

    return (
        <div style={{ maxWidth: "700px", margin: "0 auto", padding: "1.5rem" }}>
            <Link to="/leaderboard" style={{ color: "#007bff", textDecoration: "none" }}>&larr; Back to leaderboard</Link>

            <h1 style={{ marginTop: "1rem" }}>
                {entry.firstName} {entry.lastName}
            </h1>
            {entry.rank && <p style={{ fontSize: "1.2rem", color: "#007bff", fontWeight: "bold" }}>Rank #{entry.rank}</p>}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginTop: "1.5rem" }}>
                <StatCard label="Total Score" value={entry.totalScore} />
                <StatCard label="Problems Solved" value={entry.problemsSolved} />
                <StatCard label="Accepted" value={entry.acceptedSubmissions} />
                <StatCard label="Total Submissions" value={entry.totalSubmissions} />
                <StatCard label="Success Rate" value={`${entry.successRate}%`} />
                <StatCard label="Avg Execution" value={`${entry.avgExecutionTime} ms`} />
            </div>

            {entry.breakdown && (
                <div style={{ marginTop: "2rem", padding: "1.5rem", border: "1px solid var(--border)", borderRadius: "8px" }}>
                    <h3>Difficulty Breakdown</h3>
                    <div style={{ display: "flex", gap: "2rem", marginTop: "1rem" }}>
                        <span>Easy: <strong>{entry.breakdown.easy}</strong></span>
                        <span>Medium: <strong>{entry.breakdown.medium}</strong></span>
                        <span>Hard: <strong>{entry.breakdown.hard}</strong></span>
                    </div>
                    {entry.performanceBonus > 0 && (
                        <p style={{ marginTop: "1rem", color: "#28a745" }}>
                            Performance bonus: +{entry.performanceBonus} pts
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value }) {
    return (
        <div style={{ padding: "1.25rem", border: "1px solid var(--border)", borderRadius: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "0.85rem", color: "var(--text)" }}>{label}</div>
            <div style={{ fontSize: "1.8rem", fontWeight: "bold", marginTop: "0.25rem" }}>{value}</div>
        </div>
    );
}

export default UserStats;
