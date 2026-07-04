const PythonCompilerFactory = require("./PythonFactory");
const CppCompilerFactory = require("./CppFactory");
const JavascriptCompilerFactory = require("./JavascriptFactory");
const ICompilerFactory = require("./ICompilerFactory");

class CompilerFactoryProvider {
    static getFactory(language) {
        const factories = {
            python: new PythonCompilerFactory(),
            cpp: new CppCompilerFactory(),
            javascript: new JavascriptCompilerFactory(),
        }

        const factory = factories[language];
        if (!factory) {
            throw new Error(`unsupported language: ${language}`);
        }
        return factory;
    }
}

module.exports = CompilerFactoryProvider;