import express from "express";
import {
    registerTeam,
    getRegistrationById,
    getRegistrationDetails,
} from "../controllers/registrationController.js";

const router = express.Router();

router.post("/", registerTeam);
router.get("/:id", getRegistrationById);
router.get("/:id/details", getRegistrationDetails);

export default router;