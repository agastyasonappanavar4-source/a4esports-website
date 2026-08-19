import express from "express";
import { getDashboardStats, uploadTournamentImage } from "../controllers/adminController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { verifyAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/stats", verifyToken, verifyAdmin, getDashboardStats);
router.post("/upload", verifyToken, verifyAdmin, uploadTournamentImage);

export default router;