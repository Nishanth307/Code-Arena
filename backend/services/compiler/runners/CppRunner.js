const { exec } = require("child_process");
const path = require("path");
const fs = require("fs/promises");
const CompilerRunner = require("./compilerInterface");

class CppRunner extends CompilerRunner {
    async execute(filePath, input = "", options = {}) {
        const timeout = options.timeout || 2000;
        const maxBuffer = options.maxBuffer || 10 * 1024 * 1024;
        const dirName = path.dirname(filePath);
        const fileName = path.basename(filePath, ".cpp");
        const outputPath = path.join(dirName, `${fileName}.out`);

        return new Promise((resolve, reject) => {
            exec(`g++ ${filePath} -o ${outputPath} -std=c++17 -O2`, { timeout: 10000 }, (compileError, _stdout, compileStderr) => {
                if (compileError) {
                    const ceErr = new Error(compileStderr || compileError.message || "Compilation failed");
                    ceErr.code = "CE";
                    return reject(ceErr);
                }

                const child = exec(
                    outputPath,
                    { timeout, maxBuffer, killSignal: "SIGKILL" },
                    async (runError, runStdout, runStderr) => {
                        try {
                            await fs.unlink(outputPath);
                        } catch (cleanupErr) {
                            if (cleanupErr.code !== "ENOENT") {
                                console.error(`Failed to clean up binary: ${outputPath}`, cleanupErr);
                            }
                        }

                        if (runError) {
                            if (runError.killed || runError.signal === "SIGKILL" || runError.code === "ETIMEDOUT") {
                                const tleErr = new Error("Time Limit Exceeded");
                                tleErr.code = "TLE";
                                return reject(tleErr);
                            }
                            if (runError.message && runError.message.includes("maxBuffer")) {
                                const mleErr = new Error("Memory Limit Exceeded");
                                mleErr.code = "MLE";
                                return reject(mleErr);
                            }
                            return reject(new Error(runStderr || runError.message));
                        }
                        if (runStderr && runStderr.trim()) {
                            return reject(new Error(runStderr));
                        }
                        resolve(runStdout);
                    }
                );

                if (input) {
                    child.stdin.write(input);
                }
                child.stdin.end();
            });
        });
    }
}

module.exports = new CppRunner();
