const { exec } = require("child_process");
const CompilerRunner = require("./compilerInterface");

class JavaScriptRunner extends CompilerRunner {
    async execute(filePath, input = "", options = {}) {
        const timeout = options.timeout || 2000;
        const maxBuffer = options.maxBuffer || 10 * 1024 * 1024;

        return new Promise((resolve, reject) => {
            const child = exec(
                `node ${filePath}`,
                { timeout, maxBuffer, killSignal: "SIGKILL" },
                (error, stdout, stderr) => {
                    if (error) {
                        if (error.killed || error.signal === "SIGKILL" || error.code === "ETIMEDOUT") {
                            const tleErr = new Error("Time Limit Exceeded");
                            tleErr.code = "TLE";
                            return reject(tleErr);
                        }
                        if (error.message && error.message.includes("maxBuffer")) {
                            const mleErr = new Error("Memory Limit Exceeded");
                            mleErr.code = "MLE";
                            return reject(mleErr);
                        }
                        return reject(new Error(stderr || error.message));
                    }
                    if (stderr && stderr.trim()) {
                        return reject(new Error(stderr));
                    }
                    resolve(stdout);
                }
            );
            if (input) {
                child.stdin.write(input);
            }
            child.stdin.end();
        });
    }
}

module.exports = new JavaScriptRunner();