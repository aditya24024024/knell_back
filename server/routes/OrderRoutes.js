import { Router } from "express";
import { verifyToken,verifyAdmin } from "../middlewares/AuthMiddleware.js";
import { confirmOrder, createOrder, getBuyerOrders, getSellerOrders,decline,complete,getSellerRequests,all_orders,delete_orders } from "../controllers/OrderControllers.js";

export const orderRoutes = Router();

orderRoutes.post("/create", verifyToken, createOrder);
orderRoutes.put("/success", verifyToken, confirmOrder);
orderRoutes.get("/get-buyer-orders", verifyToken, getBuyerOrders);
orderRoutes.get("/get-seller-orders", verifyToken, getSellerOrders);
orderRoutes.get("/get-seller-requests", verifyToken, getSellerRequests);
orderRoutes.get("/decline-order", verifyToken, decline);
orderRoutes.get("/all-orders", verifyAdmin, all_orders);
orderRoutes.get("/delete-orders", verifyAdmin, delete_orders);
orderRoutes.put("/complete", verifyToken, complete);
