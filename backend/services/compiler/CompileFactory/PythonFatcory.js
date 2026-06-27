const PythonRunner = require("../runners/PythonRunner");
const ICompilerFactory = require("./ICompilerFactory");

class PythonFactory extends ICompilerFactory {
    async execute(filePath, input, options = {}) {
        return PythonRunner.execute(filePath, input, options);
    }
}

module.exports = PythonFactory;
