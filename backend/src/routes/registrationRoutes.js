import express from "express";
import {
    registerTeam,
    getRegistrationById,
    getRegistrationDetails,
    getMyRegistrations,
} from "../controllers/registrationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, registerTeam);
router.get("/me", verifyToken, getMyRegistrations);
router.get("/:id", getRegistrationById);
router.get("/:id/details", getRegistrationDetails);

export default router;