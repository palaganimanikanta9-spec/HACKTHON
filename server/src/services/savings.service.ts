import { prisma } from "@/prisma/client";
import { ValidationError, NotFoundError } from "@/utils/errors";
import { logger } from "@/config/logger";

export class SavingsService {
  public static async getSavingsAccount(userId: string) {
    const account = await prisma.normalSavings.findUnique({
      where: { userId },
    });
    if (!account) throw new NotFoundError("Savings account not found");
    return account;
  }

  // Transfer from Main Wallet to Normal Savings via Wallet MCP
  public static async deposit(userId: string, amount: number) {
    try {
      const response = await fetch("http://localhost:5003/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          amount,
          from: "MAIN_WALLET",
          to: "NORMAL_SAVINGS",
          transactionType: "TRANSFER",
        }),
      });

      if (!response.ok) {
        const errJson = await response.json() as any;
        throw new ValidationError(errJson.detail || "Wallet MCP savings deposit failed");
      }

      return prisma.normalSavings.findUnique({ where: { userId } });
    } catch (error) {
      logger.error(error, "Failed to deposit into normal savings via Wallet MCP");
      throw error;
    }
  }

  // Transfer from Normal Savings back to Main Wallet via Wallet MCP
  public static async withdraw(userId: string, amount: number) {
    try {
      const response = await fetch("http://localhost:5003/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          amount,
          from: "NORMAL_SAVINGS",
          to: "MAIN_WALLET",
          transactionType: "TRANSFER",
        }),
      });

      if (!response.ok) {
        const errJson = await response.json() as any;
        throw new ValidationError(errJson.detail || "Wallet MCP savings withdrawal failed");
      }

      return prisma.normalSavings.findUnique({ where: { userId } });
    } catch (error) {
      logger.error(error, "Failed to withdraw from normal savings via Wallet MCP");
      throw error;
    }
  }
}
