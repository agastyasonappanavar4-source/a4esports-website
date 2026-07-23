import express from "express";

import {
    createScrim,
    deleteScrim,
    getAllScrims,
    getScrimById,
    updateRoomDetails,
    updateScrimStatus,
} from "../controllers/scrimController.js";

const router = express.Router();

router.get("/", getAllScrims);
router.get("/:id", getScrimById);
router.post("/", createScrim);

router.patch("/:id/status", updateScrimStatus);
router.patch("/:id/room", updateRoomDetails);

router.delete("/:id", deleteScrim);

export default router;