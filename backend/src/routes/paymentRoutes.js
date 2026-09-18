import express from "express";
import {
    createOrder,
    verifyPayment,
    requestPaymentVerification,
    getPaymentStatus,
} from "../controllers/paymentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-order", verifyToken, createOrder);
router.post("/verify-payment", verifyToken, verifyPayment);
router.post("/request-verification", verifyToken, requestPaymentVerification);
router.get("/status/:registrationId", verifyToken, getPaymentStatus);

export default router;