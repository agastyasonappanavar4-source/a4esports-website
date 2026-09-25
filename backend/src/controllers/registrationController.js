import prisma from "../config/prisma.js";
import { isScrimDatePast } from "../utils/scrimAvailability.js";
import { publicSlot } from "../utils/publicSlot.js";

export const registerTeam = async (req, res) => {
    try {
        const { slotId, teamName, iglName, phone } = req.body;

        if (!slotId) {
            return res.status(400).json({
                success: false,
                message: "slotId is required",
            });
        }

        const cleanTeamName = typeof teamName === "string" ? teamName.trim() : "";
        const cleanIglName = typeof iglName === "string" ? iglName.trim() : "";
        const cleanPhone = typeof phone === "string" ? phone.trim() : "";
        if (!cleanTeamName || !cleanIglName || !/^[0-9]{10}$/.test(cleanPhone)) {
            return res.status(400).json({
                success: false,
                message: "Enter a team name, IGL name and a 10-digit phone number.",
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

        if (slot.status !== "OPEN" || slot.scrim.status !== "OPEN" || isScrimDatePast(slot.scrim.date)) {
            return res.status(400).json({
                success: false,
                message: "This time slot is closed or the tournament date has passed.",
            });
        }

        const effectiveMaxTeams = slot.maxTeams ?? slot.scrim.maxTeams;

        const totalPaidRegistrations = await prisma.registration.count({
            where: {
                slotId: Number(slotId),
                paymentStatus: "PAID",
            },
        });

        if (totalPaidRegistrations >= effectiveMaxTeams) {
            return res.status(400).json({
                success: false,
                message: "This time slot is full",
            });
        }

        // Check if user already registered for this exact scrim and slot
        const existingForUser = await prisma.registration.findFirst({
            where: {
                scrimId: slot.scrim.id,
                slotId: Number(slotId),
                userId: req.user.userId,
            },
        });

        if (existingForUser) {
            if (existingForUser.paymentStatus === "PENDING") {
                return res.status(200).json({
                    success: true,
                    existing: true,
                    message: "You already have a pending registration for this slot.",
                    data: existingForUser,
                });
            }
            if (existingForUser.paymentStatus === "FAILED") {
                const retried = await prisma.registration.update({
                    where: { id: existingForUser.id },
                    data: {
                        teamName: cleanTeamName,
                        iglName: cleanIglName,
                        phone: cleanPhone,
                        paymentStatus: "PENDING",
                        paymentVerificationRequestedAt: null,
                        paymentVerifiedAt: null,
                        verifiedByAdminId: null,
                        rejectionReason: null,
                    },
                });
                return res.status(200).json({ success: true, retry: true, data: retried });
            }
            return res.status(400).json({
                success: false,
                message: "You are already registered for this slot.",
            });
        }

        const existingTeam = await prisma.registration.findFirst({
            where: {
                slotId: Number(slotId),
                teamName: cleanTeamName,
                paymentStatus: "PAID",
            },
        });

        if (existingTeam) {
            return res.status(400).json({
                success: false,
                message: "Team already registered and confirmed for this time slot",
            });
        }

        const isFree = slot.scrim.fee === 0;
        const paymentStatus = isFree ? "PAID" : "PENDING";
        const slotNumber = isFree ? totalPaidRegistrations + 1 : 0;

        const registrationCode = isFree
            ? `${slot.scrim.mode}${slot.scrim.id}-${slot.time}-${String(slotNumber).padStart(4, "0")}`
            : `${slot.scrim.mode}${slot.scrim.id}-${slot.time}-PENDING-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const registration = await prisma.registration.create({
            data: {
                registrationCode,
                teamName: cleanTeamName,
                iglName: cleanIglName,
                phone: cleanPhone,
                slotNumber,
                scrimId: slot.scrim.id,
                slotId: Number(slotId),
                userId: req.user.userId,
                paymentStatus,
            },
            include: {
                scrim: true,
                slot: true,
            },
        });

        res.status(201).json({
            success: true,
            data: { ...registration, slot: publicSlot(registration.slot) },
        });
    } catch (error) {
        console.error(error);

        if (
            error.code === "P2002" ||
            error.message?.includes("Unique constraint") ||
            error.message?.includes("Duplicate entry")
        ) {
            return res.status(400).json({
                success: false,
                message: "You are already registered for this slot.",
            });
        }

        res.status(500).json({
            success: false,
            message: "Registration failed",
        });
    }
};

export const getRegistrationById = async (req, res) => {
    try {
        const registration = await prisma.registration.findUnique({
            where: {
                id: Number(req.params.id),
            },
            include: {
                scrim: true,
                slot: true,
            },
        });

        if (!registration) {
            return res.status(404).json({
                success: false,
                message: "Registration not found",
            });
        }

        // Ownership guard
        if (req.user && !req.user.isAdmin && registration.userId !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: "Access denied to this registration",
            });
        }

        res.json({
            success: true,
            data: { ...registration, slot: publicSlot(registration.slot, registration.paymentStatus === "PAID") },
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch registration",
        });
    }
};

export const getRegistrationDetails = async (req, res) => {
    try {
        const registration = await prisma.registration.findUnique({
            where: {
                id: Number(req.params.id),
            },
            include: {
                scrim: true,
                slot: true,
            },
        });

        if (!registration) {
            return res.status(404).json({
                success: false,
                message: "Registration not found",
            });
        }

        // Server-side ownership guard
        if (req.user && !req.user.isAdmin && registration.userId !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: "Access denied to this registration",
            });
        }

        const isVerified = registration.paymentStatus === "PAID";
        const safeSlot = publicSlot(registration.slot, isVerified);
        const safeRegistration = { ...registration, slot: safeSlot };

        // If payment is pending/not verified, return limited registration info and hide room details
        if (!isVerified) {
            return res.status(200).json({
                success: true,
                data: {
                    registration: safeRegistration,
                    scrim: registration.scrim,
                    slot: safeSlot,
                    teams: [],
                    totalTeams: 0,
                    remainingSlots: 0,
                    roomReleased: false,
                    isVerified: false,
                },
            });
        }

        const teams = await prisma.registration.findMany({
            where: {
                slotId: registration.slotId,
                paymentStatus: "PAID",
            },
            select: {
                id: true,
                teamName: true,
                slotNumber: true,
            },
            orderBy: {
                slotNumber: "asc",
            },
        });

        const effectiveMaxTeams = registration.slot.maxTeams ?? registration.scrim.maxTeams;

        res.status(200).json({
            success: true,
            data: {
                registration: safeRegistration,
                scrim: registration.scrim,
                slot: safeSlot,
                teams,
                totalTeams: teams.length,
                remainingSlots: Math.max(0, effectiveMaxTeams - teams.length),
                roomReleased: registration.slot.roomReleased,
                isVerified: true,
            },
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch registration details",
        });
    }
};

export const getMyRegistrations = async (req, res) => {
    try {
        const registrations = await prisma.registration.findMany({
            where: {
                userId: req.user.userId,
                paymentStatus: { in: ["PAID", "PENDING", "FAILED"] },
            },
            include: { scrim: true, slot: true },
            orderBy: { createdAt: "desc" },
        });

        // Deduplicate in case of historical duplicate records (canonical: PAID first, then verification-requested, then newest)
        const sorted = [...registrations].sort((a, b) => {
            const aPaid = a.paymentStatus === "PAID" ? 1 : 0;
            const bPaid = b.paymentStatus === "PAID" ? 1 : 0;
            if (aPaid !== bPaid) return bPaid - aPaid;

            const aReq = a.paymentVerificationRequestedAt ? 1 : 0;
            const bReq = b.paymentVerificationRequestedAt ? 1 : 0;
            if (aReq !== bReq) return bReq - aReq;

            return b.id - a.id;
        });

        const deduplicated = [];
        const seen = new Set();
        for (const reg of sorted) {
            const key = `${reg.scrimId}_${reg.slotId}`;
            if (!seen.has(key)) {
                seen.add(key);
                deduplicated.push(reg);
            }
        }

        res.json({
            success: true,
            data: deduplicated.map((registration) => ({
                ...registration,
                slot: publicSlot(registration.slot, registration.paymentStatus === "PAID"),
            })),
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch your registrations",
        });
    }
};

export const getRegistrationsByScrim = async (req, res) => {
    try {
        const scrimId = Number(req.params.scrimId);

        const registrations = await prisma.registration.findMany({
            where: { scrimId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
                slot: true,
            },
            orderBy: [{ slotId: "asc" }, { slotNumber: "asc" }],
        });

        res.status(200).json({
            success: true,
            data: registrations,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch registrations",
        });
    }
};

export const getRegistrationsBySlot = async (req, res) => {
    try {
        const slotId = Number(req.params.slotId);

        const registrations = await prisma.registration.findMany({
            where: { slotId },
            include: {
                user: {
                    select: { id: true, username: true, email: true },
                },
                scrim: true,
                slot: true,
            },
            orderBy: [{ paymentStatus: "asc" }, { slotNumber: "asc" }, { createdAt: "asc" }],
        });

        res.status(200).json({ success: true, data: registrations });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch registrations",
        });
    }
};

export const removeRegistration = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const registration = await prisma.registration.findUnique({ where: { id } });
        if (!registration) {
            return res.status(404).json({ success: false, message: "Registration not found" });
        }

        await prisma.$transaction([
            prisma.payment.deleteMany({ where: { registrationId: id } }),
            prisma.registration.delete({ where: { id } }),
        ]);
        res.json({ success: true, message: "Team removed from this slot" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to remove team" });
    }
};
