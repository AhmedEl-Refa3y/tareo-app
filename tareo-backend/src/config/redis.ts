import Redis from "ioredis";
import { logger } from "../utils/logger";

let redisClient: Redis | null = null;

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        logger.warn(`Redis retry attempt ${times}, delay: ${delay}ms`);
        return delay;
      },
      reconnectOnError: (err) => {
        logger.error("Redis reconnect on error:", err);
        return true;
      },
    });

    redisClient.on("connect", () => {
      logger.info("🔴 Redis connected");
    });

    redisClient.on("error", (error) => {
      logger.error("Redis error:", error);
    });
  }
  return redisClient;
};

export const closeRedisConnection = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info("Redis connection closed");
  }
};
