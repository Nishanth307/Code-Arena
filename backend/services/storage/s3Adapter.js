const StorageInterface = require("./storageInterface");
const settings = require("../../config/settings");

class S3Adapter extends StorageInterface {
    constructor() {
        super();
        this.bucketName = settings.S3_BUCKET;
        this.region = settings.S3_REGION;
        this.accessKeyId = settings.AWS_ACCESS_KEY_ID;
        this.secretAccessKey = settings.AWS_SECRET_ACCESS_KEY;
        this.s3Client = null;
    }

    _init() {
        if (!this.s3Client) {
            const { S3Client } = require("@aws-sdk/client-s3");
            const config = {
                region: this.region,
            };
            if (this.accessKeyId && this.secretAccessKey) {
                config.credentials = {
                    accessKeyId: this.accessKeyId,
                    secretAccessKey: this.secretAccessKey,
                };
            }
            this.s3Client = new S3Client(config);
        }
    }

    async putObject(objectName, data) {
        this._init();
        const { PutObjectCommand } = require("@aws-sdk/client-s3");
        const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: objectName,
            Body: buffer,
        });
        await this.s3Client.send(command);
    }

    async getObject(objectName) {
        this._init();
        const { GetObjectCommand } = require("@aws-sdk/client-s3");
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: objectName,
        });
        const response = await this.s3Client.send(command);
        const streamToString = (stream) =>
            new Promise((resolve, reject) => {
                const chunks = [];
                stream.on("data", (chunk) => chunks.push(chunk));
                stream.on("error", reject);
                stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
            });
        return streamToString(response.Body);
    }
}

module.exports = S3Adapter;
