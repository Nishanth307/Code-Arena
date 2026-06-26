const StorageInterface = require("./storageInterface");
const settings = require("../../config/settings");

class GcsAdapter extends StorageInterface {
    constructor() {
        super();
        this.bucketName = settings.GCS_BUCKET;
        this.projectId = settings.GCS_PROJECT_ID;
        this.keyFilename = settings.GCS_KEY_FILE;
        this.storage = null;
    }

    _init() {
        if (!this.storage) {
            const { Storage } = require("@google-cloud/storage");
            const config = { projectId: this.projectId };
            if (this.keyFilename) {
                config.keyFilename = this.keyFilename;
            }
            this.storage = new Storage(config);
        }
    }

    async putObject(objectName, data) {
        this._init();
        const bucket = this.storage.bucket(this.bucketName);
        const file = bucket.file(objectName);
        const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
        await file.save(buffer);
    }

    async getObject(objectName) {
        this._init();
        const bucket = this.storage.bucket(this.bucketName);
        const file = bucket.file(objectName);
        const [contents] = await file.download();
        return contents.toString();
    }
}

module.exports = GcsAdapter;
