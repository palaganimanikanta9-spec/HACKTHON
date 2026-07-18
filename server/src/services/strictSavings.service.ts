import { prisma } from "@/prisma/client";
import { ValidationError, NotFoundError } from "@/utils/errors";
import { logger } from "@/config/logger";

export class StrictSavingsService {
  public static async getStrictAccount(userId: string) {
    const account = await prisma.strictSavings.findUnique({
      where: { userId },
    });
    if (!account) throw new NotFoundError("Strict savings vault not found");
    return account;
  }

  // Deposit funds to Strict Savings
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
          to: "STRICT_SAVINGS",
          transactionType: "TRANSFER",
        }),
      });

      if (!response.ok) {
        const errJson = await response.json() as any;
        throw new ValidationError(errJson.detail || "Wallet MCP deposit transfer failed");
      }

      return prisma.strictSavings.findUnique({ where: { userId } });
    } catch (error) {
      logger.error(error, "Failed to execute deposit via Wallet MCP");
      throw error;
    }
  }

  // Withdraw request flow applying reserve threshold checks and lock period maturity
  public static async initiateWithdrawal(userId: string, amount: number) {
    const strict = await prisma.strictSavings.findUnique({ where: { userId } });
    if (!strict) throw new NotFoundError("Strict Savings account not found");

    if (Number(strict.balance) < amount) {
      throw new ValidationError("Insufficient funds in Strict Savings vault");
    }

    const now = new Date();
    const endDate = new Date(strict.endDate);
    const isMatured = now >= endDate;

    const threshold = Number(strict.withdrawalThreshold);
    const remainingBalance = Number(strict.balance) - amount;

    // ALL withdrawals from Strict Savings require AI document verification — no auto-approval path
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes expiration
    const request = await prisma.verificationRequest.create({
      data: {
        userId,
        amount,
        status: "PENDING_VERIFICATION",
        expiresAt,
      },
    });

    await prisma.notification.create({
      data: {
        userId,
        type: "WARNING",
        title: "AI Verification Required",
        message: `Withdrawal of $${amount.toFixed(2)} from Protected Savings requires document upload for AI verification.`,
      },
    });

    return {
      status: "PENDING_VERIFICATION",
      requestId: request.id,
      amount,
      message: "All Protected Savings withdrawals require AI document verification.",
    };
  }

  // Handle proof upload details integration
  public static async uploadProof(
    requestId: string,
    userId: string,
    file: {
      filename: string;
      size: number;
      mimetype: string;
      path: string;
    }
  ) {
    const request = await prisma.verificationRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundError("Verification request not found");
    if (request.userId !== userId) throw new ValidationError("Unauthorized request match");

    return prisma.verificationRequest.update({
      where: { id: requestId },
      data: {
        status: "VERIFYING",
        documentName: file.filename,
        documentSize: file.size,
        mimeType: file.mimetype,
        documentUrl: file.path,
      },
    });
  }

  // Simulate decision making for verification requests
  public static async decideRequest(
    requestId: string,
    userId: string,
    status: "APPROVED" | "REJECTED",
    reasoning?: string
  ) {
    const request = await prisma.verificationRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundError("Request not found");
    if (request.userId !== userId) throw new ValidationError("Unauthorized request");
    if (request.status !== "VERIFYING" && request.status !== "PENDING_VERIFICATION") {
      throw new ValidationError("Request has already been processed");
    }

    const isApproved = status === "APPROVED";
    const amount = Number(request.amount);

    if (isApproved) {
      // Call Wallet MCP server to execute the balance transfer atomically in the database
      try {
        const response = await fetch("http://localhost:5003/transfer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            amount,
            from: "STRICT_SAVINGS",
            to: "MAIN_WALLET",
            transactionType: "WITHDRAWAL",
          }),
        });

        if (!response.ok) {
          const errJson = await response.json() as any;
          throw new ValidationError(errJson.detail || "Wallet MCP transfer approval failed");
        }

        const result = await response.json() as any;
        if (result && result.transactionId) {
          await prisma.transaction.update({
            where: { id: result.transactionId },
            data: { classification: "ESSENTIAL" },
          });
        }
      } catch (error) {
        logger.error(error, "Failed to execute approved transfer via Wallet MCP");
        throw error;
      }
    } else {
      // If AI rejects: create a transaction log and a notification directly inside the database
      await prisma.$transaction(async (tx) => {
        // Log blocked transaction item
        await tx.transaction.create({
          data: {
            userId,
            type: "WITHDRAWAL",
            direction: "DEBIT",
            amount,
            description: "Strict withdrawal blocked (Non-Essential)",
            status: "FAILED",
            walletType: "STRICT",
            classification: "NON_ESSENTIAL",
          },
        });

        // Notify
        await tx.notification.create({
          data: {
            userId,
            type: "ERROR",
            title: "Strict Transfer Blocked",
            message: `AI blocked withdrawal of $${amount.toFixed(2)}: classified as non-essential.`,
          },
        });
      });
    }

    // Update verification request row
    return prisma.verificationRequest.update({
      where: { id: requestId },
      data: {
        status,
        classification: isApproved ? "ALL_APPROVED" : "NON_ESSENTIAL",
        confidence: 0.95,
        reasoning: reasoning || (isApproved ? "Receipt verified successfully." : "Classified as non-essential expenditure."),
      },
    });
  }

  // Update Strict Savings Threshold
  public static async updateThreshold(userId: string, amount: number) {
    const strict = await prisma.strictSavings.findUnique({ where: { userId } });
    if (!strict) throw new NotFoundError("Strict Savings account not found");

    return prisma.strictSavings.update({
      where: { userId },
      data: {
        withdrawalThreshold: amount,
      },
    });
  }
}
