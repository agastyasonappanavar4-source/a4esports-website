import express from "express";
import {
    registerTeam,
    getRegistrationById,
    getRegistrationDetails,
    getMyRegistrations,
    getRegistrationsByScrim,
    getRegistrationsBySlot,
} from "../controllers/registrationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { verifyAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, registerTeam);
router.get("/me", verifyToken, getMyRegistrations);
router.get("/scrim/:scrimId", verifyToken, verifyAdmin, getRegistrationsByScrim);
router.get("/slot/:slotId", verifyToken, verifyAdmin, getRegistrationsBySlot);
router.get("/:id", getRegistrationById);
router.get("/:id/details", getRegistrationDetails);

export default router;