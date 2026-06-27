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
