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
    // Dynamically target the host IP or Cloud Run backend URL
    if (typeof window !== "undefined" && window.location) {
        const hostname = window.location.hostname;
        
        // 1. Cloud Run / Deployed Host dynamic domain routing (generic)
        if (hostname.includes("frontend")) {
            const backendHost = hostname.replace("frontend", "backend");
            return `https://${backendHost}/api`;
        }

        // 2. Vercel & Production custom domain routing fallback
        const isLocal = hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("192.168.") || hostname.startsWith("10.");
        if (!isLocal) {
            return "https://online-judge-backend-969483836708.us-central1.run.app/api";
        }

        // 3. Local network IP address mapping
        const isIp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname);
        if (isIp && hostname !== "127.0.0.1") {
            return `http://${hostname}:5000/api`;
        }
    }
    // Default: use Vite dev proxy in development
    if (import.meta.env.DEV) {
        return "/api";
    }
    // Do not use localhost in production builds, default to Cloud Run backend
    return "https://online-judge-backend-969483836708.us-central1.run.app/api";
};

const resolveBaseUrl = () => {
    const fromEnv = import.meta.env.VITE_BASE_URL;
    if (fromEnv) {
        return fromEnv.replace(/['"]/g, "").trim();
    }
    // Dynamically target the host IP or Cloud Run backend URL
    if (typeof window !== "undefined" && window.location) {
        const hostname = window.location.hostname;

        // 1. Cloud Run / Deployed Host dynamic domain routing (generic)
        if (hostname.includes("frontend")) {
            const backendHost = hostname.replace("frontend", "backend");
            return `https://${backendHost}`;
        }

        // 2. Vercel & Production custom domain routing fallback
        const isLocal = hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("192.168.") || hostname.startsWith("10.");
        if (!isLocal) {
            return "https://online-judge-backend-969483836708.us-central1.run.app";
        }

        // 3. Local network IP address mapping
        const isIp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname);
        if (isIp && hostname !== "127.0.0.1") {
            return `http://${hostname}:5000`;
        }
    }
    if (import.meta.env.DEV) {
        return "";
    }
    // Do not use localhost in production builds, default to Cloud Run backend
    return "https://online-judge-backend-969483836708.us-central1.run.app";
};

const settings = {
    BASE_URL: resolveBaseUrl(),
    VITE_API_URL: resolveApiUrl(),
};

export default settings;
