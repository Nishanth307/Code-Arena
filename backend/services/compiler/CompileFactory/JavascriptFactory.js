const JavaScriptRunner = require("../runners/JavaScriptRunner");
const ICompilerFactory = require("./ICompilerFactory");

class JavascriptCompilerFactory extends ICompilerFactory {
    async execute(filePath, input, options = {}) {
        return JavaScriptRunner.execute(filePath, input, options);
    }
}

module.exports = JavascriptCompilerFactory;
