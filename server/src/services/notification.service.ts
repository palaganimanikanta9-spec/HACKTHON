import { prisma } from "@/prisma/client";

export class NotificationService {
  // Retrieve alerts list for the user
  public static async getNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  // Mark all notifications as read
  public static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  // Clear all notifications
  public static async clearAll(userId: string) {
    return prisma.notification.deleteMany({
      where: { userId },
    });
  }
}
