import { Router } from "express";
import userRoutes from "./user.routes";
import walletRoutes from "./wallet.routes";
import savingsRoutes from "./savings.routes";
import strictSavingsRoutes from "./strict-savings.routes"; // Wait! We named it strictSavings.routes.ts? Let's check.
import transactionRoutes from "./transaction.routes";
import notificationRoutes from "./notification.routes";

const router = Router();

// Mount routes with namespace prefixes
router.use("/users", userRoutes);
router.use("/wallet", walletRoutes);
router.use("/savings", savingsRoutes);
router.use("/strict-savings", strictSavingsRoutes);
router.use("/transactions", transactionRoutes);
router.use("/notifications", notificationRoutes);

export default router;
