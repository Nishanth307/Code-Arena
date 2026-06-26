import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProblem } from "../../api/problemApi";

function CreateProblem() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        statement: "",
        inputFormat: "",
        outputFormat: "",
        constraints: "",
        difficulty: "EASY",
        timeLimitMillis: 1000,
        memoryLimitMBs: 256
    });
    const [testCases, setTestCases] = useState([
        { input: "", expectedOutput: "", explanation: "", isHidden: false }
    ]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === "timeLimitMillis" || name === "memoryLimitMBs" ? Number(value) : value
        });
    };

    const handleAddTestCase = () => {
        setTestCases([...testCases, { input: "", expectedOutput: "", explanation: "", isHidden: false }]);
    };

    const handleRemoveTestCase = (index) => {
        setTestCases(testCases.filter((_, i) => i !== index));
    };

    const handleTestCaseChange = (index, field, value) => {
        const updated = [...testCases];
        updated[index][field] = value;
        setTestCases(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await createProblem({
                ...formData,
                testCases
            });
            navigate("/problems");
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to create problem");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "700px", margin: "2rem auto", padding: "1.5rem" }}>
            <h1 style={{ marginBottom: "1.5rem", color: "var(--text-h)" }}>Create New Problem</h1>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.4rem", textAlign: "left" }}>
                    <label style={{ fontWeight: "600", color: "var(--text-h)" }}>Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Two Sum"
                        required
                        style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)" }}
                    />
                </div>

                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.4rem", textAlign: "left" }}>
                    <label style={{ fontWeight: "600", color: "var(--text-h)" }}>Problem Statement</label>
                    <textarea
                        name="statement"
                        rows={6}
                        value={formData.statement}
                        onChange={handleChange}
                        placeholder="Write the problem description and constraints..."
                        required
                        style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontFamily: "inherit" }}
                    />
                </div>

                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.4rem", textAlign: "left" }}>
                    <label style={{ fontWeight: "600", color: "var(--text-h)" }}>Input Format</label>
                    <textarea
                        name="inputFormat"
                        rows={4}
                        value={formData.inputFormat}
                        onChange={handleChange}
                        placeholder="Describe how the program should read the input (e.g. size of array followed by space-separated elements). Include parsing code snippets in Python/C++."
                        style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontFamily: "inherit" }}
                    />
                </div>

                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.4rem", textAlign: "left" }}>
                    <label style={{ fontWeight: "600", color: "var(--text-h)" }}>Output Format</label>
                    <textarea
                        name="outputFormat"
                        rows={4}
                        value={formData.outputFormat}
                        onChange={handleChange}
                        placeholder="Describe what the program should print (e.g. Print a single integer representing the sum). Include print code snippets."
                        style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontFamily: "inherit" }}
                    />
                </div>

                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.4rem", textAlign: "left" }}>
                    <label style={{ fontWeight: "600", color: "var(--text-h)" }}>Constraints</label>
                    <textarea
                        name="constraints"
                        rows={3}
                        value={formData.constraints}
                        onChange={handleChange}
                        placeholder="e.g. 1 <= nums.length <= 10^4..."
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

                {/* Test Cases Section */}
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.5rem", marginTop: "1rem", textAlign: "left" }}>
                    <h2 style={{ fontSize: "1.25rem", color: "var(--text-h)", marginBottom: "1rem" }}>Test Cases</h2>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {testCases.map((tc, index) => (
                            <div key={index} style={{ border: "1px solid var(--border)", borderRadius: "8px", padding: "1rem", backgroundColor: "var(--code-bg)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
                                    <span style={{ fontWeight: "600", color: "var(--text-h)", fontSize: "0.95rem" }}>Test Case #{index + 1}</span>
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                        <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem", cursor: "pointer", color: "var(--text)" }}>
                                            <input
                                                type="checkbox"
                                                checked={tc.isHidden}
                                                onChange={(e) => handleTestCaseChange(index, "isHidden", e.target.checked)}
                                                style={{ cursor: "pointer" }}
                                            />
                                            Is Hidden?
                                        </label>
                                        {testCases.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTestCase(index)}
                                                style={{
                                                    padding: "0.25rem 0.6rem",
                                                    backgroundColor: "transparent",
                                                    border: "1px solid #dc3545",
                                                    color: "#dc3545",
                                                    borderRadius: "4px",
                                                    fontSize: "0.8rem",
                                                    fontWeight: "600",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "0.8rem" }}>
                                    <div style={{ flex: "1 1 250px", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                        <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-h)" }}>Input</label>
                                        <textarea
                                            rows={3}
                                            value={tc.input}
                                            onChange={(e) => handleTestCaseChange(index, "input", e.target.value)}
                                            required
                                            placeholder="Input data for the test case..."
                                            style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontFamily: "var(--mono)", fontSize: "0.85rem", boxSizing: "border-box" }}
                                        />
                                    </div>
                                    
                                    <div style={{ flex: "1 1 250px", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                        <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-h)" }}>Expected Output</label>
                                        <textarea
                                            rows={3}
                                            value={tc.expectedOutput}
                                            onChange={(e) => handleTestCaseChange(index, "expectedOutput", e.target.value)}
                                            required
                                            placeholder="Expected output data..."
                                            style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontFamily: "var(--mono)", fontSize: "0.85rem", boxSizing: "border-box" }}
                                        />
                                    </div>
                                </div>
                                
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                    <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-h)" }}>Explanation (Optional)</label>
                                    <input
                                        type="text"
                                        value={tc.explanation || ""}
                                        onChange={(e) => handleTestCaseChange(index, "explanation", e.target.value)}
                                        placeholder="Explain why this input produces this output..."
                                        style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontSize: "0.85rem", boxSizing: "border-box" }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <button
                        type="button"
                        onClick={handleAddTestCase}
                        style={{
                            marginTop: "1rem",
                            padding: "0.5rem 1rem",
                            backgroundColor: "transparent",
                            border: "1px solid var(--accent)",
                            color: "var(--accent)",
                            borderRadius: "6px",
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "background-color 0.2s"
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "var(--accent-bg)"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                    >
                        + Add Test Case
                    </button>
                </div>

                {error && <div style={{ color: "red", fontWeight: "bold", textAlign: "left" }}>{error}</div>}

                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: "0.6rem 1.2rem",
                            borderRadius: "6px",
                            backgroundColor: "#28a745",
                            color: "#fff",
                            border: "none",
                            fontWeight: "bold",
                            cursor: loading ? "not-allowed" : "pointer"
                        }}
                    >
                        {loading ? "Creating..." : "Create Problem"}
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

export default CreateProblem;