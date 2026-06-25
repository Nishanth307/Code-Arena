const { connectConsumer } = require("../services/kafka/consumer");
const CompilerFactoryProvider = require("../services/compiler/CompileFactory/compileFactoryProvide");
const generateFile = require("../services/compiler/generateFile");
const cleanupFile = require("../services/compiler/cleanupFile");
const DBConnection = require("../config/db");
const Submission = require("../model/submission");
const Problem = require("../model/problem");

(async () => {
  try {
    // Connect to database
    await DBConnection();
    console.log("Database connected for Compile Worker");

    // Connect to Kafka consumer
    const consumer = await connectConsumer();
    console.log("Compile worker Kafka Consumer connected");

    await consumer.run({
      eachMessage: async ({ message }) => {
        let filePath;
        let submissionId;
        try {
          const payload = JSON.parse(message.value.toString());
          const { language, code } = payload;
          submissionId = payload.submissionId;

          console.log(`Processing submission ID: ${submissionId}`);

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

          if (submissionId) {
            await Submission.findByIdAndUpdate(submissionId, {
              verdict: verdict,
              updatedAt: new Date()
            });
            console.log(`Updated submission ${submissionId} verdict to ${verdict}`);
          }
        } catch (error) {
          console.error(`Error processing submission ${submissionId}:`, error);
          if (submissionId) {
            try {
              await Submission.findByIdAndUpdate(submissionId, {
                verdict: "COMPILATION_ERROR",
                updatedAt: new Date()
              });
              console.log(`Updated submission ${submissionId} verdict to COMPILATION_ERROR`);
            } catch (dbErr) {
              console.error("Failed to update submission error verdict in DB:", dbErr);
            }
          }
        } finally {
          if (filePath) {
            await cleanupFile(filePath);
          }
        }
      },
    });
  } catch (error) {
    console.error("Compile worker failed to start:", error);
    process.exit(1);
  }
})();

