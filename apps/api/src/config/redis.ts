import IORedis from "ioredis";
import { env } from "./env";

// BullMQ requires maxRetriesPerRequest to be null on the connection it manages.
export const redisConnection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const cacheRedis = new IORedis(env.REDIS_URL);
