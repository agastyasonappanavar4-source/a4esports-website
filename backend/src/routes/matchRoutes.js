import express from "express";
import {
    getMatchesBySlot,
    createMatch,
    updateMatch,
    deleteMatch,
} from "../controllers/matchController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { verifyAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public / Player route to view matches & results for a slot
router.get("/slot/:slotId", getMatchesBySlot);

// Admin routes to create, update, and delete matches
router.post("/slot/:slotId", verifyToken, verifyAdmin, createMatch);
router.put("/:matchId", verifyToken, verifyAdmin, updateMatch);
router.delete("/:matchId", verifyToken, verifyAdmin, deleteMatch);

export default router;
