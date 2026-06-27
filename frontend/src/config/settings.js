const resolveApiUrl = () => {
    const fromEnv = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
    if (fromEnv) {
        const cleaned = fromEnv.replace(/['"]/g, "").trim();
        // Reject misconfigured URLs pointing at the frontend dev server
        if (cleaned.includes(":5173") || cleaned.includes(":5174")) {
            return "/api";
        }
        return cleaned;
    }
    // Dynamically target the host IP if accessed via local network
    if (typeof window !== "undefined" && window.location) {
        const hostname = window.location.hostname;
        if (hostname !== "localhost" && hostname !== "127.0.0.1" && !hostname.includes("example.com")) {
            return `http://${hostname}:5000/api`;
        }
    }
    // Default: use Vite dev proxy in development
    if (import.meta.env.DEV) {
        return "/api";
    }
    return "http://localhost:5000/api";
};

const resolveBaseUrl = () => {
    const fromEnv = import.meta.env.VITE_BASE_URL;
    if (fromEnv) {
        return fromEnv.replace(/['"]/g, "").trim();
    }
    // Dynamically target the host IP if accessed via local network
    if (typeof window !== "undefined" && window.location) {
        const hostname = window.location.hostname;
        if (hostname !== "localhost" && hostname !== "127.0.0.1" && !hostname.includes("example.com")) {
            return `http://${hostname}:5000`;
        }
    }
    if (import.meta.env.DEV) {
        return "";
    }
    return "http://localhost:5000";
};

const settings = {
    BASE_URL: resolveBaseUrl(),
    VITE_API_URL: resolveApiUrl(),
};

export default settings;
