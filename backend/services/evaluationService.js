const CompilerFactoryProvider = require("./compiler/CompileFactory/compileFactoryProvide");
const generateFile = require("./compiler/generateFile");
const cleanupFile = require("./compiler/cleanupFile");
const Submission = require("../model/submission");
const Problem = require("../model/problem");
const TestCase = require("../model/testCase");
const ContestSubmission = require("../model/contestSubmission");
const storage = require("./storage");

const mapRunError = (runErr) => {
    const msg = (runErr.message || String(runErr)).toLowerCase();
    if (runErr.code === "TLE") return "TIME_LIMIT_EXCEEDED";
    if (runErr.code === "MLE") return "MEMORY_LIMIT_EXCEEDED";
    if (runErr.code === "CE") return "COMPILATION_ERROR";
    if (msg.includes("syntaxerror") || msg.includes("indentationerror") ||
        msg.includes("compilation failed")) {
        return "COMPILATION_ERROR";
    }
    return "RUNTIME_ERROR";
};

const evaluateSubmission = async (submissionId, language, code) => {
    let filePath;
    try {
        const submission = await Submission.findById(submissionId);
        if (!submission) {
            console.error(`Submission not found: ${submissionId}`);
            return;
        }

        const problem = await Problem.findById(submission.problemId);
        if (!problem) {
            console.error(`Problem not found for submission: ${submission.problemId}`);
            return;
        }

        const execOptions = {
            timeout: problem.timeLimitMillis || 2000,
            maxBuffer: (problem.memoryLimitMBs || 256) * 1024 * 1024
        };

        filePath = await generateFile(language, code);
        const factory = CompilerFactoryProvider.getFactory(language);

        const testCases = await TestCase.find({ problemId: problem._id });
        let verdict = "ACCEPTED";
        const testCaseResults = [];
        let totalExecutionTime = 0;
        let maxMemoryUsed = 0;

        if (testCases.length === 0) {
            try {
                const start = Date.now();
                await factory.execute(filePath, "", execOptions);
                totalExecutionTime = Date.now() - start;
            } catch (runErr) {
                verdict = mapRunError(runErr);
            }
        } else {
            for (let i = 0; i < testCases.length; i++) {
                const tc = testCases[i];
                let tcStatus = "ACCEPTED";
                let tcOutput = "";
                let tcError = "";
                let tcExecutionTime = 0;

                try {
                    const inputContent = await storage.getObject(tc.inputPath);
                    const expectedOutput = await storage.getObject(tc.outputPath);

                    const start = Date.now();
                    const output = await factory.execute(filePath, inputContent || "", execOptions);
                    tcExecutionTime = Date.now() - start;
                    totalExecutionTime += tcExecutionTime;

                    tcOutput = output || "";
                    const outputBytes = Buffer.byteLength(tcOutput, "utf8");
                    maxMemoryUsed = Math.max(maxMemoryUsed, outputBytes);

                    const cleanOutput = tcOutput.trim().replace(/\r\n/g, "\n");
                    const cleanExpected = expectedOutput.trim().replace(/\r\n/g, "\n");

                    if (cleanOutput !== cleanExpected) {
                        tcStatus = "WRONG_ANSWER";
                        if (verdict === "ACCEPTED") {
                            verdict = "WRONG_ANSWER";
                        }
                    }
                } catch (runErr) {
                    tcStatus = mapRunError(runErr);
                    tcError = runErr.message || String(runErr);

                    if (verdict === "ACCEPTED" || verdict === "WRONG_ANSWER") {
                        verdict = tcStatus;
                    }
                }

                testCaseResults.push({
                    testCaseId: tc._id,
                    inputPath: tc.inputPath,
                    expectedOutputPath: tc.outputPath,
                    userOutput: tcOutput,
                    status: tcStatus,
                    executionTime: tcExecutionTime,
                    error: tcError
                });

                if (verdict !== "ACCEPTED" && verdict !== "WRONG_ANSWER") {
                    break;
                }
            }
        }

        const logPath = `logs/${submissionId}/evaluation.log`;
        const logContent = testCaseResults.map((r, i) =>
            `Test ${i + 1}: ${r.status}${r.error ? ` — ${r.error}` : ""}`
        ).join("\n");
        await storage.putObject(logPath, Buffer.from(logContent));

        await Submission.findByIdAndUpdate(submissionId, {
            verdict,
            executionTime: totalExecutionTime,
            memoryUsed: maxMemoryUsed,
            logMinIOPath: logPath,
            testCaseResults,
            updatedAt: new Date()
        });

        if (submission.contestId) {
            const DIFFICULTY_POINTS = { EASY: 10, MEDIUM: 30, HARD: 50 };
            const score = verdict === "ACCEPTED" ? (DIFFICULTY_POINTS[problem.difficulty] || 10) : 0;
            await ContestSubmission.findOneAndUpdate(
                { submissionId: submission._id },
                { score, verdict }
            );
        }
    } catch (error) {
        console.error(`Error processing submission ${submissionId}:`, error);
        try {
            await Submission.findByIdAndUpdate(submissionId, {
                verdict: "COMPILATION_ERROR",
                updatedAt: new Date()
            });
            await ContestSubmission.findOneAndUpdate(
                { submissionId },
                { score: 0, verdict: "COMPILATION_ERROR" }
            );
        } catch (dbErr) {
            console.error("Failed to update submission error verdict in DB:", dbErr);
        }
    } finally {
        if (filePath) {
            await cleanupFile(filePath);
        }
    }
};

module.exports = { evaluateSubmission };
