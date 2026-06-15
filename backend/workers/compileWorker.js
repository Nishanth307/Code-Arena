const { connectConsumer } = require("../services/kafka/consumer");
const CompilerFactoryProvider = require("../services/compiler/CompileFactory/compileFactoryProvide");
const generateFile = require("../services/compiler/generateFile");
const cleanupFile = require("../services/compiler/cleanupFile");
const DBConnection = require("../config/db");
const Submission = require("../model/submission");

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
          const { language, code, input } = payload;
          submissionId = payload.submissionId;

          console.log(`Processing submission ID: ${submissionId}`);

          filePath = await generateFile(language, code);
          const factory = CompilerFactoryProvider.getFactory(language);
          const output = await factory.execute(filePath, input);

          console.log(`Execution Output for ${submissionId}:`, output);

          if (submissionId) {
            await Submission.findByIdAndUpdate(submissionId, {
              verdict: "ACCEPTED",
              updatedAt: new Date()
            });
            console.log(`Updated submission ${submissionId} verdict to ACCEPTED`);
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

