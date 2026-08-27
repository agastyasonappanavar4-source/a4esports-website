import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import registrationRoutes from "./routes/registrationRoutes.js";
import scrimRoutes from "./routes/scrimRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";


const app = express();

const allowedOrigins = [
    "http://localhost:3000",
    "https://www.a4esports.in",
    "https://a4esports-website.vercel.app"
];
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            const cleanOrigin = origin.endsWith("/") ? origin.slice(0, -1) : origin;
            if (
                allowedOrigins.includes(cleanOrigin) || 
                cleanOrigin.startsWith("http://localhost:")
            ) {
                callback(null, true);
            } else {
                callback(null, false); // Fail silently or pass false to let CORS block it normally
            }
        },
        credentials: true,
    })
);

app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

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