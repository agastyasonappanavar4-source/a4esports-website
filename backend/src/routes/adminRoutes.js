import express from "express";
import {
    getDashboardStats,
    uploadTournamentImage,
    getAllRegistrations,
    adminRegisterTeam,
    getPendingPayments,
    verifyManualPayment,
    rejectManualPayment,
    moveRegistrationSlot,
} from "../controllers/adminController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { verifyAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/stats", verifyToken, verifyAdmin, getDashboardStats);
router.post("/upload", verifyToken, verifyAdmin, uploadTournamentImage);
router.get("/registrations", verifyToken, verifyAdmin, getAllRegistrations);
router.post("/registrations", verifyToken, verifyAdmin, adminRegisterTeam);
router.get("/pending-payments", verifyToken, verifyAdmin, getPendingPayments);
router.post("/verify-payment/:registrationId", verifyToken, verifyAdmin, verifyManualPayment);
router.post("/reject-payment/:registrationId", verifyToken, verifyAdmin, rejectManualPayment);
router.patch("/registrations/:id/move-slot", verifyToken, verifyAdmin, moveRegistrationSlot);

export default router;