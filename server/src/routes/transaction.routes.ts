import { Router } from "express";
import { TransactionController } from "@/controllers/transaction.controller";
import { authMiddleware } from "@/middleware/auth";

const router = Router();

router.get("/", authMiddleware, TransactionController.getTransactions);

export default router;
