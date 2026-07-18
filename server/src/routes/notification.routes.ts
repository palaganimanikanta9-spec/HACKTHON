import { Router } from "express";
import { NotificationController } from "@/controllers/notification.controller";
import { authMiddleware } from "@/middleware/auth";

const router = Router();

// Protect all notification routes
router.use(authMiddleware);

router.get("/", NotificationController.getNotifications);
router.post("/read-all", NotificationController.markAllAsRead);
router.delete("/clear-all", NotificationController.clearAll);

export default router;
