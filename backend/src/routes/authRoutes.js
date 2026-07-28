import express from "express";
import {
    signup,
    login,
    googleLogin,
    forgotPassword,
    resetPassword,
    updateProfile,
    logout,
    getCurrentUser,
} from "../controllers/authController.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Authentication
router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.put("/profile", verifyToken, updateProfile);
router.post("/logout", logout);

// Current Logged-in User
router.get("/me", verifyToken, getCurrentUser);

export default router;