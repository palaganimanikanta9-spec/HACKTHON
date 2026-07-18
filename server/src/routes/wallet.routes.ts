import { Router } from "express";
import { WalletController } from "@/controllers/wallet.controller";
import { authMiddleware } from "@/middleware/auth";
import { validateBody } from "@/middleware/validation";
import { depositSchema, withdrawSchema } from "@/utils/validation-schemas";

const router = Router();

// Protect all wallet API routes
router.use(authMiddleware);

router.get("/", WalletController.getWallet);
router.post("/deposit", validateBody(depositSchema), WalletController.deposit);
router.post("/withdraw", validateBody(withdrawSchema), WalletController.withdraw);

export default router;
