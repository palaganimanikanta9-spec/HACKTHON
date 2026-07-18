import { Response, NextFunction } from "express";
import { AuthRequest } from "@/middleware/auth";
import { TransactionService } from "@/services/transaction.service";

export class TransactionController {
  public static async getTransactions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const { walletType, type, limit } = req.query;

      const transactions = await TransactionService.getTransactions(userId, {
        walletType: walletType as any,
        type: type as string,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.status(200).json({
        status: "success",
        data: { transactions },
      });
    } catch (error) {
      next(error);
    }
  }
}
