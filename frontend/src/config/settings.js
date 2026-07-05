const getEnvVar = (value, fallback) => {
    if (value) {
        return value.replace(/['"]/g, "").trim();
    }
    return fallback;
};

const settings = {
    BASE_URL: getEnvVar(import.meta.env.VITE_BASE_URL, ""),
    VITE_API_URL: getEnvVar(import.meta.env.VITE_API_URL, "/api"),
};

export default settings;
