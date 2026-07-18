import { PrismaClient } from "@prisma/client";

// Centralized PrismaClient instance
export const prisma = new PrismaClient({
  log: ["error", "warn"],
});

export default prisma;
