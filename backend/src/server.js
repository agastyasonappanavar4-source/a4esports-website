import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import registrationRoutes from "./routes/registrationRoutes.js";
import scrimRoutes from "./routes/scrimRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";

dotenv.config();

const app = express();

app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
);

app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "🚀 A4esports Backend Running",
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/scrims", scrimRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/announcements", announcementRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});