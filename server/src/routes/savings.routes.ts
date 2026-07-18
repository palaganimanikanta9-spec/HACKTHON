import { Router } from "express";
import { SavingsController } from "@/controllers/savings.controller";
import { authMiddleware } from "@/middleware/auth";
import { validateBody } from "@/middleware/validation";
import { depositSchema, withdrawSchema } from "@/utils/validation-schemas";

const router = Router();

// Protect all flexible savings routes
router.use(authMiddleware);

router.get("/", SavingsController.getSavings);
router.post("/deposit", validateBody(depositSchema), SavingsController.deposit);
router.post("/withdraw", validateBody(withdrawSchema), SavingsController.withdraw);

export default router;
