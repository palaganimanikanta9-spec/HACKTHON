import app from "./app";
import { logger } from "./config/logger";
import { prisma } from "./prisma/client";

const PORT = process.env.PORT || 5000;

// Start Express server
const server = app.listen(PORT, async () => {
  logger.info(`🚀 SmartSave Wallet Engine listening on http://localhost:${PORT}`);

  try {
    // Verify database connection check
    await prisma.$connect();
    logger.info("📡 Database connected successfully.");
  } catch (error) {
    logger.error(error, "🛑 Failed to connect to PostgreSQL database during startup:");
  }
});

// Graceful shutdown handling
const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  
  server.close(async () => {
    logger.info("Express server closed.");
    await prisma.$disconnect();
    logger.info("Database client disconnected.");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
