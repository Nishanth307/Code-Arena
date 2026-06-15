const kafka = require("../../config/kafka");
const consumer = kafka.consumer({
    groupId: "judge-consumer",
});

const connectConsumer = async () => {
    await consumer.connect();

    await consumer.subscribe({
        topic: "submission-jobs",
        fromBeginning: true
    });

    return consumer;
}

module.exports = {
    connectConsumer
}