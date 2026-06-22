import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../api/userApi.js";

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        firstName: "", lastName: "", email: "", password: "", confirm: "", role: "USER"
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (form.password !== form.confirm) {
            return setError("passwords do not match.");
        }
        setLoading(true);
        try {
            await registerUser(form.firstName, form.lastName, form.email, form.password, form.role);
            navigate("/login");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h2>create Account</h2>
            <form onSubmit={handleSubmit}>
                <input
                    name="firstName"
                    placeholder="First Name"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                />

                <input
                    name="lastName"
                    placeholder="Last Name"
                    value={form.lastName}
                    onChange={handleChange}
                />

                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                />

                <input
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    type="password"
                />

                <input
                    name="confirm"
                    placeholder="Confirm Password"
                    value={form.confirm}
                    onChange={handleChange}
                    required
                    type="password"
                />

                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", textAlign: "left" }}>
                    <label style={{ fontWeight: "600", fontSize: "0.9rem", color: "var(--text)" }}>Select Role:</label>
                    <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        required
                        style={{ padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)" }}
                    >
                        <option value="USER">USER (Participant)</option>
                        <option value="ADMIN">ADMIN (Organizer)</option>
                    </select>
                </div>

                {error && <p className="error">{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Account"}
                </button>
            </form>
            <p>Already have account? <Link to="/login">Login here</Link></p>
        </div>
    )
}