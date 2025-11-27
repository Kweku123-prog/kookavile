import express from "express";
import {
  createTransaction,
  getUserTransactions,
} from "../controllers/transactions/transactionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createTransaction); // POST /api/transactions
router.get("/", protect, getUserTransactions); // GET /api/transactions (user-specific)

export default router;
