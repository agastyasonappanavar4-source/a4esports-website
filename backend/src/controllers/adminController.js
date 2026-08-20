import prisma from "../config/prisma.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getDashboardStats = async (req, res) => {
    try {
        const [totalUsers, totalScrims, openScrims, totalRegistrations, paidRegistrations] =
            await Promise.all([
                prisma.user.count(),
                prisma.scrim.count(),
                prisma.scrim.count({ where: { status: "OPEN" } }),
                prisma.registration.count({ where: { paymentStatus: "PAID" } }),
                prisma.registration.findMany({
                    where: { paymentStatus: "PAID" },
                    include: { scrim: { select: { fee: true } } },
                }),
            ]);

        const totalRevenue = paidRegistrations.reduce(
            (sum, reg) => sum + (reg.scrim?.fee || 0),
            0
        );

        res.json({
            success: true,
            data: {
                totalUsers,
                totalScrims,
                openScrims,
                totalRegistrations,
                totalRevenue,
            },
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch stats",
        });
    }
};

export const uploadTournamentImage = async (req, res) => {
    try {
        const { filename, base64Data } = req.body;
        if (!filename || !base64Data) {
            return res.status(400).json({
                success: false,
                message: "filename and base64Data are required",
            });
        }

        const safeFilename = path.basename(filename).replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(cleanBase64, "base64");

        const targetDir = path.join(__dirname, "..", "..", "..", "frontend", "public", "tournaments");
        await fs.mkdir(targetDir, { recursive: true });

        const targetPath = path.join(targetDir, safeFilename);
        await fs.writeFile(targetPath, buffer);

        res.json({
            success: true,
            message: "Image uploaded successfully",
            url: `/tournaments/${safeFilename}`,
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to upload image",
        });
    }
};

// GET ALL REGISTRATIONS (ADMIN ONLY)
export const getAllRegistrations = async (req, res) => {
    try {
        const registrations = await prisma.registration.findMany({
            include: {
                scrim: {
                    select: {
                        id: true,
                        title: true,
                        fee: true,
                        mode: true,
                    },
                },
                slot: {
                    select: {
                        id: true,
                        time: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.status(200).json({
            success: true,
            data: registrations,
        });
    } catch (error) {
        console.error("Get All Registrations Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch all registrations",
        });
    }
};

// MANUALLY REGISTER A TEAM (ADMIN ONLY)
export const adminRegisterTeam = async (req, res) => {
    try {
        const { slotId, teamName, iglName, phone, paymentStatus } = req.body;

        if (!slotId || !teamName || !iglName || !phone) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: slotId, teamName, iglName, phone",
            });
        }

        const slot = await prisma.slot.findUnique({
            where: { id: Number(slotId) },
            include: { scrim: true },
        });

        if (!slot) {
            return res.status(404).json({
                success: false,
                message: "Time slot not found",
            });
        }

        let slotNumber = 0;
        let registrationCode = "";

        if (paymentStatus === "PAID") {
            const highestSlot = await prisma.registration.aggregate({
                where: { slotId: Number(slotId), paymentStatus: "PAID" },
                _max: { slotNumber: true },
            });
            slotNumber = (highestSlot._max.slotNumber ?? 0) + 1;
            registrationCode = `${slot.scrim.mode}${slot.scrim.id}-${slot.time}-${String(slotNumber).padStart(4, "0")}`;
        } else {
            registrationCode = `${slot.scrim.mode}${slot.scrim.id}-${slot.time}-PENDING-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        }

        const registration = await prisma.registration.create({
            data: {
                registrationCode,
                teamName,
                iglName,
                phone,
                slotNumber,
                scrimId: slot.scrim.id,
                slotId: Number(slotId),
                userId: req.user.userId,
                paymentStatus: paymentStatus || "PAID",
            },
        });

        res.status(201).json({
            success: true,
            data: registration,
        });
    } catch (error) {
        console.error("Admin Manual Register Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to register team manually",
        });
    }
};

