import { Response, NextFunction } from "express";
import { AuthRequest } from "@/middleware/auth";
import { NotificationService } from "@/services/notification.service";

export class NotificationController {
  public static async getNotifications(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const notifications = await NotificationService.getNotifications(userId);
      res.status(200).json({
        status: "success",
        data: { notifications },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      await NotificationService.markAllAsRead(userId);
      res.status(200).json({
        status: "success",
        message: "All notifications marked as read",
      });
    } catch (error) {
      next(error);
    }
  }

  public static async clearAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      await NotificationService.clearAll(userId);
      res.status(200).json({
        status: "success",
        message: "All notifications cleared",
      });
    } catch (error) {
      next(error);
    }
  }
}
