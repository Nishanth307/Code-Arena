import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSubmissions } from "../../api/submissionApi";

function SubmissionList() {
    const [submissions, setSubmissions] = useState([]);

    useEffect(() => {
        loadSubmissions();
    }, []);

    const loadSubmissions = async () => {
        try {
            const res = await getSubmissions();
            setSubmissions(res.submissions || res.data || []);
        } catch (err) {
            console.error("Error loading submissions:", err);
        }
    };

    // Helper for rendering verdict styles
    const getVerdictStyle = (verdict) => {
        switch (verdict) {
            case "ACCEPTED":
                return { backgroundColor: "#d4edda", color: "#155724", border: "1px solid #c3e6cb", padding: "0.2rem 0.6rem", borderRadius: "4px", fontSize: "0.85rem", fontWeight: "bold" };
            case "COMPILATION_ERROR":
            case "WRONG_ANSWER":
            case "TIME_LIMIT_EXCEEDED":
            case "MEMORY_LIMIT_EXCEEDED":
            case "RUNTIME_ERROR":
                return { backgroundColor: "#f8d7da", color: "#721c24", border: "1px solid #f5c6cb", padding: "0.2rem 0.6rem", borderRadius: "4px", fontSize: "0.85rem", fontWeight: "bold" };
            default:
                return { backgroundColor: "#fff3cd", color: "#856404", border: "1px solid #ffeeba", padding: "0.2rem 0.6rem", borderRadius: "4px", fontSize: "0.85rem", fontWeight: "bold" };
        }
    };

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1.5rem" }}>
            <h1 style={{ marginBottom: "1.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>Submissions</h1>
            
            {submissions.length === 0 ? (
                <p style={{ color: "var(--text)", textAlign: "center", marginTop: "2rem" }}>No submissions have been made yet.</p>
            ) : (
                <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: "8px", boxShadow: "var(--shadow)" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", backgroundColor: "var(--bg)" }}>
                        <thead>
                            <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--text)", fontWeight: "600" }}>
                                <th style={{ padding: "1rem" }}>Problem</th>
                                <th style={{ padding: "1rem" }}>Language</th>
                                <th style={{ padding: "1rem" }}>Submitted At</th>
                                <th style={{ padding: "1rem", textAlign: "right" }}>Verdict</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map((submission) => (
                                <tr key={submission._id} style={{ borderBottom: "1px solid var(--border)" }}>
                                    <td style={{ padding: "1rem", fontWeight: "600", color: "var(--text-h)" }}>
                                        {submission.problemId?.title || "Unknown Problem"}
                                    </td>
                                    <td style={{ padding: "1rem", textTransform: "uppercase", fontSize: "0.9rem", color: "var(--text)" }}>
                                        {submission.language}
                                    </td>
                                    <td style={{ padding: "1rem", fontSize: "0.9rem", color: "var(--text)" }}>
                                        {new Date(submission.submittedAt || submission.createdAt).toLocaleString()}
                                    </td>
                                    <td style={{ padding: "1rem", textAlign: "right" }}>
                                        <Link to={`/submissions/${submission._id}`} style={{ textDecoration: "none" }}>
                                            <span style={getVerdictStyle(submission.verdict)}>
                                                {submission.verdict}
                                            </span>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default SubmissionList;