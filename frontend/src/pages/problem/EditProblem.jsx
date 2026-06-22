import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getProblemById, updateProblem } from "../../api/problemApi";

function EditProblem() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        statement: "",
        difficulty: "",
        timeLimitMillis: 1000,
        memoryLimitMBs: 256
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProblem();
    }, []);

    const fetchProblem = async () => {
        try {
            const response = await getProblemById(id);
            const problem = response.problem || response.data?.problem || response.data;

            setFormData({
                title: problem.title || "",
                statement: problem.statement || "",
                difficulty: problem.difficulty || "",
                timeLimitMillis: problem.timeLimitMillis !== undefined ? problem.timeLimitMillis : 1000,
                memoryLimitMBs: problem.memoryLimitMBs !== undefined ? problem.memoryLimitMBs : 256
            });
        } catch (error) {
            console.error("Error fetching problem:", error);
            setError("Failed to load problem details");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === "timeLimitMillis" || name === "memoryLimitMBs" ? Number(value) : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await updateProblem(id, formData);
            navigate("/problems");
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to update problem");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "700px", margin: "2rem auto", padding: "1.5rem" }}>
            <h1 style={{ marginBottom: "1.5rem" }}>Edit Problem</h1>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.4rem", textAlign: "left" }}>
                    <label style={{ fontWeight: "600", color: "var(--text-h)" }}>Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Title"
                        required
                        style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)" }}
                    />
                </div>

                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.4rem", textAlign: "left" }}>
                    <label style={{ fontWeight: "600", color: "var(--text-h)" }}>Problem Statement</label>
                    <textarea
                        name="statement"
                        rows={8}
                        value={formData.statement}
                        onChange={handleChange}
                        placeholder="Statement"
                        required
                        style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontFamily: "inherit" }}
                    />
                </div>

                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    <div className="form-group" style={{ flex: "1 1 150px", display: "flex", flexDirection: "column", gap: "0.4rem", textAlign: "left" }}>
                        <label style={{ fontWeight: "600", color: "var(--text-h)" }}>Difficulty</label>
                        <select
                            name="difficulty"
                            value={formData.difficulty}
                            onChange={handleChange}
                            required
                            style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)" }}
                        >
                            <option value="">Select Difficulty</option>
                            <option value="EASY">EASY</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HARD">HARD</option>
                        </select>
                    </div>

                    <div className="form-group" style={{ flex: "1 1 150px", display: "flex", flexDirection: "column", gap: "0.4rem", textAlign: "left" }}>
                        <label style={{ fontWeight: "600", color: "var(--text-h)" }}>Time Limit (ms)</label>
                        <input
                            type="number"
                            name="timeLimitMillis"
                            value={formData.timeLimitMillis}
                            onChange={handleChange}
                            required
                            min={100}
                            style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)" }}
                        />
                    </div>

                    <div className="form-group" style={{ flex: "1 1 150px", display: "flex", flexDirection: "column", gap: "0.4rem", textAlign: "left" }}>
                        <label style={{ fontWeight: "600", color: "var(--text-h)" }}>Memory Limit (MB)</label>
                        <input
                            type="number"
                            name="memoryLimitMBs"
                            value={formData.memoryLimitMBs}
                            onChange={handleChange}
                            required
                            min={16}
                            style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)" }}
                        />
                    </div>
                </div>

                {error && <div style={{ color: "red", fontWeight: "bold", textAlign: "left" }}>{error}</div>}

                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: "0.6rem 1.2rem",
                            borderRadius: "6px",
                            backgroundColor: "#007bff",
                            color: "#fff",
                            border: "none",
                            fontWeight: "bold",
                            cursor: loading ? "not-allowed" : "pointer"
                        }}
                    >
                        {loading ? "Updating..." : "Update Problem"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/problems")}
                        style={{
                            padding: "0.6rem 1.2rem",
                            borderRadius: "6px",
                            backgroundColor: "#6c757d",
                            color: "#fff",
                            border: "none",
                            fontWeight: "bold",
                            cursor: "pointer"
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditProblem;