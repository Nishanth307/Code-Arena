const MAX_CODE_SIZE = 100 * 1024; // 100 KB
const MAX_INPUT_SIZE = 50 * 1024; // 50 KB

const validateSubmissionPayload = (req, res, next) => {
    const { problemId, language, code } = req.body;

    if (!problemId || !language || !code) {
        return res.status(400).json({
            success: false,
            message: "problemId, language, and code are required"
        });
    }

    if (typeof code !== "string" || code.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Code must be a non-empty string"
        });
    }

    if (code.length > MAX_CODE_SIZE) {
        return res.status(413).json({
            success: false,
            message: `Code exceeds maximum size of ${MAX_CODE_SIZE / 1024}KB`
        });
    }

    const allowedLanguages = ["cpp", "python", "java", "javascript", "golang"];
    if (!allowedLanguages.includes(language)) {
        return res.status(400).json({
            success: false,
            message: `Unsupported language. Allowed: ${allowedLanguages.join(", ")}`
        });
    }

    next();
};

const validateCompilerPayload = (req, res, next) => {
    const { language, code, input } = req.body;

    if (!language || !code) {
        return res.status(400).json({
            success: false,
            message: "Language and code are required"
        });
    }

    if (typeof code !== "string" || code.length > MAX_CODE_SIZE) {
        return res.status(413).json({
            success: false,
            message: `Code exceeds maximum size of ${MAX_CODE_SIZE / 1024}KB`
        });
    }

    if (input && typeof input === "string" && input.length > MAX_INPUT_SIZE) {
        return res.status(413).json({
            success: false,
            message: `Input exceeds maximum size of ${MAX_INPUT_SIZE / 1024}KB`
        });
    }

    next();
};

module.exports = { validateSubmissionPayload, validateCompilerPayload, MAX_CODE_SIZE };
