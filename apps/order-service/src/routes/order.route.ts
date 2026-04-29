import isAuthenticated from '@packages/middleware/isAuthenticated';
import express, { Router } from 'express';
import { createPaymentIntent, createPaymentSession, verifyPaymentSession, createCODOrder, getSellerOrders, getOrderDetails, updateDeliveryStatus } from '../controllers/order.controller';
// import { isSeller } from '@packages/middleware/authorizeRoles';
import { isSeller } from '../../../../packages/middleware/authorizeRoles';

const router:Router = express.Router();

router.post("/create-payment-intent",isAuthenticated,createPaymentIntent);
router.post("/create-payment-session",isAuthenticated,createPaymentSession);
router.get("/verify-payment-session",isAuthenticated,verifyPaymentSession);
router.post("/create-cod-order",isAuthenticated,createCODOrder);

router.get("/get-seller-orders",isAuthenticated,isSeller, getSellerOrders)
router.get("/get-order-details/:id",isAuthenticated,isSeller,getOrderDetails)
router.put("/update-status/:orderID",isAuthenticated,isSeller,updateDeliveryStatus)
export default router;