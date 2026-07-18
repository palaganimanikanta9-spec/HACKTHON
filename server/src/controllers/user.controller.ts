import { Response, NextFunction } from "express";
import { AuthRequest } from "@/middleware/auth";
import { UserService } from "@/services/user.service";

export class UserController {
  public static async syncProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const profile = await UserService.syncUser(userId, req.body);
      res.status(200).json({
        status: "success",
        data: { profile },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const profile = await UserService.getUserProfile(userId);
      res.status(200).json({
        status: "success",
        data: { profile },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateSettings(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const settings = await UserService.updateSettings(userId, req.body);
      res.status(200).json({
        status: "success",
        data: { settings },
      });
    } catch (error) {
      next(error);
    }
  }
}
