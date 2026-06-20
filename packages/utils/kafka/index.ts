import { Kafka, KafkaConfig } from "kafkajs";

const getEnv = (key: string): string | undefined => {
  const value = process.env[key];
  if (value !== undefined) return value.trim();

  for (const envKey of Object.keys(process.env)) {
    if (envKey.trim() === key) {
      return process.env[envKey]?.trim();
    }
  }
  return undefined;
};

const broker = getEnv("KAFKA_BROKER") || getEnv("KAFKA_BROKERS") || "localhost:9092";
const apiKey = getEnv("KAFKA_API_KEY");
const apiSecret = getEnv("KAFKA_API_SECRET");

const kafkaConfig: KafkaConfig = {
  clientId: "kafka-service",
  brokers: [broker],
};

if (apiKey && apiSecret) {
  kafkaConfig.ssl = {
    rejectUnauthorized: false,
  };
  kafkaConfig.sasl = {
    mechanism: "plain",
    username: apiKey,
    password: apiSecret,
  };
}

export const kafka = new Kafka(kafkaConfig);