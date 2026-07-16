import express from "express";
import {
    getAllScrims,
    getScrimById,
    createScrim,
} from "../controllers/scrimController.js";

const router = express.Router();

router.get("/", getAllScrims);
router.get("/:id", getScrimById);
router.post("/", createScrim);

export default router;