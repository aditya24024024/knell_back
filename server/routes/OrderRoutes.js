import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { confirmOrder, createOrder, getBuyerOrders, getSellerOrders,decline,complete,getSellerRequests } from "../controllers/OrderControllers.js";

export const orderRoutes = Router();

orderRoutes.post("/create", verifyToken, createOrder);
orderRoutes.put("/success", verifyToken, confirmOrder);
orderRoutes.get("/get-buyer-orders", verifyToken, getBuyerOrders);
orderRoutes.get("/get-seller-orders", verifyToken, getSellerOrders);
orderRoutes.get("/get-seller-requests", verifyToken, getSellerRequests);
orderRoutes.get("/decline-order", verifyToken, decline);
orderRoutes.put("/complete", verifyToken, complete);
