const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const settings = require("./config/settings");
const DBConnection = require("./config/db");
const userRoute = require("./routes/userRoutes");
const problemRoute = require("./routes/problemRoutes");
const contestRoute = require("./routes/contestRoutes");
const adminContestRoute = require("./routes/adminContestRoutes");
const userContestRoute = require("./routes/userContestRoutes");
const submissionRoute = require("./routes/submissionRoutes");
const testCaseRoute = require("./routes/testCaseRoutes");
const compilerRoute = require("./routes/compilerRoutes");
const leaderboardRoute = require("./routes/leaderboardRoutes");
const errorHandler = require("./middleware/errorHandler");
const { publicLimiter } = require("./middleware/rateLimiter");

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5000",
    "http://127.0.0.1:5000"
];

if (settings.FRONTEND_URL) {
    allowedOrigins.push(settings.FRONTEND_URL.replace(/['"]/g, "").trim());
}
if (settings.BASE_URL) {
    allowedOrigins.push(settings.BASE_URL.replace(/['"]/g, "").trim());
}
if (settings.FRONTEND_PORT) {
    const port = String(settings.FRONTEND_PORT).replace(/['"]/g, "").trim();
    allowedOrigins.push(`http://localhost:${port}`);
    allowedOrigins.push(`http://127.0.0.1:${port}`);
}

app.use(cors({
    origin(origin, callback) {
        if (!origin) return callback(null, true);
        const cleanOrigin = origin.trim();
        const isLocalhost = cleanOrigin.startsWith("http://localhost:") ||
            cleanOrigin.startsWith("http://127.0.0.1:") ||
            cleanOrigin.startsWith("https://localhost:") ||
            cleanOrigin.startsWith("https://127.0.0.1:");

        if (allowedOrigins.includes(cleanOrigin) || isLocalhost || settings.NODE_ENV === "development") {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}));

app.use(cookieParser());
app.use(express.json({ limit: "200kb" }));
app.use(express.urlencoded({ extended: true, limit: "200kb" }));
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});
app.use(publicLimiter);

app.get("/", (req, res) => {
    res.status(200).json({
        message: "online judge is running",
        status: "healthy",
        timestamp: new Date().toISOString()
    });
});

app.use("/api/user", userRoute);
app.use("/api/problem", problemRoute);
app.use("/api/contest", contestRoute);
app.use("/api/admin/contests", adminContestRoute);
app.use("/api/contests", userContestRoute);
app.use("/api/submission", submissionRoute);
app.use("/api/testCase", testCaseRoute);
app.use("/api/compiler", compilerRoute);
app.use("/api/leaderboard", leaderboardRoute);

app.use(errorHandler);

const startServer = async () => {
    try {
        await DBConnection();
        console.log("MongoDB Connected");

        const { ensureSeedData } = require("./services/seedService");
        await ensureSeedData();

        app.listen(settings.BACKEND_PORT, "0.0.0.0", () => {
            console.log(`${settings.APP_NAME} server is running on port ${settings.BACKEND_PORT}`);
        });
    } catch (err) {
        console.log("Failed to start:", err);
        process.exit(1);
    }
};

startServer();
