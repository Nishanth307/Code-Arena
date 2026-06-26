const settings = require("../../config/settings");
const MinioAdapter = require("./minioAdapter");
const GcsAdapter = require("./gcsAdapter");
const S3Adapter = require("./s3Adapter");

const provider = settings.STORAGE_PROVIDER.toLowerCase();

let storageAdapter;

if (provider === "minio") {
    storageAdapter = new MinioAdapter();
} else if (provider === "gcs") {
    storageAdapter = new GcsAdapter();
} else if (provider === "s3") {
    storageAdapter = new S3Adapter();
} else {
    throw new Error(`Unsupported STORAGE_PROVIDER: ${settings.STORAGE_PROVIDER}`);
}

module.exports = storageAdapter;
