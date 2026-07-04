const cleanupFile = require("../services/compiler/cleanupFile");
const generateFile = require("../services/compiler/generateFile");
const CompilerFactory = require("../services/compiler/CompileFactory/ICompilerFactory");
const PythonCompilerFactory = require("../services/compiler/CompileFactory/PythonFactory");
const CppCompilerFactory = require("../services/compiler/CompileFactory/CppFactory");
const CompilerFactoryProvider = require("../services/compiler/CompileFactory/compileFactoryProvide");



const compileCode = async (req, res) => {
    let filePath;
    try {
        const { language, code, input } = req.body;
        if (!language || !code) {
            return res.status(400).json({
                success: false,
                message: "Language and code are required"
            });
        }
        filePath = await generateFile(language, code);
        const factory = CompilerFactoryProvider.getFactory(language);
        const execOptions = {
            timeout: req.body.timeLimitMillis || 2000,
            maxBuffer: (req.body.memoryLimitMBs || 256) * 1024 * 1024
        };
        const output = await factory.execute(filePath, input || "", execOptions);
        return res.status(200).json({
            success: true,
            output
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    } finally {
        if (filePath) {
            await cleanupFile(filePath);
        }
    }
};

module.exports = { compileCode };