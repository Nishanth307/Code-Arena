import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getSubmissionById } from "../../api/submissionApi";

function SubmissionDetails() {
    const { id } = useParams();
    const [submission, setSubmission] = useState(null);
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [error, setError] = useState("");
    const [polling, setPolling] = useState(false);

    useEffect(() => {
        fetchSubmission();
    }, [id]);

    useEffect(() => {
        if (!submission || submission.verdict !== "PENDING") return;

        setPolling(true);
        const intervalId = setInterval(async () => {
            try {
                const response = await getSubmissionById(id);
                setSubmission(response.submission);
                setAiAnalysis(response.aiAnalysis || null);
                if (response.submission?.verdict !== "PENDING") {
                    setPolling(false);
                    clearInterval(intervalId);
                }
            } catch {
                // keep polling
            }
        }, 800);

        return () => clearInterval(intervalId);
    }, [submission?.verdict, id]);

    const fetchSubmission = async () => {
        try {
            const response = await getSubmissionById(id);
            setSubmission(response.submission);
            setAiAnalysis(response.aiAnalysis || null);
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to load submission");
        }
    };

    const getVerdictStyle = (verdict) => {
        if (verdict === "ACCEPTED") return { color: "#155724", backgroundColor: "#d4edda" };
        if (verdict === "PENDING") return { color: "#856404", backgroundColor: "#fff3cd" };
        return { color: "#721c24", backgroundColor: "#f8d7da" };
    };

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

            {aiAnalysis && submission.verdict !== "PENDING" && (
                <div style={{ marginTop: "2rem", padding: "1.5rem", border: "1px solid var(--border)", borderRadius: "8px" }}>
                    <h3>AI Code Analysis</h3>
                    <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
                        <p><strong>Time Complexity:</strong> {aiAnalysis.complexity?.time}</p>
                        <p><strong>Space Complexity:</strong> {aiAnalysis.complexity?.space}</p>
                        <p><strong>Code Quality:</strong> {aiAnalysis.codeQuality}</p>
                        <p><strong>Coding Style:</strong> {aiAnalysis.codingStyle}</p>

                        {aiAnalysis.issues?.length > 0 && (
                            <div>
                                <strong>Issues:</strong>
                                <ul>{aiAnalysis.issues.map((item, i) => <li key={i}>{item}</li>)}</ul>
                            </div>
                        )}
                        {aiAnalysis.suggestions?.length > 0 && (
                            <div>
                                <strong>Suggestions:</strong>
                                <ul>{aiAnalysis.suggestions.map((item, i) => <li key={i}>{item}</li>)}</ul>
                            </div>
                        )}
                        {aiAnalysis.potentialBugs?.length > 0 && (
                            <div>
                                <strong>Potential Bugs:</strong>
                                <ul>{aiAnalysis.potentialBugs.map((item, i) => <li key={i}>{item}</li>)}</ul>
                            </div>
                        )}
                        {aiAnalysis.edgeCasesMissed?.length > 0 && (
                            <div>
                                <strong>Edge Cases:</strong>
                                <ul>{aiAnalysis.edgeCasesMissed.map((item, i) => <li key={i}>{item}</li>)}</ul>
                            </div>
                        )}
                    </div>
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
