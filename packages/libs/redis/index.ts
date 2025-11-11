import Redis from "ioredis";
// import { DefaultSerializer } from "v8";

const redis = new Redis(process.env.REDIS_DATABASE_URI!);

export default redis;
