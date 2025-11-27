import express from "express";
import { createOrder, updateOrderStatus,getUserOrders,getOrderById,getOrderDetails } from "../controllers/orders/ordersController.js";
import { protect } from "../middleware/authMiddleware.js";

const orderRoute = express.Router();

// POST /api/orders -> create a booking
orderRoute.post("/", protect, createOrder);

// PUT /api/orders/:orderId/status -> update order status
orderRoute.put("/:orderId/status", protect, updateOrderStatus);


// GET /api/orders -> Get all orders for logged-in user
orderRoute.get("/", protect, getUserOrders);

// ✅ Get detailed order info
orderRoute.get("/:id/details", protect, getOrderDetails);
// GET /api/orders/:id -> Get order by ID
orderRoute.get("/:id", protect, getOrderById);
export default orderRoute;
