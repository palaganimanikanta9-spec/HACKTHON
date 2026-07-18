import { Router } from "express";
import { UserController } from "@/controllers/user.controller";
import { authMiddleware } from "@/middleware/auth";
import { validateBody } from "@/middleware/validation";
import { syncUserSchema, settingsSchema } from "@/utils/validation-schemas";

const router = Router();

// Sync user profile (typically called by Clerk after sign-in)
router.post("/sync", authMiddleware, validateBody(syncUserSchema), UserController.syncProfile);

// Get user profile details
router.get("/profile", authMiddleware, UserController.getProfile);

// Update user settings
router.put("/settings", authMiddleware, validateBody(settingsSchema), UserController.updateSettings);

export default router;
