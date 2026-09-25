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

// GET PENDING PAYMENTS FOR ADMIN NOTIFICATIONS / VERIFICATIONS
export const getPendingPayments = async (req, res) => {
    try {
        const pending = await prisma.registration.findMany({
            where: {
                paymentStatus: "PENDING",
                paymentVerificationRequestedAt: { not: null },
            },
            include: {
                user: {
                    select: { id: true, username: true, email: true },
                },
                scrim: {
                    select: { id: true, title: true, fee: true, mode: true },
                },
                slot: {
                    select: { id: true, time: true, customTime: true },
                },
            },
            orderBy: { paymentVerificationRequestedAt: "desc" },
        });

        res.json({
            success: true,
            count: pending.length,
            data: pending,
        });
    } catch (error) {
        console.error("Get Pending Payments Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch pending payments",
        });
    }
};

// VERIFY MANUAL UPI PAYMENT (ADMIN ONLY)
export const verifyManualPayment = async (req, res) => {
    try {
        const { registrationId } = req.params;

        const registration = await prisma.registration.findUnique({
            where: { id: Number(registrationId) },
            include: { slot: { include: { scrim: true } } },
        });

        if (!registration) {
            return res.status(404).json({ success: false, message: "Registration not found" });
        }

        if (registration.paymentStatus === "PAID") {
            return res.json({ success: true, message: "Payment already verified", data: registration });
        }

        if (registration.paymentStatus !== "PENDING" || !registration.paymentVerificationRequestedAt) {
            return res.status(400).json({ success: false, message: "This registration has not requested payment review." });
        }

        const result = await prisma.$transaction(async (tx) => {
            const paidCount = await tx.registration.count({
                where: { slotId: registration.slotId, paymentStatus: "PAID" },
            });
            const effectiveMax = registration.slot.maxTeams ?? registration.slot.scrim.maxTeams;
            if (paidCount >= effectiveMax) {
                throw new Error("This slot has reached maximum team capacity.");
            }

            const highestSlot = await tx.registration.aggregate({
                where: { slotId: registration.slotId, paymentStatus: "PAID" },
                _max: { slotNumber: true },
            });
            const finalSlotNumber = (highestSlot._max.slotNumber ?? 0) + 1;
            const finalCode = `${registration.slot.scrim.mode}${registration.slot.scrim.id}-${registration.slot.time}-${String(finalSlotNumber).padStart(4, "0")}`;

            // Upsert Payment record
            await tx.payment.upsert({
                where: { registrationId: registration.id },
                create: {
                    registrationId: registration.id,
                    amount: registration.slot.scrim.fee,
                    method: "MANUAL_UPI",
                    transactionId: `MANUAL_UPI_${registration.id}_${Date.now()}`,
                    status: "PAID",
                },
                update: {
                    amount: registration.slot.scrim.fee,
                    method: "MANUAL_UPI",
                    status: "PAID",
                },
            });

            const updated = await tx.registration.update({
                where: { id: registration.id },
                data: {
                    paymentStatus: "PAID",
                    slotNumber: finalSlotNumber,
                    registrationCode: finalCode,
                    paymentVerifiedAt: new Date(),
                    verifiedByAdminId: req.user.userId,
                    rejectionReason: null,
                },
                include: { scrim: true, slot: true, user: true },
            });

            return updated;
        });

        res.json({
            success: true,
            message: "Payment successfully verified and team confirmed.",
            data: result,
        });
    } catch (error) {
        console.error("Verify Manual Payment Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to verify payment",
        });
    }
};

// REJECT MANUAL UPI PAYMENT (ADMIN ONLY)
export const rejectManualPayment = async (req, res) => {
    try {
        const { registrationId } = req.params;
        const { reason } = req.body;

        const registration = await prisma.registration.findUnique({
            where: { id: Number(registrationId) },
        });

        if (!registration) {
            return res.status(404).json({ success: false, message: "Registration not found" });
        }

        if (registration.paymentStatus !== "PENDING" || !registration.paymentVerificationRequestedAt) {
            return res.status(400).json({ success: false, message: "Only pending payment review requests can be rejected." });
        }

        const updated = await prisma.registration.update({
            where: { id: Number(registrationId) },
            data: {
                paymentStatus: "FAILED",
                rejectionReason: reason || "Payment could not be verified by administrator",
                verifiedByAdminId: req.user.userId,
            },
        });

        res.json({
            success: true,
            message: "Payment rejected.",
            data: updated,
        });
    } catch (error) {
        console.error("Reject Manual Payment Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to reject payment",
        });
    }
};

// MOVE REGISTRATION TO ANOTHER SLOT (ADMIN ONLY)
export const moveRegistrationSlot = async (req, res) => {
    try {
        const { id } = req.params;
        const { newSlotId } = req.body;

        if (!newSlotId) {
            return res.status(400).json({ success: false, message: "newSlotId is required" });
        }

        const registration = await prisma.registration.findUnique({
            where: { id: Number(id) },
            include: { slot: true },
        });

        if (!registration) {
            return res.status(404).json({ success: false, message: "Registration not found" });
        }

        const targetSlot = await prisma.slot.findUnique({
            where: { id: Number(newSlotId) },
            include: { scrim: true },
        });

        if (!targetSlot) {
            return res.status(404).json({ success: false, message: "Target slot not found" });
        }

        if (targetSlot.scrimId !== registration.scrimId) {
            return res.status(400).json({ success: false, message: "Cannot move team across different tournaments" });
        }

        const updated = await prisma.registration.update({
            where: { id: Number(id) },
            data: {
                slotId: Number(newSlotId),
            },
            include: { slot: true, scrim: true },
        });

        res.json({
            success: true,
            message: "Team moved to new slot successfully",
            data: updated,
        });
    } catch (error) {
        console.error("Move Slot Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to move slot",
        });
    }
};
