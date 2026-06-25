import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProblemById } from "../../api/problemApi";
import { createSubmission } from "../../api/submissionApi";
import { runCode } from "../../api/compilerApi";

function ProblemDetails() {
    const { id } = useParams();
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
        loadProblem();
        
        // Populate default template code depending on language
        if (!formData.code) {
            setFormData(prev => ({
                ...prev,
                code: prev.language === "python" 
                    ? "# Write your Python code here\nprint('Hello World')\n" 
                    : "#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}\n"
            }));
        }
    }, [id]);

    const loadProblem = async () => {
        try {
            const res = await getProblemById(id);
            setProblem(res.problem);
        } catch (err) {
            console.error("Failed to load problem details", err);
            setError("Problem not found");
        }
    };

    const handleLanguageChange = (lang) => {
        setFormData({
            language: lang,
            code: lang === "python" 
                ? "# Write your Python code here\nprint('Hello World')\n" 
                : "#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}\n"
        });
    };

    const handleKeyDown = (e) => {
        if (e.key === "Tab") {
            e.preventDefault();
            const { selectionStart, selectionEnd, value } = e.target;
            const newValue = value.substring(0, selectionStart) + "    " + value.substring(selectionEnd);
            setFormData({ ...formData, code: newValue });
            setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = selectionStart + 4;
            }, 0);
        }
    };

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
                    problemId: id,
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
                problemId: id,
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

    if (error) {
        return (
            <div style={{ padding: "2rem", textAlign: "center" }}>
                <h2>{error}</h2>
                <Link to="/problems" style={{ color: "#007bff", textDecoration: "none" }}>Back to problems</Link>
            </div>
        );
    }

    if (!problem) {
        return <div style={{ padding: "2rem", textAlign: "center" }}><h2>Loading problem workspace...</h2></div>;
    }

    return (
        <div className="workspace-container" style={{ display: "flex", flexDirection: "column", gap: "1rem", height: "calc(100vh - 85px)", padding: "0.5rem 1rem", boxSizing: "border-box" }}>
            {/* Workspace Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                <Link to="/problems" style={{ color: "var(--text)", textDecoration: "none", fontSize: "0.9rem" }}>
                    &larr; Back
                </Link>
                <h1 style={{ fontSize: "1.5rem", margin: 0 }}>{problem.title}</h1>
                <span style={{
                    padding: "0.2rem 0.5rem",
                    borderRadius: "4px",
                    fontWeight: "bold",
                    fontSize: "0.8rem",
                    backgroundColor: problem.difficulty === "EASY" ? "#d4edda" : problem.difficulty === "MEDIUM" ? "#fff3cd" : "#f8d7da",
                    color: problem.difficulty === "EASY" ? "#155724" : problem.difficulty === "MEDIUM" ? "#856404" : "#721c24",
                }}>
                    {problem.difficulty}
                </span>
                <span style={{ fontSize: "0.85rem", color: "var(--text)" }}>
                    Time Limit: {problem.timeLimitMillis} ms | Memory Limit: {problem.memoryLimitMBs} MB
                </span>
            </div>

            {/* Side-by-Side Flex Layout */}
            <div className="workspace-split" style={{ display: "flex", gap: "1rem", flex: 1, minHeight: 0 }}>
                {/* Left Pane: Problem Description */}
                <div className="workspace-left" style={{ flex: 1, minWidth: 0, backgroundColor: "var(--bg)", border: "1px solid var(--border)", borderRadius: "8px", padding: "1.25rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.5rem", textAlign: "left", boxShadow: "var(--shadow)" }}>
                    <div>
                        <h3 style={{ fontSize: "1.1rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem", marginBottom: "0.75rem" }}>Problem Description</h3>
                        <p style={{ whiteSpace: "pre-wrap", color: "var(--text-h)", fontSize: "0.95rem", lineHeight: "1.6" }}>{problem.statement}</p>
                    </div>

                    {problem.inputFormat && (
                        <div>
                            <h3 style={{ fontSize: "1.1rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem", marginBottom: "0.75rem" }}>Input Format</h3>
                            <p style={{ whiteSpace: "pre-wrap", color: "var(--text-h)", fontSize: "0.95rem", lineHeight: "1.6" }}>{problem.inputFormat}</p>
                        </div>
                    )}

                    {problem.outputFormat && (
                        <div>
                            <h3 style={{ fontSize: "1.1rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem", marginBottom: "0.75rem" }}>Output Format</h3>
                            <p style={{ whiteSpace: "pre-wrap", color: "var(--text-h)", fontSize: "0.95rem", lineHeight: "1.6" }}>{problem.outputFormat}</p>
                        </div>
                    )}

                    {/* Examples Section */}
                    {problem.testCases && problem.testCases.filter(tc => !tc.isHidden).length > 0 && (
                        <div>
                            <h3 style={{ fontSize: "1.1rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem", marginBottom: "0.75rem" }}>Sample Examples</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {problem.testCases.filter(tc => !tc.isHidden).map((tc, idx) => (
                                    <div key={idx} style={{ padding: "1rem", backgroundColor: "var(--code-bg)", borderRadius: "6px", border: "1px solid var(--border)" }}>
                                        <div style={{ fontWeight: "600", marginBottom: "0.5rem", color: "var(--text-h)", fontSize: "0.9rem" }}>Example {idx + 1}</div>
                                        <div style={{ marginBottom: "0.5rem" }}>
                                            <span style={{ fontWeight: "500", fontSize: "0.85rem", display: "block", color: "var(--text)" }}>Input:</span>
                                            <pre style={{ margin: "0.2rem 0", padding: "0.5rem", backgroundColor: "var(--bg)", border: "1px solid var(--border)", borderRadius: "4px", fontFamily: "var(--mono)", fontSize: "0.85rem", overflowX: "auto", color: "var(--text-h)" }}>{tc.input}</pre>
                                        </div>
                                        <div style={{ marginBottom: "0.5rem" }}>
                                            <span style={{ fontWeight: "500", fontSize: "0.85rem", display: "block", color: "var(--text)" }}>Expected Output:</span>
                                            <pre style={{ margin: "0.2rem 0", padding: "0.5rem", backgroundColor: "var(--bg)", border: "1px solid var(--border)", borderRadius: "4px", fontFamily: "var(--mono)", fontSize: "0.85rem", overflowX: "auto", color: "var(--text-h)" }}>{tc.expectedOutput}</pre>
                                        </div>
                                        {tc.explanation && (
                                            <div>
                                                <span style={{ fontWeight: "500", fontSize: "0.85rem", display: "block", color: "var(--text)" }}>Explanation:</span>
                                                <p style={{ margin: "0.2rem 0", fontSize: "0.9rem", color: "var(--text)", fontStyle: "italic" }}>{tc.explanation}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Pane: Code Editor and Compiler Runner */}
                <div className="workspace-right" style={{ flex: 1, minWidth: 0, backgroundColor: "var(--bg)", border: "1px solid var(--border)", borderRadius: "8px", padding: "1.25rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem", boxShadow: "var(--shadow)" }}>
                    {/* Language selector & Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem" }}>
                        <span style={{ fontWeight: "600", color: "var(--text-h)" }}>Code Editor</span>
                        <div>
                            <select
                                value={formData.language}
                                onChange={(e) => handleLanguageChange(e.target.value)}
                                style={{ padding: "0.4rem 0.8rem", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontWeight: "500" }}
                            >
                                <option value="python">Python</option>
                                <option value="cpp">C++</option>
                            </select>
                        </div>
                    </div>

                    {/* Source Code text editor */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "250px" }}>
                        <textarea
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            onKeyDown={handleKeyDown}
                            placeholder="Write your solution code here..."
                            spellCheck={false}
                            style={{
                                width: "100%",
                                flex: 1,
                                padding: "0.75rem",
                                fontFamily: "var(--mono)",
                                fontSize: "0.95rem",
                                lineHeight: "1.5",
                                borderRadius: "6px",
                                border: "1px solid var(--border)",
                                backgroundColor: "var(--bg-app)",
                                color: "var(--text-h)",
                                resize: "none",
                                boxSizing: "border-box"
                            }}
                        />
                    </div>

                    {/* Custom Input box */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", textAlign: "left" }}>
                        <label style={{ fontWeight: "600", fontSize: "0.9rem", color: "var(--text)" }}>Custom Test Input (Optional):</label>
                        <textarea
                            rows={3}
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            placeholder="Enter test inputs here, one per line..."
                            style={{
                                width: "100%",
                                padding: "0.5rem 0.75rem",
                                fontFamily: "var(--mono)",
                                fontSize: "0.9rem",
                                borderRadius: "6px",
                                border: "1px solid var(--border)",
                                backgroundColor: "var(--bg-app)",
                                color: "var(--text-h)",
                                resize: "vertical",
                                boxSizing: "border-box"
                            }}
                        />
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <button
                            type="button"
                            onClick={handleRunCode}
                            disabled={running}
                            style={{
                                flex: 1,
                                padding: "0.6rem 1.2rem",
                                borderRadius: "6px",
                                border: "1px solid var(--accent)",
                                backgroundColor: running ? "var(--accent-bg)" : "var(--accent)",
                                color: running ? "var(--accent)" : "#fff",
                                fontWeight: "bold",
                                cursor: running ? "not-allowed" : "pointer",
                                transition: "all 0.2s"
                            }}
                        >
                            {running ? "Running..." : "Run/Test Code"}
                        </button>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            style={{
                                flex: 1,
                                padding: "0.6rem 1.2rem",
                                borderRadius: "6px",
                                border: "1px solid #28a745",
                                backgroundColor: "#28a745",
                                color: "#fff",
                                fontWeight: "bold",
                                cursor: "pointer",
                                transition: "all 0.2s"
                            }}
                        >
                            Submit Solution
                        </button>
                    </div>

                    {/* Output Terminal logs panel */}
                    {(runOutput || error || running) && (
                        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem", textAlign: "left" }}>
                            <span style={{ fontWeight: "600", fontSize: "0.9rem", color: "var(--text)" }}>Execution Output:</span>
                            <pre style={{
                                marginTop: "0.5rem",
                                padding: "1rem",
                                backgroundColor: "#0f172a",
                                color: error ? "#f87171" : "#e2e8f0",
                                borderRadius: "6px",
                                overflowX: "auto",
                                whiteSpace: "pre-wrap",
                                fontFamily: "var(--mono)",
                                fontSize: "0.9rem",
                                margin: "0.5rem 0 0 0",
                                border: "1px solid #1e293b"
                            }}>
                                {running ? "Executing code on compiler..." : error || runOutput}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProblemDetails;