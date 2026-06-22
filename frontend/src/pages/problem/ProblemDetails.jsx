import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProblemById } from "../../api/problemApi";

function ProblemDetails() {
    const { id } = useParams();
    const [problem, setProblem] = useState(null);

    useEffect(() => {
        loadProblem();
    }, []);

    const loadProblem = async () => {
        const res = await getProblemById(id);
        setProblem(res.problem);
    };

    if (!problem) {
        return <h2>Loading...</h2>
    }

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1.5rem" }}>
            <h1>{problem.title}</h1>
            <div style={{ 
                padding: "1rem", 
                backgroundColor: "#f9f9f9", 
                border: "1px solid #eee", 
                borderRadius: "8px", 
                margin: "1rem 0" 
            }}>
                <h3>Statement:</h3>
                <p style={{ whiteSpace: "pre-wrap" }}>{problem.statement}</p>
            </div>
            <p>
                <strong>Difficulty:</strong> {problem.difficulty}
            </p>
            <div style={{ marginTop: "2rem" }}>
                <Link 
                    to={`/submit/${id}`} 
                    style={{
                        textDecoration: "none",
                        color: "#fff",
                        backgroundColor: "#28a745",
                        padding: "0.6rem 1.2rem",
                        borderRadius: "4px",
                        fontWeight: "bold",
                        display: "inline-block"
                    }}
                >
                    Solve Problem
                </Link>
            </div>
        </div>
    )
}

export default ProblemDetails;