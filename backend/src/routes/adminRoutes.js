import express from "express";
import {
    getDashboardStats,
    uploadTournamentImage,
    getAllRegistrations,
    adminRegisterTeam
} from "../controllers/adminController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { verifyAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/stats", verifyToken, verifyAdmin, getDashboardStats);
router.post("/upload", verifyToken, verifyAdmin, uploadTournamentImage);
router.get("/registrations", verifyToken, verifyAdmin, getAllRegistrations);
router.post("/registrations", verifyToken, verifyAdmin, adminRegisterTeam);

export default router;