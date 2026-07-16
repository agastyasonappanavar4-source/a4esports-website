import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import registrationRoutes from "./routes/registrationRoutes.js";
import scrimRoutes from "./routes/scrimRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "🚀 FF Scrims Backend Running"
    });
});

app.use("/api/scrims", scrimRoutes);
app.use("/api/registrations", registrationRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});