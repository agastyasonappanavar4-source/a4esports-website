import razorpay from "../config/razorpay.js";
import prisma from "../config/prisma.js";
import crypto from "crypto";

// Create Razorpay Order
export const createOrder = async (req, res) => {
  try {
    const { scrimId } = req.body;

    const scrim = await prisma.scrim.findUnique({
      where: {
        id: Number(scrimId),
      },
    });

    if (!scrim) {
      return res.status(404).json({
        success: false,
        message: "Tournament not found",
      });
    }

    const order = await razorpay.orders.create({
      amount: scrim.fee * 100,
      currency: "INR",
      receipt: `scrim_${scrim.id}_${Date.now()}`,
    });

    res.json({
      success: true,
      order,
      scrim,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Unable to create order",
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