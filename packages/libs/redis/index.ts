import Redis from "ioredis";
import { DefaultSerializer } from "v8";

const redis = new Redis({
  host: process.env.REDIS_HOST || "121.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
});

export default redis;
