import express from 'express'
import authMiddleware from '../middleware/auth.js'
import { createEsewaOrder, listOrders, updateStatus, userOrders, verifyEsewaPayment } from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/esewa/create", authMiddleware, createEsewaOrder);
orderRouter.post("/esewa/verify", verifyEsewaPayment);
orderRouter.post("/userorders", authMiddleware, userOrders);
orderRouter.get("/list", listOrders);
orderRouter.post("/status", updateStatus);

export default orderRouter;