import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { getSubmissionById, generateAiAnalysis, getAiLimit } from "../../api/submissionApi";
import AuthContext from "../../context/AuthContext";
import settings from "../../config/settings";

function SubmissionDetails() {
    const { id } = useParams();
    const { user, loading: authLoading } = useContext(AuthContext);
    const [submission, setSubmission] = useState(null);
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [error, setError] = useState("");
    const [polling, setPolling] = useState(false);

    // Gemini states (strictly ephemeral, in-memory page state)
    const [geminiAnalysis, setGeminiAnalysis] = useState(null);
    const [limit, setLimit] = useState({ remaining: 2, limit: 2 });
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiError, setAiError] = useState("");

    // Collapsible states
    const [expanded, setExpanded] = useState({
        strengths: true,
        improvements: true,
        potentialIssues: true,
        interviewTip: true
    });

    const toggleSection = (section) => {
        setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
    };

    useEffect(() => {
        fetchSubmission();
    }, [id, user]);

    useEffect(() => {
        if (!submission || submission.verdict !== "PENDING") return;

        setPolling(true);
        const intervalId = setInterval(async () => {
            try {
                const response = await getSubmissionById(id);
                setSubmission(response.submission);
                setAiAnalysis(response.aiAnalysis || null);
                if (response.aiAnalysis) {
                    setGeminiAnalysis(response.aiAnalysis);
                }
                if (response.submission?.verdict !== "PENDING") {
                    setPolling(false);
                    clearInterval(intervalId);
                    
                    if (user) {
                        fetchGeminiDetails();
                    }
                }
            } catch {
                // keep polling
            }
        }, 800);

        return () => clearInterval(intervalId);
    }, [submission?.verdict, id, user]);

    const fetchGeminiDetails = async () => {
        try {
            const limitRes = await getAiLimit(id);
            setLimit({ remaining: limitRes.remaining, limit: limitRes.limit });
        } catch (err) {
            console.error("Failed to load Gemini limits", err);
        }
    };

    const fetchSubmission = async () => {
        try {
            const response = await getSubmissionById(id);
            setSubmission(response.submission);
            setAiAnalysis(response.aiAnalysis || null);
            if (response.aiAnalysis) {
                setGeminiAnalysis(response.aiAnalysis);
            }
            if (user) {
                fetchGeminiDetails();
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to load submission");
        }
    };

    const handleGenerateAnalysis = async () => {
        setIsGenerating(true);
        setAiError("");
        try {
            const response = await generateAiAnalysis(id);
            setGeminiAnalysis(response.analysis);
            const limitRes = await getAiLimit(id);
            setLimit({ remaining: limitRes.remaining, limit: limitRes.limit });
        } catch (err) {
            setAiError(err.response?.data?.message || err.message || "Failed to generate AI analysis");
        } finally {
            setIsGenerating(false);
        }
    };

    const getVerdictStyle = (verdict) => {
        if (verdict === "ACCEPTED") return { color: "#155724", backgroundColor: "#d4edda" };
        if (verdict === "PENDING") return { color: "#856404", backgroundColor: "#fff3cd" };
        return { color: "#721c24", backgroundColor: "#f8d7da" };
    };

    const getScoreColor = (score) => {
        if (score >= 80) return "#22c55e"; // Green
        if (score >= 50) return "#eab308"; // Yellow
        return "#ef4444"; // Red
    };

    const getSectionHeaderStyle = () => ({
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.75rem 1rem",
        backgroundColor: "var(--bg-app)",
        borderBottom: "1px solid var(--border)",
        cursor: "pointer",
        userSelect: "none"
    });

    if (error) {
        return (
            <div style={{ padding: "2rem" }}>
                <h2>{error}</h2>
                <button onClick={fetchSubmission} style={{ marginRight: "1rem", padding: "0.5rem 1rem", cursor: "pointer" }}>Retry</button>
                <Link to="/submissions">Back to submissions</Link>
            </div>
        );
    }

    if (!submission) {
        return <h2 style={{ padding: "2rem" }}>Loading submission...</h2>;
    }

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1.5rem" }}>
            <Link to="/submissions" style={{ color: "#007bff", textDecoration: "none" }}>&larr; Back to submissions</Link>
            <h1 style={{ marginTop: "1rem" }}>Submission Details</h1>

            {polling && (
                <div style={{ padding: "0.75rem 1rem", backgroundColor: "#fff3cd", borderRadius: "6px", marginBottom: "1rem", color: "#856404" }}>
                    Evaluating your submission{polling ? "..." : ""}
                </div>
            )}

            <div style={{ display: "grid", gap: "1rem", marginBottom: "2rem" }}>
                <p><strong>Problem:</strong> {submission.problemId?.title || "Unknown"}</p>
                <p><strong>Language:</strong> {submission.language?.toUpperCase()}</p>
                <p>
                    <strong>Verdict:</strong>{" "}
                    <span style={{ ...getVerdictStyle(submission.verdict), padding: "0.2rem 0.6rem", borderRadius: "4px", fontWeight: "bold" }}>
                        {submission.verdict}
                    </span>
                </p>
                <p><strong>Submitted By:</strong> {submission.userId?.firstName} {submission.userId?.lastName}</p>
                <p><strong>Execution Time:</strong> {submission.executionTime ?? "—"} ms</p>
                <p><strong>Memory Used:</strong> {submission.memoryUsed ? `${Math.round(submission.memoryUsed / 1024)} KB` : "—"}</p>
                <p><strong>Submitted At:</strong> {new Date(submission.submittedAt).toLocaleString()}</p>
            </div>

            {submission.testCaseResults && submission.testCaseResults.length > 0 && (
                <div style={{ marginBottom: "2rem" }}>
                    <h3>Test Case Results</h3>
                    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.5rem" }}>
                        <thead>
                            <tr style={{ borderBottom: "2px solid var(--border)" }}>
                                <th style={{ padding: "0.5rem", textAlign: "left" }}>#</th>
                                <th style={{ padding: "0.5rem", textAlign: "left" }}>Status</th>
                                <th style={{ padding: "0.5rem", textAlign: "left" }}>Time (ms)</th>
                                <th style={{ padding: "0.5rem", textAlign: "left" }}>Error</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submission.testCaseResults.map((tc, idx) => (
                                <tr key={idx} style={{ borderBottom: "1px solid var(--border)" }}>
                                    <td style={{ padding: "0.5rem" }}>{idx + 1}</td>
                                    <td style={{ padding: "0.5rem" }}>{tc.status}</td>
                                    <td style={{ padding: "0.5rem" }}>{tc.executionTime ?? "—"}</td>
                                    <td style={{ padding: "0.5rem", fontSize: "0.85rem", color: "#721c24" }}>{tc.error || "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <h3>Submitted Code</h3>
            <pre style={{
                padding: "1rem",
                backgroundColor: "#0f172a",
                color: "#e2e8f0",
                borderRadius: "6px",
                overflowX: "auto",
                fontSize: "0.9rem"
            }}>
                {submission.code || "Code not available"}
            </pre>

            {/* Gemini AI analysis card */}
            {user && submission.verdict !== "PENDING" && (
                <div style={{
                    marginTop: "2.5rem",
                    padding: "1.5rem",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    backgroundColor: "var(--bg)",
                    boxShadow: "var(--shadow-md)"
                }}>
                    <div style={{ display: "flex", justifycontent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
                        <div>
                            <h2 style={{ fontSize: "1.5rem" }}>✨ AI Code Review</h2>
                            <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem", color: "var(--text)" }}>
                                AI Analysis Remaining Today: <strong>{limit.remaining}/{limit.limit}</strong>
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            {limit.remaining === 0 && (
                                <span style={{ color: "#ef4444", fontSize: "0.875rem", fontWeight: "bold" }}>
                                    Daily AI Analysis limit reached.
                                </span>
                            )}
                            <button
                                onClick={handleGenerateAnalysis}
                                disabled={isGenerating || limit.remaining === 0}
                                style={{
                                    padding: "0.6rem 1.2rem",
                                    backgroundColor: isGenerating || limit.remaining === 0 ? "var(--border)" : "var(--accent)",
                                    color: isGenerating || limit.remaining === 0 ? "var(--text)" : "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontWeight: "600",
                                    cursor: isGenerating || limit.remaining === 0 ? "not-allowed" : "pointer",
                                    transition: "background-color 0.2s"
                                }}
                            >
                                {isGenerating ? "Generating AI Analysis..." : "Generate AI Analysis"}
                            </button>
                        </div>
                    </div>

                    {aiError && (
                        <div style={{ padding: "0.75rem 1rem", backgroundColor: "#f8d7da", color: "#721c24", borderRadius: "6px", marginBottom: "1rem" }}>
                            {aiError}
                        </div>
                    )}

                    {geminiAnalysis ? (
                        <div style={{ display: "grid", gap: "1.25rem" }}>
                            {/* Score Card */}
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1.5rem",
                                padding: "1.25rem",
                                borderRadius: "8px",
                                border: "1px solid var(--border)",
                                backgroundColor: "var(--bg-app)"
                            }}>
                                <div style={{
                                    width: "64px",
                                    height: "64px",
                                    borderRadius: "50%",
                                    border: `4px solid ${getScoreColor(geminiAnalysis.overallScore)}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "1.5rem",
                                    fontWeight: "bold",
                                    color: getScoreColor(geminiAnalysis.overallScore)
                                }}>
                                    {geminiAnalysis.overallScore}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <h3 style={{ margin: 0 }}>Overall Review</h3>
                                        {geminiAnalysis.optimal && (
                                            <span style={{
                                                border: "1px solid #22c55e",
                                                color: "#22c55e",
                                                backgroundColor: "rgba(34, 197, 94, 0.1)",
                                                padding: "0.15rem 0.5rem",
                                                borderRadius: "4px",
                                                marginLeft: "0.75rem",
                                                fontSize: "0.75rem",
                                                fontWeight: "bold",
                                                textTransform: "uppercase"
                                            }}>
                                                Optimal
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ margin: "0.25rem 0 0", fontSize: "0.95rem", color: "var(--text)" }}>{geminiAnalysis.summary}</p>
                                </div>
                            </div>

                            {/* Complexity Badges */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div style={{ padding: "1rem", border: "1px solid var(--border)", borderRadius: "8px" }}>
                                    <h4 style={{ fontSize: "0.875rem", color: "var(--text)", textTransform: "uppercase" }}>Time Complexity</h4>
                                    <code style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--accent)" }}>{geminiAnalysis.complexity?.time}</code>
                                </div>
                                <div style={{ padding: "1rem", border: "1px solid var(--border)", borderRadius: "8px" }}>
                                    <h4 style={{ fontSize: "0.875rem", color: "var(--text)", textTransform: "uppercase" }}>Space Complexity</h4>
                                    <code style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--accent)" }}>{geminiAnalysis.complexity?.space}</code>
                                </div>
                            </div>

                            {/* Section: Strengths */}
                            {geminiAnalysis.strengths?.length > 0 && (
                                <div style={{ border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden" }}>
                                    <div onClick={() => toggleSection("strengths")} style={getSectionHeaderStyle()}>
                                        <h3>👍 Key Strengths</h3>
                                        <span>{expanded.strengths ? "▲" : "▼"}</span>
                                    </div>
                                    {expanded.strengths && (
                                        <div style={{ padding: "1rem", borderTop: "1px solid var(--border)", backgroundColor: "var(--bg)" }}>
                                            <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "var(--text)" }}>
                                                {geminiAnalysis.strengths.map((s, idx) => <li key={idx} style={{ marginBottom: "0.25rem" }}>{s}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Section: Improvements */}
                            {geminiAnalysis.improvements?.length > 0 && (
                                <div style={{ border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden" }}>
                                    <div onClick={() => toggleSection("improvements")} style={getSectionHeaderStyle()}>
                                        <h3>🚀 Recommended Improvements</h3>
                                        <span>{expanded.improvements ? "▲" : "▼"}</span>
                                    </div>
                                    {expanded.improvements && (
                                        <div style={{ padding: "1rem", borderTop: "1px solid var(--border)", backgroundColor: "var(--bg)" }}>
                                            <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "var(--text)" }}>
                                                {geminiAnalysis.improvements.map((s, idx) => <li key={idx} style={{ marginBottom: "0.25rem" }}>{s}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Section: Potential Issues */}
                            {geminiAnalysis.potentialIssues?.length > 0 && (
                                <div style={{ border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden" }}>
                                    <div onClick={() => toggleSection("potentialIssues")} style={getSectionHeaderStyle()}>
                                        <h3>🔍 Potential Issues</h3>
                                        <span>{expanded.potentialIssues ? "▲" : "▼"}</span>
                                    </div>
                                    {expanded.potentialIssues && (
                                        <div style={{ padding: "1rem", borderTop: "1px solid var(--border)", backgroundColor: "var(--bg)" }}>
                                            <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "var(--text)" }}>
                                                {geminiAnalysis.potentialIssues.map((b, idx) => <li key={idx} style={{ marginBottom: "0.25rem" }}>{b}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Section: Interview Tip */}
                            {geminiAnalysis.interviewTip && (
                                <div style={{ border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden" }}>
                                    <div onClick={() => toggleSection("interviewTip")} style={getSectionHeaderStyle()}>
                                        <h3>🎤 Interview Tip</h3>
                                        <span>{expanded.interviewTip ? "▲" : "▼"}</span>
                                    </div>
                                    {expanded.interviewTip && (
                                        <div style={{ padding: "1rem", borderTop: "1px solid var(--border)", backgroundColor: "var(--bg)" }}>
                                            <p style={{ margin: 0, whiteSpace: "pre-line", color: "var(--text)" }}>{geminiAnalysis.interviewTip}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ padding: "2rem", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "8px", backgroundColor: "var(--bg-app)" }}>
                            <p style={{ margin: 0, color: "var(--text)" }}>
                                Get a quick AI review of your solution. Get complexity metrics, strengths, improvements, potential issues, and interview tips in under 30 seconds.
                            </p>
                        </div>
                    )}
                </div>
            )}

            <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
                <Link to="/leaderboard" style={{ color: "#007bff", fontWeight: "600" }}>View Leaderboard</Link>
                <Link to={`/problems/${submission.problemId?._id || submission.problemId}`} style={{ color: "#007bff", fontWeight: "600" }}>Back to Problem</Link>
            </div>
        </div>
    );
}

export default SubmissionDetails;
