import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { getProblems, deleteProblem } from "../../api/problemApi";
import AuthContext from "../../context/AuthContext";

function ProblemList() {
    const [problems, setProblems] = useState([]);
    const [loading, setloading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchProblems();
    }, []);

    const fetchProblems = async () => {
        try {
            const response = await getProblems();
            setProblems(response.problems || []);
        } catch (error) {
            console.error(error);
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
        return <div style={{ padding: "2rem", textAlign: "center" }}><h2>Loading problems...</h2></div>;
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