import express, { Router } from "express";
import { getAllOrders, getOrderById } from "../controllers/order.controller";
import { getAllPayments, getPaymentById } from "../controllers/payment.controller";
import { 
  getAllUsers, getUserById, 
  getAllProducts, getProductById, 
  getAllSellers, getSellerById 
} from "../controllers/admin.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";

const router: Router = express.Router();

// Order routes
router.get("/orders", isAuthenticated, getAllOrders);
router.get("/orders/:id", isAuthenticated, getOrderById);

// Payment routes
router.get("/payments", isAuthenticated, getAllPayments);
router.get("/payments/:id", isAuthenticated, getPaymentById);

// User routes
router.get("/users", isAuthenticated, getAllUsers);
router.get("/users/:id", isAuthenticated, getUserById);

// Product routes
router.get("/products", isAuthenticated, getAllProducts);
router.get("/products/:id", isAuthenticated, getProductById);

// Seller routes
router.get("/sellers", isAuthenticated, getAllSellers);
router.get("/sellers/:id", isAuthenticated, getSellerById);

export default router;