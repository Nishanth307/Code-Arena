class StorageInterface {
    /**
     * Upload an object to storage.
     * @param {string} objectName - Destination path/name of the object
     * @param {Buffer|string} data - Content to upload
     * @returns {Promise<void>}
     */
    async putObject(objectName, data) {
        throw new Error("Method 'putObject' must be implemented");
    }

    /**
     * Retrieve an object from storage.
     * @param {string} objectName - Path/name of the object to retrieve
     * @returns {Promise<string>} - Content of the object
     */
    async getObject(objectName) {
        throw new Error("Method 'getObject' must be implemented");
    }
}

module.exports = StorageInterface;
