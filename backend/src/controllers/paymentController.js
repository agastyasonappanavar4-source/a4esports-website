import razorpay from "../config/razorpay.js";
import prisma from "../config/prisma.js";
import crypto from "crypto";

// Create Razorpay Order
export const createOrder = async (req, res) => {
    try {
        const { amount } = req.body;

        const options = {
            amount: amount * 100, // Convert ₹ to paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        console.error("Create Order Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create order",
        });
    }
};

// Verify Razorpay Payment
export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            registrationId,
            amount,
            method,
        } = req.body;

        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature",
            });
        }

        await prisma.payment.create({
            data: {
                registrationId,
                amount,
                method,
                transactionId: razorpay_payment_id,
                status: "PAID",
            },
        });

        await prisma.registration.update({
            where: {
                id: registrationId,
            },
            data: {
                paymentStatus: "PAID",
            },
        });

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
        });

    } catch (error) {
        console.error("Verify Payment Error:", error);

        return res.status(500).json({
            success: false,
            message: "Payment verification failed",
        });
    }
};