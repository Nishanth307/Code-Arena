const {connectConsumer} = require("../services/kafka/consumer");
const CompilerFactoryProvider = require("../services/compiler/CompileFactory/compileFactoryProvide");


// const processSubmission = async () => {
//     try {
//         await connectConsumer();

//         console.log("Compile worker started...");

//     } catch (error){
//         console.error("Kafka consumer connection error",error);
//         process.exit(1);
//     }
// }

// processSubmission();

await consumer.run({
    eachMessage: async ({ message }) => {

        try {

            const payload = JSON.parse(
                message.value.toString()
            );

            const {
                language,
                code,
                input
            } = payload;

            const filePath = await generateFile(
                language,
                code
            );

            const factory =
                CompilerFactoryProvider.getFactory(
                    language
                );

            const runner =
                factory.createRunner();

            const output =
                await runner.execute(
                    filePath,
                    input
                );

            console.log("Output:", output);

            await cleanupFile(filePath);

        } catch (error) {

            console.error(error);
        }
    }
});
