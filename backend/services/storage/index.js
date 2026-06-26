const settings = require("../../config/settings");

const StorageProvider = Object.freeze({
    GCS: "gcs",
    S3: "s3",
    MINIO: "minio"
});

const provider = settings.STORAGE_PROVIDER.toLowerCase();

let storageAdapter;

if (provider === StorageProvider.GCS) {
    const GcsAdapter = require("./gcsAdapter");
    storageAdapter = new GcsAdapter();
} else if (provider === StorageProvider.S3) {
    const S3Adapter = require("./s3Adapter");
    storageAdapter = new S3Adapter();
} else if (provider === StorageProvider.MINIO) {
    const MinioAdapter = require("./minioAdapter");
    storageAdapter = new MinioAdapter();
} else {
    throw new Error(`Unsupported STORAGE_PROVIDER: ${settings.STORAGE_PROVIDER}`);
}

module.exports = storageAdapter;
