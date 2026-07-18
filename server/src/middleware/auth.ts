import { Request, Response, NextFunction } from "express";
import { verifyToken } from "@clerk/backend";
import { UnauthorizedError } from "@/utils/errors";
import { logger } from "@/config/logger";

// Extend Express Request interface to support userId
export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authentication token is required");
    }

    const token = authHeader.split(" ")[1];

    // Demo / testing bypass for local development APIs calls
    if (process.env.NODE_ENV !== "production" && (token.startsWith("usr_") || token.startsWith("mock_"))) {
      // Strip "mock_" prefix to get the real Clerk userId (e.g. mock_user_abc -> user_abc)
      req.userId = token.startsWith("mock_") ? token.slice(5) : token;
      return next();
    }

    // Official Clerk JWT token verification
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
      // Tolerate clock skew of up to 6 hours in development to avoid issues with GMT/local system clock mismatch
      clockSkewInMs: process.env.NODE_ENV !== "production" ? 6 * 60 * 60 * 1000 : 5000,
    });
    if (!payload || !payload.sub) {
      throw new UnauthorizedError("Invalid or expired session token");
    }

    req.userId = payload.sub;
    next();
  } catch (error) {
    logger.warn({ error }, "Clerk authentication failed");
    next(new UnauthorizedError(error instanceof Error ? error.message : "Authentication failed"));
  }
};
