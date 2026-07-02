import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { getProblems, deleteProblem } from "../../api/problemApi";
import AuthContext from "../../context/AuthContext";

function ProblemList() {
    const [problems, setProblems] = useState([]);
    const [loading, setloading] = useState(true);
    const [error, setError] = useState("");
    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchProblems();
    }, []);

    const fetchProblems = async () => {
        setError("");
        try {
            const response = await getProblems();
            setProblems(response.problems || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setloading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Delete this problem?");
        if (!confirmDelete) {
            return;
        }
        try {
            await deleteProblem(id);
            fetchProblems();
        } catch (error) {
            console.error(error);
        };
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
                <div style={{ color: "var(--text)", fontSize: "1rem", fontWeight: "500" }}>Loading problems...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", maxWidth: "500px", margin: "0 auto", padding: "2rem", textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
                <h3 style={{ marginBottom: "0.5rem", color: "var(--text-h)" }}>Failed to load problems</h3>
                <p style={{ color: "var(--text)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>{error}</p>
                <button
                    onClick={fetchProblems}
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

    const isAdmin = user?.role === "ADMIN";

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
                <h1 style={{ margin: 0, fontSize: "2rem" }}>Problems</h1>
                {isAdmin && (
                    <Link 
                        to={"/problems/create"}
                        style={{
                            textDecoration: "none",
                            color: "#fff",
                            backgroundColor: "#28a745",
                            padding: "0.5rem 1rem",
                            borderRadius: "6px",
                            fontWeight: "bold",
                            fontSize: "0.9rem"
                        }}
                    > 
                        + Create Problem 
                    </Link>
                )}
            </div>

            <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: "8px", boxShadow: "var(--shadow)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", backgroundColor: "var(--bg)" }}>
                    <thead>
                        <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--text)", fontWeight: "600" }}>
                            <th style={{ padding: "1rem" }}>Title</th>
                            <th style={{ padding: "1rem" }}>Difficulty</th>
                            <th style={{ padding: "1rem", textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {problems.map((problem) => (
                            <tr key={problem._id} style={{ borderBottom: "1px solid var(--border)" }}>
                                <td style={{ padding: "1rem", fontWeight: "600", color: "var(--text-h)" }}>
                                    {problem.title}
                                </td>
                                <td style={{ padding: "1rem" }}>
                                    <span style={{
                                        padding: "0.25rem 0.6rem",
                                        borderRadius: "4px",
                                        fontWeight: "bold",
                                        fontSize: "0.8rem",
                                        backgroundColor: problem.difficulty === "EASY" ? "#d4edda" : problem.difficulty === "MEDIUM" ? "#fff3cd" : "#f8d7da",
                                        color: problem.difficulty === "EASY" ? "#155724" : problem.difficulty === "MEDIUM" ? "#856404" : "#721c24",
                                        border: "1px solid transparent"
                                    }}>
                                        {problem.difficulty}
                                    </span>
                                </td>
                                <td style={{ padding: "1rem", textAlign: "right" }}>
                                    <div style={{ display: "flex", gap: "0.8rem", justifyContent: "flex-end", alignItems: "center" }}>
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
                                        {isAdmin && (
                                            <>
                                                <Link 
                                                    to={`/problems/edit/${problem._id}`}
                                                    style={{
                                                        textDecoration: "none",
                                                        color: "#6c757d",
                                                        fontWeight: "600",
                                                        fontSize: "0.9rem"
                                                    }}
                                                >
                                                    Edit
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(problem._id)}
                                                    style={{
                                                        backgroundColor: "transparent",
                                                        border: "none",
                                                        color: "#dc3545",
                                                        fontWeight: "600",
                                                        fontSize: "0.9rem",
                                                        cursor: "pointer",
                                                        padding: 0
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )

};

export default ProblemList;