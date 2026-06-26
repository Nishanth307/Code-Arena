const StorageInterface = require("./storageInterface");
const minioClient = require("../../config/minio");
const settings = require("../../config/settings");

class MinioAdapter extends StorageInterface {
    constructor() {
        super();
        this.bucket = settings.MINIO_BUCKET;
    }

    async putObject(objectName, data) {
        const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
        await minioClient.putObject(this.bucket, objectName, buffer);
    }

    async getObject(objectName) {
        return new Promise((resolve, reject) => {
            minioClient.getObject(this.bucket, objectName, (err, dataStream) => {
                if (err) return reject(err);
                let content = "";
                dataStream.on("data", (chunk) => {
                    content += chunk.toString();
                });
                dataStream.on("end", () => {
                    resolve(content);
                });
                dataStream.on("error", (streamErr) => {
                    reject(streamErr);
                });
            });
        });
    }
}

module.exports = MinioAdapter;
