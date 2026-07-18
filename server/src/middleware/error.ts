import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "@/utils/errors";
import { logger } from "@/config/logger";

// Global error handler middleware
export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Handle Zod Schema Errors
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    err.errors.forEach((issue) => {
      const field = issue.path.join(".");
      if (!errors[field]) {
        errors[field] = [];
      }
      errors[field].push(issue.message);
    });

    res.status(400).json({
      status: "fail",
      message: "Validation failed",
      errors,
    });
    return;
  }

  // Handle Custom API Errors
  if (err instanceof AppError) {
    logger.warn({ message: err.message, status: err.statusCode });
    res.status(err.statusCode).json({
      status: err.statusCode >= 500 ? "error" : "fail",
      message: err.message,
      ...(err.statusCode === 400 && "errors" in err ? { errors: (err as any).errors } : {}),
    });
    return;
  }

  // Handle Unexpected/Unhandled Server Errors
  logger.error({ err }, "Unhandled application error");
  res.status(500).json({
    status: "error",
    message: "Internal server error. Please try again later.",
  });
};
