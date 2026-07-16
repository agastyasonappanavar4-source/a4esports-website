import razorpay from "../config/razorpay.js";

export const createOrder = async (req, res) => {
    try {
        const { amount } = req.body;

        const options = {
            amount: amount * 100,
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