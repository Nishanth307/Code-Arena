const CompilerFactoryProvider = require("./compiler/CompileFactory/compileFactoryProvide");
const generateFile = require("./compiler/generateFile");
const cleanupFile = require("./compiler/cleanupFile");
const Submission = require("../model/submission");
const Problem = require("../model/problem");

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

        const testCases = problem.testCases || [];
        let verdict = "ACCEPTED";

        if (testCases.length === 0) {
            // Fallback default run if no test cases are registered
            await factory.execute(filePath, "");
            verdict = "ACCEPTED";
        } else {
            for (let i = 0; i < testCases.length; i++) {
                const tc = testCases[i];
                try {
                    const output = await factory.execute(filePath, tc.input || "");
                    const cleanOutput = (output || "").trim().replace(/\r\n/g, "\n");
                    const cleanExpected = (tc.expectedOutput || "").trim().replace(/\r\n/g, "\n");

                    if (cleanOutput !== cleanExpected) {
                        verdict = "WRONG_ANSWER";
                        console.log(`Submission ${submissionId} failed test case ${i + 1}. Expected: [${cleanExpected}], Got: [${cleanOutput}]`);
                        break;
                    }
                } catch (runErr) {
                    console.error(`Runtime error on test case ${i + 1}:`, runErr);
                    verdict = "RUNTIME_ERROR";
                    break;
                }
            }
        }

        await Submission.findByIdAndUpdate(submissionId, {
            verdict: verdict,
            updatedAt: new Date()
        });
        console.log(`Updated submission ${submissionId} verdict to ${verdict}`);
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
