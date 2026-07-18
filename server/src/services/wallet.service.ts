import { prisma } from "@/prisma/client";
import { ValidationError, NotFoundError } from "@/utils/errors";
import { logger } from "@/config/logger";

export class WalletService {
  // Get wallet details
  public static async getWallet(userId: string) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });
    if (!wallet) throw new NotFoundError("Wallet not found");
    return wallet;
  }

  // Deposit funds to Main Wallet via Wallet MCP
  public static async deposit(userId: string, amount: number, description = "Added funds") {
    try {
      logger.info(`Depositing with custom message description: ${description}`);
      const response = await fetch("http://localhost:5003/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          amount,
          from: "EXTERNAL",
          to: "MAIN_WALLET",
          transactionType: "DEPOSIT",
        }),
      });

      if (!response.ok) {
        const errJson = await response.json() as any;
        throw new ValidationError(errJson.detail || "Wallet MCP deposit failed");
      }

      return prisma.wallet.findUnique({ where: { userId } });
    } catch (error) {
      logger.error(error, "Failed to deposit into main wallet via Wallet MCP");
      throw error;
    }
  }

  // Withdraw funds from Main Wallet via Wallet MCP
  public static async withdraw(userId: string, amount: number, description = "Sent funds") {
    try {
      logger.info(`Withdrawing with custom message description: ${description}`);
      const response = await fetch("http://localhost:5003/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          amount,
          from: "MAIN_WALLET",
          to: "EXTERNAL",
          transactionType: "WITHDRAWAL",
        }),
      });

      if (!response.ok) {
        const errJson = await response.json() as any;
        throw new ValidationError(errJson.detail || "Wallet MCP withdrawal failed");
      }

      return prisma.wallet.findUnique({ where: { userId } });
    } catch (error) {
      logger.error(error, "Failed to withdraw from main wallet via Wallet MCP");
      throw error;
    }
  }
}
