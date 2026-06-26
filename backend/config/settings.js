const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const requiredEnvVars = [
    "APP_NAME",
    "BASE_URL",
    "BACKEND_PORT",
    "MONGODB_URI",
    "JWT_SECRET",
    "REFRESH_TOKEN_LIMIT_DAYS",
    "ACCESS_TOKEN_LIMIT_HOURS",
];

for (const key of requiredEnvVars) {
    if (!process.env[key]) {
        throw new Error(`${key} is not defined`);
    }
}

const storageProvider = process.env.STORAGE_PROVIDER || "minio";

if (storageProvider === "minio") {
    const minioVars = ["MINIO_ENDPOINT", "MINIO_PORT", "MINIO_ACCESS_KEY", "MINIO_SECRET_KEY", "MINIO_BUCKET"];
    for (const key of minioVars) {
        if (!process.env[key]) {
            throw new Error(`${key} is required when STORAGE_PROVIDER is 'minio'`);
        }
    }
} else if (storageProvider === "gcs") {
    const gcsVars = ["GCS_BUCKET", "GCS_PROJECT_ID"];
    for (const key of gcsVars) {
        if (!process.env[key]) {
            throw new Error(`${key} is required when STORAGE_PROVIDER is 'gcs'`);
        }
    }
} else if (storageProvider === "s3") {
    const s3Vars = ["S3_BUCKET", "S3_REGION", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"];
    for (const key of s3Vars) {
        if (!process.env[key]) {
            throw new Error(`${key} is required when STORAGE_PROVIDER is 's3'`);
        }
    }
}

// Build settings object
const settings = {
    APP_NAME: process.env.APP_NAME,
    MONGODB_URI: process.env.MONGODB_URI,
    BACKEND_PORT: process.env.BACKEND_PORT,
    FRONTEND_PORT: process.env.FRONTEND_PORT,
    BASE_URL: process.env.BASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    REFRESH_TOKEN_LIMIT_DAYS: process.env.REFRESH_TOKEN_LIMIT_DAYS,
    ACCESS_TOKEN_LIMIT_HOURS: process.env.ACCESS_TOKEN_LIMIT_HOURS,
    STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || "minio",
    MINIO_ENDPOINT: process.env.MINIO_ENDPOINT,
    MINIO_PORT: process.env.MINIO_PORT,
    MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY,
    MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY,
    MINIO_BUCKET: process.env.MINIO_BUCKET,
    MINIO_USE_SSL: process.env.MINIO_USE_SSL === "true",
    GCS_BUCKET: process.env.GCS_BUCKET,
    GCS_PROJECT_ID: process.env.GCS_PROJECT_ID,
    GCS_KEY_FILE: process.env.GCS_KEY_FILE,
    S3_BUCKET: process.env.S3_BUCKET,
    S3_REGION: process.env.S3_REGION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    FRONTEND_URL: process.env.FRONTEND_URL,
};

module.exports = settings;

