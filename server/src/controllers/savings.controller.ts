import { Response, NextFunction } from "express";
import { AuthRequest } from "@/middleware/auth";
import { SavingsService } from "@/services/savings.service";

export class SavingsController {
  public static async getSavings(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const account = await SavingsService.getSavingsAccount(userId);
      res.status(200).json({
        status: "success",
        data: { account },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deposit(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const { amount } = req.body;
      const account = await SavingsService.deposit(userId, amount);
      res.status(200).json({
        status: "success",
        data: { account },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async withdraw(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const { amount } = req.body;
      const account = await SavingsService.withdraw(userId, amount);
      res.status(200).json({
        status: "success",
        data: { account },
      });
    } catch (error) {
      next(error);
    }
  }
}
