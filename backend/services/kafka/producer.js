const kafka = require("../../config/kafka");

const producer = kafka.producer();

const connectProducer = async () => {
    try {
        await producer.connect();
        console.log("Kafka Producer Connected successfully");
    } catch (error) {
        console.error("Kafka producer connection error:", error);
        throw error;
    }
}

const sendSubmissionJob = async (payload) => {
    try {
        await producer.send({
            topic: "submission-jobs",
            messages: [
                {
                    value: JSON.stringify(payload),
                },
            ],
        });
        console.log(`Successfully enqueued job to topic 'submission-jobs'`);
    } catch (error) {
        console.error("Failed to enqueue job to Kafka:", error);
        throw error;
    }
}

module.exports = { producer, connectProducer, sendSubmissionJob };