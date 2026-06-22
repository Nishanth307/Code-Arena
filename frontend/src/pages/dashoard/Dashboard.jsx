import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSubmissionById } from "../../api/submissionApi";
import { logoutUser } from "../../api/userApi";

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [lastSubmission, setLastSubmission] = useState(null);
    const [polling, setPolling] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                // Ignore parsing errors
            }
        } else {
            navigate("/login");
        }
    }, [navigate]);

    // Poll for submission verdict if there is a tracking ID in localStorage
    useEffect(() => {
        const subId = localStorage.getItem("last_submission_id");
        if (!subId) return;

        let intervalId;
        const fetchStatus = async () => {
            try {
                setPolling(true);
                const res = await getSubmissionById(subId);
                const submission = res.submission || res.data || res;
                setLastSubmission(submission);
                
                if (submission && submission.verdict !== "PENDING") {
                    clearInterval(intervalId);
                    setPolling(false);
                }
            } catch (error) {
                console.error("Error polling submission status:", error);
            }
        };

        fetchStatus();
        intervalId = setInterval(fetchStatus, 500);

        return () => clearInterval(intervalId);
    }, []);

    const handleLogout = async () => {
        try {
            await logoutUser();
        } catch (e) {
            console.error("Logout failed on server", e);
        } finally {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            localStorage.removeItem("last_submission_id");
            navigate("/login");
        }
    };

    const handleClearTracking = () => {
        localStorage.removeItem("last_submission_id");
        setLastSubmission(null);
    };

    if (!user) return null;

    // Helper for rendering verdict styles
    const getVerdictStyle = (verdict) => {
        switch (verdict) {
            case "ACCEPTED":
                return { backgroundColor: "#d4edda", color: "#155724", border: "1px solid #c3e6cb" };
            case "COMPILATION_ERROR":
            case "WRONG_ANSWER":
            case "TIME_LIMIT_EXCEEDED":
            case "MEMORY_LIMIT_EXCEEDED":
            case "RUNTIME_ERROR":
                return { backgroundColor: "#f8d7da", color: "#721c24", border: "1px solid #f5c6cb" };
            default:
                return { backgroundColor: "#fff3cd", color: "#856404", border: "1px solid #ffeeba" };
        }
    };

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #eee", paddingBottom: "1rem" }}>
                <h1>Dashboard</h1>
                <button 
                    onClick={handleLogout}
                    style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#dc3545",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        fontWeight: "bold",
                        cursor: "pointer"
                    }}
                >
                    Logout
                </button>
            </div>

            <div style={{ display: "flex", gap: "2rem", marginTop: "2rem", flexWrap: "wrap" }}>
                {/* Account Details */}
                <div style={{ 
                    flex: "1 1 300px", 
                    padding: "1.5rem", 
                    border: "1px solid #ddd", 
                    borderRadius: "8px", 
                    backgroundColor: "#fff",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                }}>
                    <h2>Account Details</h2>
                    <p><strong>First Name:</strong> {user.firstName}</p>
                    <p><strong>Last Name:</strong> {user.lastName}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Status:</strong> Active / Authenticated</p>
                </div>

                {/* Last Submission Polling */}
                {lastSubmission && (
                    <div style={{ 
                        flex: "1 1 300px", 
                        padding: "1.5rem", 
                        border: "1px solid #ddd", 
                        borderRadius: "8px", 
                        backgroundColor: "#fff",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h2>Submission Status</h2>
                            <button 
                                onClick={handleClearTracking}
                                style={{ 
                                    border: "none", 
                                    backgroundColor: "transparent", 
                                    color: "#999", 
                                    cursor: "pointer",
                                    fontSize: "0.85rem"
                                }}
                            >
                                Clear Card
                            </button>
                        </div>
                        <p><strong>Submission ID:</strong> {lastSubmission._id}</p>
                        <p><strong>Language:</strong> {lastSubmission.language}</p>
                        
                        <div style={{
                            padding: "0.8rem",
                            borderRadius: "4px",
                            fontWeight: "bold",
                            textAlign: "center",
                            margin: "1rem 0",
                            ...getVerdictStyle(lastSubmission.verdict)
                        }}>
                            Verdict: {lastSubmission.verdict}
                            {polling && " ..."}
                        </div>

                        {lastSubmission.verdict !== "PENDING" && (
                            <div>
                                <p><strong>Execution Time:</strong> {lastSubmission.executionTime !== undefined ? `${lastSubmission.executionTime} ms` : "N/A"}</p>
                                <p><strong>Memory Used:</strong> {lastSubmission.memoryUsed !== undefined ? `${lastSubmission.memoryUsed} KB` : "N/A"}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
