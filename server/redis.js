import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_PUBLIC_URL);

export default redis;
