import razorpay from "../config/razorpay.js";
import prisma from "../config/prisma.js";
import crypto from "crypto";

// Create Razorpay Order
export const createOrder = async (req, res) => {
  try {
    const { registrationId } = req.body;

    const registration = await prisma.registration.findUnique({
      where: { id: Number(registrationId) },
      include: { scrim: true },
    });

    if (!registration || registration.userId !== req.user.userId) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }

    if (registration.paymentStatus !== "PENDING" || registration.scrim.fee <= 0) {
      return res.status(400).json({ success: false, message: "This registration does not need payment" });
    }

    const scrim = registration.scrim;

    const order = await razorpay.orders.create({
      amount: scrim.fee * 100,
      currency: "INR",
      receipt: `scrim_${scrim.id}_${Date.now()}`,
      notes: { registrationId: String(registration.id), userId: String(req.user.userId) },
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

        const registration = await prisma.registration.findUnique({
            where: { id: Number(registrationId) },
            include: { slot: { include: { scrim: true } } },
        });

        if (!registration || registration.userId !== req.user.userId) {
            return res.status(404).json({
                success: false,
                message: "Registration not found",
            });
        }

        if (registration.paymentStatus === "PAID") {
            return res.status(200).json({ success: true, message: "Payment already verified" });
        }

        if (registration.paymentStatus !== "PENDING") {
            return res.status(400).json({ success: false, message: "Registration is not awaiting payment" });
        }

        const order = await razorpay.orders.fetch(razorpay_order_id);
        if (
            order.status !== "paid" ||
            order.amount !== registration.slot.scrim.fee * 100 ||
            order.notes?.registrationId !== String(registration.id) ||
            order.notes?.userId !== String(req.user.userId)
        ) {
            return res.status(400).json({ success: false, message: "Payment does not match this registration" });
        }

        await prisma.$transaction(async (tx) => {
            const paidCount = await tx.registration.count({
                where: { slotId: registration.slotId, paymentStatus: "PAID" },
            });
            const maxTeams = registration.slot.maxTeams ?? registration.slot.scrim.maxTeams;
            if (paidCount >= maxTeams) throw new Error("This time slot is full");

            const highestSlot = await tx.registration.aggregate({
                where: { slotId: registration.slotId, paymentStatus: "PAID" },
                _max: { slotNumber: true },
            });
            const finalSlotNumber = (highestSlot._max.slotNumber ?? 0) + 1;
            const finalCode = `${registration.slot.scrim.mode}${registration.slot.scrim.id}-${registration.slot.time}-${String(finalSlotNumber).padStart(4, "0")}`;
            await tx.payment.create({
                data: {
                    registrationId: registration.id,
                    amount: registration.slot.scrim.fee,
                    method: method || "razorpay",
                    transactionId: razorpay_payment_id,
                    status: "PAID",
                },
            });
            await tx.registration.update({
                where: { id: registration.id },
                data: { paymentStatus: "PAID", slotNumber: finalSlotNumber, registrationCode: finalCode },
            });
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
