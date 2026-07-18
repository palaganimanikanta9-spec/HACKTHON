import { Router } from "express";
import { StrictSavingsController } from "@/controllers/strictSavings.controller";
import { authMiddleware } from "@/middleware/auth";
import { uploadMiddleware } from "@/middleware/upload";
import { validateBody } from "@/middleware/validation";
import { depositSchema, withdrawSchema, thresholdSchema } from "@/utils/validation-schemas";

const router = Router();

// Protect all strict savings routes
router.use(authMiddleware);

router.get("/", StrictSavingsController.getStrict);
router.post("/deposit", validateBody(depositSchema), StrictSavingsController.deposit);
router.post("/withdraw", validateBody(withdrawSchema), StrictSavingsController.withdraw);

// Proof document upload route (Multer single file upload)
router.post("/upload", uploadMiddleware.single("document"), StrictSavingsController.uploadProof);

// AI decision resolution mock route
router.post("/decide", StrictSavingsController.decideRequest);

// Update threshold config route
router.post("/threshold", validateBody(thresholdSchema), StrictSavingsController.updateThreshold);

export default router;
