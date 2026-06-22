import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { createSubmission } from "../../api/submissionApi";
import { runCode } from "../../api/compilerApi";
import { getProblemById } from "../../api/problemApi";

function SubmitSolution() {
    const { id: problemId } = useParams();
    const navigate = useNavigate();
    const [problem, setProblem] = useState(null);
    const [formData, setFormData] = useState({
        language: "python",
        code: ""
    });
    const [customInput, setCustomInput] = useState("");
    const [runOutput, setRunOutput] = useState("");
    const [running, setRunning] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadProblem = async () => {
            try {
                const res = await getProblemById(problemId);
                setProblem(res.problem);
            } catch (err) {
                console.error("Failed to load problem details", err);
            }
        };
        loadProblem();
    }, [problemId]);

    const handleRunCode = async () => {
        if (!formData.code.trim()) {
            setRunOutput("Please write some code first.");
            return;
        }
        setRunning(true);
        setRunOutput("");
        setError("");
        try {
            const response = await runCode(formData.language, formData.code, customInput);
            if (response.success) {
                setRunOutput(response.output || "Code executed successfully with no output.");
            } else {
                setError(response.message || "Execution failed.");
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || "An error occurred during execution.");
        } finally {
            setRunning(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const isLoggedIn = !!localStorage.getItem("token");

        if (!isLoggedIn) {
            // Save state to localStorage for post-login submission
            localStorage.setItem(
                "pending_submission",
                JSON.stringify({
                    problemId,
                    language: formData.language,
                    code: formData.code
                })
            );
            // Redirect to login with message
            navigate("/login", { 
                state: { message: "Please log in to submit your solution. Your code has been saved." } 
            });
            return;
        }

        try {
            const response = await createSubmission({
                problemId,
                language: formData.language,
                code: formData.code
            });
            const sub = response.submission || response.data?.submission || response.data;
            const submissionId = sub?._id || response.submissionId;
            
            if (submissionId) {
                // Save ID for dashboard tracking
                localStorage.setItem("last_submission_id", submissionId);
            }
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to create submission.");
        }
    };

    if (!problem) {
        return <div style={{ padding: "2rem" }}><h2>Loading problem workspace...</h2></div>;
    }

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1.5rem" }}>
            <div style={{ marginBottom: "1rem" }}>
                <Link to={`/problems/${problemId}`} style={{ color: "#007bff", textDecoration: "none" }}>
                    &larr; Back to Problem Description
                </Link>
            </div>

            <h2>Solve: {problem.title}</h2>
            
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                    <label style={{ fontWeight: "bold", marginRight: "1rem" }}>Select Language:</label>
                    <select 
                        value={formData.language} 
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        style={{ padding: "0.4rem 0.8rem", borderRadius: "4px", border: "1px solid #ccc" }}
                    >
                        <option value="python">Python</option>
                        <option value="cpp">C++</option>
                    </select>
                    <span style={{ marginLeft: "1rem", fontSize: "0.85rem", color: "#666" }}>
                        (Note: Online compiler testing supports Python and C++)
                    </span>
                </div>

                <div>
                    <label style={{ fontWeight: "bold", display: "block", marginBottom: "0.5rem" }}>Source Code:</label>
                    <textarea
                        rows={16}
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        placeholder="Write your code here..."
                        style={{
                            width: "100%",
                            padding: "0.8rem",
                            fontFamily: "Courier, monospace",
                            fontSize: "1rem",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            boxSizing: "border-box"
                        }}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <label style={{ fontWeight: "bold" }}>Custom Test Input (Optional):</label>
                    <textarea
                        rows={3}
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Provide test input here..."
                        style={{
                            width: "100%",
                            padding: "0.5rem",
                            fontFamily: "Courier, monospace",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                            boxSizing: "border-box"
                        }}
                    />
                </div>

                {error && (
                    <div style={{ padding: "0.8rem", backgroundColor: "#f8d7da", color: "#721c24", borderRadius: "4px" }}>
                        {error}
                    </div>
                )}

                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                    <button
                        type="button"
                        onClick={handleRunCode}
                        disabled={running}
                        style={{
                            padding: "0.6rem 1.2rem",
                            borderRadius: "4px",
                            border: "1px solid #007bff",
                            backgroundColor: running ? "#e2e6ea" : "#007bff",
                            color: running ? "#666" : "#fff",
                            fontWeight: "bold",
                            cursor: running ? "not-allowed" : "pointer"
                        }}
                    >
                        {running ? "Running..." : "Run/Test Code"}
                    </button>

                    <button
                        type="submit"
                        style={{
                            padding: "0.6rem 1.2rem",
                            borderRadius: "4px",
                            border: "1px solid #28a745",
                            backgroundColor: "#28a745",
                            color: "#fff",
                            fontWeight: "bold",
                            cursor: "pointer"
                        }}
                    >
                        Submit Solution
                    </button>
                </div>
            </form>

            {(runOutput || running) && (
                <div style={{ marginTop: "2rem", borderTop: "1px solid #ddd", paddingTop: "1.5rem" }}>
                    <h3>Execution Output:</h3>
                    <pre style={{
                        padding: "1rem",
                        backgroundColor: "#1e1e1e",
                        color: "#d4d4d4",
                        borderRadius: "6px",
                        overflowX: "auto",
                        whiteSpace: "pre-wrap",
                        fontFamily: "Courier, monospace"
                    }}>
                        {running ? "Executing code..." : runOutput}
                    </pre>
                </div>
            )}
        </div>
    );
}

export default SubmitSolution;