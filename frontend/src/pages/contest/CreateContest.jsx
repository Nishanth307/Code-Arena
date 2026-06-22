import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createContest } from "../../api/contestApi";
import { getProblems, createProblem } from "../../api/problemApi";

function CreateContest() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        startTime: "",
        endTime: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Problems State
    const [allProblems, setAllProblems] = useState([]);
    const [selectedProblems, setSelectedProblems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Inline Create Problem State
    const [showInlineCreate, setShowInlineCreate] = useState(false);
    const [inlineLoading, setInlineLoading] = useState(false);
    const [inlineError, setInlineError] = useState("");
    const [newProblem, setNewProblem] = useState({
        title: "",
        statement: "",
        difficulty: "EASY",
        timeLimitMillis: 1000,
        memoryLimitMBs: 256
    });

    useEffect(() => {
        loadProblems();
    }, []);

    const loadProblems = async () => {
        try {
            const data = await getProblems();
            setAllProblems(data.problems || []);
        } catch (err) {
            console.error("Error loading problems:", err);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleCheckboxChange = (id) => {
        if (selectedProblems.includes(id)) {
            setSelectedProblems(selectedProblems.filter((pid) => pid !== id));
        } else {
            setSelectedProblems([...selectedProblems, id]);
        }
    };

    const handleInlineCreateProblem = async () => {
        if (!newProblem.title || !newProblem.statement) {
            setInlineError("Title and Statement are required.");
            return;
        }
        setInlineError("");
        setInlineLoading(true);
        try {
            const response = await createProblem(newProblem);
            const created = response.problem || response;
            
            // Add to list of all problems and select it
            setAllProblems((prev) => [...prev, created]);
            setSelectedProblems((prev) => [...prev, created._id]);
            
            // Reset inline form
            setNewProblem({
                title: "",
                statement: "",
                difficulty: "EASY",
                timeLimitMillis: 1000,
                memoryLimitMBs: 256
            });
            setShowInlineCreate(false);
        } catch (err) {
            console.error("Error creating problem inline:", err);
            setInlineError(err.response?.data?.message || err.message || "Failed to create problem.");
        } finally {
            setInlineLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await createContest({
                ...formData,
                problems: selectedProblems
            });
            navigate("/contests");
        } catch (err) {
            console.error("error creating contest", err);
            setError(err.response?.data?.message || err.message || "Failed to create contest");
        } finally {
            setLoading(false);
        }
    };

    const filteredProblems = allProblems.filter((prob) =>
        prob.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "1.5rem" }}>
            <h1 style={{ marginBottom: "1.5rem", color: "var(--text-h)" }}>Create New Contest</h1>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.4rem", textAlign: "left" }}>
                    <label style={{ fontWeight: "600", color: "var(--text-h)" }}>Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Weekly Contest 10"
                        required
                        style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)" }}
                    />
                </div>

                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.4rem", textAlign: "left" }}>
                    <label style={{ fontWeight: "600", color: "var(--text-h)" }}>Description</label>
                    <textarea
                        name="description"
                        rows={4}
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Provide details about the contest..."
                        required
                        style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontFamily: "inherit" }}
                    />
                </div>

                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    <div className="form-group" style={{ flex: "1 1 200px", display: "flex", flexDirection: "column", gap: "0.4rem", textAlign: "left" }}>
                        <label style={{ fontWeight: "600", color: "var(--text-h)" }}>Start Time</label>
                        <input
                            type="datetime-local"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleChange}
                            required
                            style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)" }}
                        />
                    </div>

                    <div className="form-group" style={{ flex: "1 1 200px", display: "flex", flexDirection: "column", gap: "0.4rem", textAlign: "left" }}>
                        <label style={{ fontWeight: "600", color: "var(--text-h)" }}>End Time</label>
                        <input
                            type="datetime-local"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleChange}
                            required
                            style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)" }}
                        />
                    </div>
                </div>

                {/* Select Problems Section */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", textAlign: "left", marginTop: "1rem", borderTop: "1px solid var(--border)", paddingTop: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <label style={{ fontWeight: "700", color: "var(--text-h)", fontSize: "1.1rem" }}>Select Problems</label>
                        <button
                            type="button"
                            onClick={() => setShowInlineCreate(!showInlineCreate)}
                            style={{
                                backgroundColor: "transparent",
                                border: "1px solid var(--accent)",
                                color: "var(--accent)",
                                padding: "0.3rem 0.8rem",
                                borderRadius: "6px",
                                fontSize: "0.85rem",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = "var(--accent-bg)"}
                            onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                        >
                            {showInlineCreate ? "Cancel" : "+ Create New Problem Inline"}
                        </button>
                    </div>

                    {/* Inline Create Problem Form */}
                    {showInlineCreate && (
                        <div style={{
                            border: "1px solid var(--accent-border)",
                            borderRadius: "8px",
                            padding: "1.2rem",
                            backgroundColor: "var(--accent-bg)",
                            marginBottom: "1.5rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem"
                        }}>
                            <h3 style={{ margin: 0, fontSize: "1rem", color: "var(--text-h)" }}>Create New Problem</h3>
                            
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-h)" }}>Problem Title</label>
                                <input
                                    type="text"
                                    value={newProblem.title}
                                    onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })}
                                    placeholder="e.g. Unique Paths"
                                    style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)" }}
                                />
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-h)" }}>Statement</label>
                                <textarea
                                    rows={4}
                                    value={newProblem.statement}
                                    onChange={(e) => setNewProblem({ ...newProblem, statement: e.target.value })}
                                    placeholder="Describe problem statement, input/output formats, and sample cases..."
                                    style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontFamily: "inherit" }}
                                />
                            </div>

                            <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
                                <div style={{ flex: "1 1 120px", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                    <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-h)" }}>Difficulty</label>
                                    <select
                                        value={newProblem.difficulty}
                                        onChange={(e) => setNewProblem({ ...newProblem, difficulty: e.target.value })}
                                        style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)" }}
                                    >
                                        <option value="EASY">EASY</option>
                                        <option value="MEDIUM">MEDIUM</option>
                                        <option value="HARD">HARD</option>
                                    </select>
                                </div>
                                
                                <div style={{ flex: "1 1 120px", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                    <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-h)" }}>Time (ms)</label>
                                    <input
                                        type="number"
                                        value={newProblem.timeLimitMillis}
                                        onChange={(e) => setNewProblem({ ...newProblem, timeLimitMillis: Number(e.target.value) })}
                                        min={100}
                                        style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)" }}
                                    />
                                </div>

                                <div style={{ flex: "1 1 120px", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                    <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-h)" }}>Memory (MB)</label>
                                    <input
                                        type="number"
                                        value={newProblem.memoryLimitMBs}
                                        onChange={(e) => setNewProblem({ ...newProblem, memoryLimitMBs: Number(e.target.value) })}
                                        min={16}
                                        style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)" }}
                                    />
                                </div>
                            </div>

                            {inlineError && <div style={{ color: "red", fontSize: "0.85rem", fontWeight: "bold" }}>{inlineError}</div>}

                            <button
                                type="button"
                                onClick={handleInlineCreateProblem}
                                disabled={inlineLoading}
                                style={{
                                    backgroundColor: "var(--accent)",
                                    color: "#fff",
                                    border: "none",
                                    padding: "0.5rem 1rem",
                                    borderRadius: "6px",
                                    fontWeight: "600",
                                    fontSize: "0.85rem",
                                    cursor: inlineLoading ? "not-allowed" : "pointer",
                                    alignSelf: "flex-start"
                                }}
                            >
                                {inlineLoading ? "Creating..." : "Save & Add Problem"}
                            </button>
                        </div>
                    )}

                    {/* Search Input for problems */}
                    <input
                        type="text"
                        placeholder="🔍 Search problems by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: "0.5rem",
                            borderRadius: "6px",
                            border: "1px solid var(--border)",
                            backgroundColor: "var(--bg)",
                            color: "var(--text-h)",
                            fontSize: "0.9rem",
                            marginBottom: "0.8rem"
                        }}
                    />

                    {/* Checkbox list of problems */}
                    <div style={{
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        maxHeight: "220px",
                        overflowY: "auto",
                        backgroundColor: "var(--bg)",
                        padding: "0.5rem"
                    }}>
                        {filteredProblems.length === 0 ? (
                            <div style={{ padding: "1rem", color: "var(--text)", textAlign: "center", fontSize: "0.9rem" }}>
                                No problems found.
                            </div>
                        ) : (
                            filteredProblems.map((prob) => {
                                const isChecked = selectedProblems.includes(prob._id);
                                return (
                                    <label
                                        key={prob._id}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.75rem",
                                            padding: "0.5rem 0.75rem",
                                            borderRadius: "6px",
                                            cursor: "pointer",
                                            transition: "background-color 0.15s",
                                            backgroundColor: isChecked ? "var(--accent-bg)" : "transparent",
                                            marginBottom: "0.25rem"
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => handleCheckboxChange(prob._id)}
                                            style={{ cursor: "pointer" }}
                                        />
                                        <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--text-h)", flex: 1 }}>
                                            {prob.title}
                                        </span>
                                        <span style={{
                                            padding: "0.2rem 0.5rem",
                                            borderRadius: "4px",
                                            fontWeight: "bold",
                                            fontSize: "0.75rem",
                                            backgroundColor: prob.difficulty === "EASY" ? "#d4edda" : prob.difficulty === "MEDIUM" ? "#fff3cd" : "#f8d7da",
                                            color: prob.difficulty === "EASY" ? "#155724" : prob.difficulty === "MEDIUM" ? "#856404" : "#721c24"
                                        }}>
                                            {prob.difficulty}
                                        </span>
                                    </label>
                                );
                            })
                        )}
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
                            backgroundColor: "#28a745",
                            color: "#fff",
                            border: "none",
                            fontWeight: "bold",
                            cursor: loading ? "not-allowed" : "pointer"
                        }}
                    >
                        {loading ? "Creating..." : "Create Contest"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/contests")}
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

export default CreateContest;
