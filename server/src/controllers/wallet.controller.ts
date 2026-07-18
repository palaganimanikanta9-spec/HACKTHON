import { Response, NextFunction } from "express";
import { AuthRequest } from "@/middleware/auth";
import { WalletService } from "@/services/wallet.service";

export class WalletController {
  public static async getWallet(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const wallet = await WalletService.getWallet(userId);
      res.status(200).json({
        status: "success",
        data: { wallet },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deposit(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const { amount, description } = req.body;
      const wallet = await WalletService.deposit(userId, amount, description);
      res.status(200).json({
        status: "success",
        data: { wallet },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async withdraw(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const { amount, description } = req.body;
      const wallet = await WalletService.withdraw(userId, amount, description);
      res.status(200).json({
        status: "success",
        data: { wallet },
      });
    } catch (error) {
      next(error);
    }
  }
}
