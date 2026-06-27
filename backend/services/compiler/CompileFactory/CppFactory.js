const CppRunner = require("../runners/CppRunner");
const ICompilerFactory = require("./ICompilerFactory");

class CppCompilerFactory extends ICompilerFactory {
    async execute(filePath, input, options = {}) {
        return CppRunner.execute(filePath, input, options);
    }
}

module.exports = CppCompilerFactory;
