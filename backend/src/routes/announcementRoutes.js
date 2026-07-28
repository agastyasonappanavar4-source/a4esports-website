import express from "express";
import {
    getActivePopup,
    getAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
} from "../controllers/announcementController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { verifyAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public route to fetch active homepage popup
router.get("/popup", getActivePopup);

// Admin routes
router.get("/", verifyToken, verifyAdmin, getAnnouncements);
router.post("/", verifyToken, verifyAdmin, createAnnouncement);
router.put("/:id", verifyToken, verifyAdmin, updateAnnouncement);
router.delete("/:id", verifyToken, verifyAdmin, deleteAnnouncement);

export default router;

