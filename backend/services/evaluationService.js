const CompilerFactoryProvider = require("./compiler/CompileFactory/compileFactoryProvide");
const generateFile = require("./compiler/generateFile");
const cleanupFile = require("./compiler/cleanupFile");
const Submission = require("../model/submission");
const Problem = require("../model/problem");
const TestCase = require("../model/testCase");
const storage = require("./storage");

const evaluateSubmission = async (submissionId, language, code) => {
    let filePath;
    try {
        console.log(`Processing submission ID in background: ${submissionId}`);

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

        filePath = await generateFile(language, code);
        const factory = CompilerFactoryProvider.getFactory(language);

        const testCases = await TestCase.find({ problemId: problem._id });
        let verdict = "ACCEPTED";
        const testCaseResults = [];
        let totalExecutionTime = 0;

        if (testCases.length === 0) {
            // Fallback default run if no test cases are registered
            await factory.execute(filePath, "");
            verdict = "ACCEPTED";
        } else {
            for (let i = 0; i < testCases.length; i++) {
                const tc = testCases[i];
                let tcStatus = "ACCEPTED";
                let tcOutput = "";
                let tcError = "";
                let tcExecutionTime = 0;

                try {
                    // Fetch input and expected output from storage adapter
                    const inputContent = await storage.getObject(tc.inputPath);
                    const expectedOutput = await storage.getObject(tc.outputPath);

                    const start = Date.now();
                    const output = await factory.execute(filePath, inputContent || "");
                    tcExecutionTime = Date.now() - start;
                    totalExecutionTime += tcExecutionTime;

                    tcOutput = output || "";

                    const cleanOutput = tcOutput.trim().replace(/\r\n/g, "\n");
                    const cleanExpected = expectedOutput.trim().replace(/\r\n/g, "\n");

                    if (cleanOutput !== cleanExpected) {
                        tcStatus = "WRONG_ANSWER";
                        if (verdict === "ACCEPTED") {
                            verdict = "WRONG_ANSWER";
                        }
                    }
                } catch (runErr) {
                    tcStatus = "RUNTIME_ERROR";
                    if (verdict === "ACCEPTED" || verdict === "WRONG_ANSWER") {
                        verdict = "RUNTIME_ERROR";
                    }
                    tcError = runErr.message || String(runErr);
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
            }
        }

        await Submission.findByIdAndUpdate(submissionId, {
            verdict: verdict,
            executionTime: totalExecutionTime,
            testCaseResults: testCaseResults,
            updatedAt: new Date()
        });
        console.log(`Updated submission ${submissionId} verdict to ${verdict} with ${testCaseResults.length} test case results`);
    } catch (error) {
        console.error(`Error processing submission ${submissionId}:`, error);
        try {
            await Submission.findByIdAndUpdate(submissionId, {
                verdict: "COMPILATION_ERROR",
                updatedAt: new Date()
            });
            console.log(`Updated submission ${submissionId} verdict to COMPILATION_ERROR`);
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
