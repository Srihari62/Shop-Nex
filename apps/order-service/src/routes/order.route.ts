import isAuthenticated from '@packages/middleware/isAuthenticated';
import express, { Router } from 'express';
import { createPaymentIntent, createPaymentSession, verifyPaymentSession, createCODOrder } from '../controllers/order.controller';

const router:Router = express.Router();

router.post("/create-payment-intent",isAuthenticated,createPaymentIntent);
router.post("/create-payment-session",isAuthenticated,createPaymentSession);
router.get("/verify-payment-session",isAuthenticated,verifyPaymentSession);
router.post("/create-cod-order",isAuthenticated,createCODOrder);


export default router;