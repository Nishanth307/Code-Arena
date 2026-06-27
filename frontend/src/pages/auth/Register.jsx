import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../api/userApi.js";
import AuthContext from "../../context/AuthContext.jsx";

export default function Register() {
    const navigate = useNavigate();
    const { fetchCurrentUser } = useContext(AuthContext);
    const [form, setForm] = useState({
        firstName: "", lastName: "", email: "", password: "", confirm: ""
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
            return setError("Passwords do not match.");
        }
        setLoading(true);
        try {
            await registerUser(form.firstName, form.lastName, form.email, form.password);
            await fetchCurrentUser();
            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h2>Create Account</h2>
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
                    required
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

                {error && <p className="error">{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Account"}
                </button>
            </form>
            <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
    );
}
