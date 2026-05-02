import rateLimit from "express-rate-limit";
import { getRedisClient } from "../config/redis";
import RedisStore from "rate-limit-redis";


// General API limiter
export const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || "15") * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX || "100"),
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth limiter (login attempts)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "Too many login attempts, please try again after 15 minutes.",
  },
});

// Registration limiter
export const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message:
      "Too many registration attempts, please try again after 15 minutes.",
  },
});

// Email requests limiter
export const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: "Too many email requests, please try again later.",
  },
});

// Session creation limiter
export const sessionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many sessions created, please try again later.",
  },
});
