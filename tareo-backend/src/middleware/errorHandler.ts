import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

interface ErrorWithStatus extends Error {
  status?: number;
  code?: string | number;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, { message: string }>;
}

export const errorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = err.status || 500;
  let message = err.message || "Internal Server Error";

  // MongoDB duplicate key error
  if (err.code === 11000) {
    statusCode = 400;

    const field = err.keyValue ? Object.keys(err.keyValue)[0] : "field";
    message = `${field} already exists`;
  }

  // Mongoose validation error
  if (err.name === "ValidationError" && err.errors) {
    statusCode = 400;

    const errors = Object.values(err.errors).map(
      (e) => e.message,
    );

    message = errors.join(", ");
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Multer errors
  if (err.name === "MulterError") {
    statusCode = 400;

    const code = err.code;

    if (code === "LIMIT_FILE_SIZE") {
      message = "File too large. Max size is 5MB";
    } else {
      message = err.message;
    }
  }

  // Log error
  logger.error(
    `${statusCode} - ${message} - ${req.method} ${req.url} - ${req.ip}`,
  );

  // Response
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};