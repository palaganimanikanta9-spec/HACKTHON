import { prisma } from "@/prisma/client";

export class TransactionService {
  // Retrieve filtered transaction history for a user
  public static async getTransactions(
    userId: string,
    filters?: {
      walletType?: "MAIN" | "SAVINGS" | "STRICT";
      type?: string;
      limit?: number;
    }
  ) {
    const { walletType, type, limit } = filters ?? {};

    return prisma.transaction.findMany({
      where: {
        userId,
        ...(walletType ? { walletType } : {}),
        ...(type ? { type } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      ...(limit ? { take: limit } : {}),
    });
  }
}
