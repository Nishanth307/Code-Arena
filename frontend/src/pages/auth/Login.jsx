import { useState, useContext } from "react";
import { loginUser } from "../../api/userApi.js";
import { createSubmission } from "../../api/submissionApi.js";
import { useNavigate, Link, useLocation } from "react-router-dom";
import AuthContext from "../../context/AuthContext.jsx";

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { fetchCurrentUser } = useContext(AuthContext);
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const infoMessage = location.state?.message;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await loginUser(form.email, form.password);
            
            // Save user info and token
            localStorage.setItem("user", JSON.stringify(data.user));
            if (data.token) {
                localStorage.setItem("token", data.token);
            }
            
            // Fetch current user details into global AuthContext
            await fetchCurrentUser();
            
            // Check for pending submission saved before redirecting
            const pending = localStorage.getItem("pending_submission");
            if (pending) {
                try {
                    const { problemId, language, code } = JSON.parse(pending);
                    
                    // The token is now in localStorage, so request interceptor will send it
                    const response = await createSubmission({ problemId, language, code });
                    const sub = response.submission || response.data?.submission || response.data;
                    const submissionId = sub?._id || response.submissionId;
                    
                    if (submissionId) {
                        localStorage.setItem("last_submission_id", submissionId);
                    }
                } catch (err) {
                    console.error("Failed to process pending submission post-login:", err);
                } finally {
                    localStorage.removeItem("pending_submission");
                }
            }

            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h2>Sign In</h2>
            
            {infoMessage && (
                <div style={{ 
                    padding: "0.8rem", 
                    backgroundColor: "#e8f4fd", 
                    color: "#0c5460", 
                    border: "1px solid #bee5eb", 
                    borderRadius: "4px", 
                    marginBottom: "1rem",
                    fontSize: "0.9rem"
                }}>
                    {infoMessage}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                />

                {error && <p className="error">{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                </button>
            </form>
            <p style={{ marginTop: "1rem" }}>
                Don't have an account? <Link to="/register" style={{ color: "#007bff" }}>Register</Link>
            </p>
        </div>
    );
}