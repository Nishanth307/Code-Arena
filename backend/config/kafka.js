const { Kafka } = require("kafkajs");
const settings = require("./settings");

const kafka = new Kafka({
  clientId: "online-judge",
  brokers: [settings.KAFKA_BROKER || "localhost:9092"],
});

module.exports = kafka;