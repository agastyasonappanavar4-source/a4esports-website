import express from "express";
import {
    getAllScrims,
    getScrimById,
    createScrim,
    updateScrim,
    deleteScrim,
    updateScrimStatus,
    releaseRoom,
} from "../controllers/scrimController.js";

const router = express.Router();

// Public routes
router.get("/", getAllScrims);
router.get("/:id", getScrimById);

// Admin routes
router.post("/", createScrim);
router.put("/:id", updateScrim);
router.delete("/:id", deleteScrim);
router.patch("/:id/status", updateScrimStatus);
router.patch("/:id/room", releaseRoom);

export default router;