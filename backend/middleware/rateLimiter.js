const rateLimit = require("express-rate-limit");

const publicLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Limit is 100 requests per minute per IP."
    }
});

const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many login attempts. Limit is 5 requests per minute per IP."
    }
});

const submissionLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many submissions. Limit is 5 submissions per minute per IP."
    }
});

module.exports = { publicLimiter, loginLimiter, submissionLimiter };
