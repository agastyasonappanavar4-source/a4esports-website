import express from "express";
import {
    getAllScrims,
    getScrimById,
    createScrim,
    updateScrim,
    deleteScrim,
    updateScrimStatus,
} from "../controllers/scrimController.js";
import {
    createSlot,
    updateSlot,
    deleteSlot,
    updateSlotStatus,
    releaseSlotRoom,
} from "../controllers/slotController.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { verifyAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllScrims);
router.get("/:id", getScrimById);

// Admin routes - scrim (lobby)
router.post("/", verifyToken, verifyAdmin, createScrim);
router.put("/:id", verifyToken, verifyAdmin, updateScrim);
router.delete("/:id", verifyToken, verifyAdmin, deleteScrim);
router.patch("/:id/status", verifyToken, verifyAdmin, updateScrimStatus);

// Admin routes - slots (time slots under a lobby)
router.post("/:scrimId/slots", verifyToken, verifyAdmin, createSlot);
router.put("/slots/:id", verifyToken, verifyAdmin, updateSlot);
router.delete("/slots/:id", verifyToken, verifyAdmin, deleteSlot);
router.patch("/slots/:id/status", verifyToken, verifyAdmin, updateSlotStatus);
router.patch("/slots/:id/room", verifyToken, verifyAdmin, releaseSlotRoom);

export default router;
