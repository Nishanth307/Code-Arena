const kafka = require("../../config/kafka");

const producer = kafka.producer();

const connectProducer = async () => {
    await producer.connect();
}

connectProducer().catch((error) => {
    console.error("Kafka producer connection error:", error);
});

module.exports = { producer, connectProducer };