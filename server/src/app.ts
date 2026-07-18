import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./config/swagger.json";

// Load environment variables
dotenv.config();

import routes from "@/routes";
import { errorMiddleware } from "@/middleware/error";
import { prisma } from "@/prisma/client";
import { logger } from "@/config/logger";

const app: Express = express();

// ── Global Security Middlewares ───────────────────────────────────

// Secure headers with Helmet
app.use(helmet());

// CORS configuration supporting both headers and credentials
app.use(
  cors({
    origin: "*", // allow all origins during development testing
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// General request rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many requests from this IP, please try again after 15 minutes."
  }
});
app.use("/api/", limiter);

// Body Parsers with secure payload limits
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Performance Response Timing Logger Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();
  res.on("finish", () => {
    const diff = process.hrtime(start);
    const timeInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    logger.info(`[API Request Log] ${req.method} ${req.originalUrl} - status: ${res.statusCode} - duration: ${timeInMs}ms`);
  });
  next();
});

// Serve uploaded documents statically
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Mount Swagger Documentation endpoint
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ── Comprehensive System Health Check ─────────────────────────────
app.get("/health", async (_req: Request, res: Response) => {
  let dbStatus = "DOWN";
  let ocrStatus = "DOWN";
  let aiStatus = "DOWN";
  let walletStatus = "DOWN";

  // 1. Check Database connection
  try {
    await prisma.$queryRaw`SELECT 1;`;
    dbStatus = "UP";
  } catch (dbErr) {
    logger.error(dbErr, "Database health check failed");
  }

  // 2. Check OCR Server health check
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);
    const ocrRes = await fetch("http://localhost:5001/health", { signal: controller.signal });
    clearTimeout(timeoutId);
    if (ocrRes.ok) ocrStatus = "UP";
  } catch (err) {
    // OCR server is likely down or in sandbox mode
  }

  // 3. Check AI Server health check
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);
    const aiRes = await fetch("http://localhost:5002/health", { signal: controller.signal });
    clearTimeout(timeoutId);
    if (aiRes.ok) aiStatus = "UP";
  } catch (err) {
    // AI server is likely down or in sandbox mode
  }

  // 4. Check Wallet Server health check
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);
    const walletRes = await fetch("http://localhost:5003/health", { signal: controller.signal });
    clearTimeout(timeoutId);
    if (walletRes.ok) walletStatus = "UP";
  } catch (err) {
    // Wallet server is likely down or in sandbox mode
  }

  const overallStatus = (dbStatus === "UP" && walletStatus === "UP") ? "UP" : "DEGRADED";

  res.status(200).json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      ocrServer: ocrStatus,
      aiServer: aiStatus,
      walletServer: walletStatus
    }
  });
});

// ── API Routes ────────────────────────────────────────────────────
app.use("/api/v1", routes);

// ── Error Handling Middleware ─────────────────────────────────────
app.use(errorMiddleware);

export default app;
