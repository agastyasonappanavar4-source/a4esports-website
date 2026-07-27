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

const router = express.Router();

// Public routes
router.get("/", getAllScrims);
router.get("/:id", getScrimById);

// Admin routes - scrim (lobby)
router.post("/", createScrim);
router.put("/:id", updateScrim);
router.delete("/:id", deleteScrim);
router.patch("/:id/status", updateScrimStatus);

// Admin routes - slots (time slots under a lobby)
router.post("/:scrimId/slots", createSlot);
router.put("/slots/:id", updateSlot);
router.delete("/slots/:id", deleteSlot);
router.patch("/slots/:id/status", updateSlotStatus);
router.patch("/slots/:id/room", releaseSlotRoom);

export default router;
