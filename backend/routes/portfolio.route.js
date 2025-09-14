import express from "express";
import { 
  addTransaction, 
  getPortfolio, 
  getTransactions, 
  updateTransaction, 
  deleteTransaction 
} from "../controllers/portfolio.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Portfolio routes - all protected
router.post("/transaction", protectRoute, addTransaction);
router.get("/", protectRoute, getPortfolio);
router.get("/transactions", protectRoute, getTransactions);
router.put("/transaction/:transactionId", protectRoute, updateTransaction);
router.delete("/transaction/:transactionId", protectRoute, deleteTransaction);

export default router;