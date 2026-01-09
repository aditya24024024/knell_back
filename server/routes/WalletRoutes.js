import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import {
  getSellerWallet,
  addBankDetails,
  withdrawAmount,
} from "../controllers/WalletController.js";

export const walletRoutes = Router();

// GET seller wallet (auto-create if not exists)
walletRoutes.get("/seller/wallet", verifyToken, getSellerWallet);

// ADD / UPDATE bank details
walletRoutes.post("/seller/wallet/bank", verifyToken, addBankDetails);

// WITHDRAW money
walletRoutes.post("/seller/wallet/withdraw", verifyToken, withdrawAmount);
