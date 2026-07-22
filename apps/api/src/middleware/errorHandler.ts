import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "@/utils/AppError";
import { logger } from "@/config/logger";
import { env } from "@/config/env";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: "Validation error",
      errors: err.flatten().fieldErrors,
    });
  }

  if (err instanceof AppError) {
    if (!err.isOperational) logger.error({ err }, "Non-operational AppError");
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { errors: err.details } : {}),
    });
  }

  logger.error({ err }, "Unhandled error");

  return res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server",
    ...(env.NODE_ENV !== "production" && err instanceof Error
      ? { stack: err.stack, error: err.message }
      : {}),
  });
}
