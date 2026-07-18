import express from "express";
import {
    signup,
    login,
    logout,
    getCurrentUser,
} from "../controllers/authController.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Authentication
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Current Logged-in User
router.get("/me", verifyToken, getCurrentUser);

export default router;