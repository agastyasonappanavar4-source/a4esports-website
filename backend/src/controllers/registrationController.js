import prisma from "../config/prisma.js";

export const registerTeam = async (req, res) => {
    try {
        const { slotId, teamName, iglName, phone } = req.body;

        if (!slotId) {
            return res.status(400).json({
                success: false,
                message: "slotId is required",
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

        if (slot.status !== "OPEN" || slot.scrim.status !== "OPEN") {
            return res.status(400).json({
                success: false,
                message: "This time slot is not open for registration",
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

        // Check if user already registered for this slot
        const existingForUser = await prisma.registration.findFirst({
            where: {
                slotId: Number(slotId),
                userId: req.user.userId,
                paymentStatus: { in: ["PAID", "PENDING"] },
            },
        });

        if (existingForUser) {
            return res.status(200).json({
                success: true,
                data: existingForUser,
                message: "You already have a registration for this slot",
            });
        }

        const existingTeam = await prisma.registration.findFirst({
            where: {
                slotId: Number(slotId),
                teamName,
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
                teamName,
                iglName,
                phone,
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
            data: registration,
        });
    } catch (error) {
        console.error(error);

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
            data: registration,
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

        const isVerified = registration.paymentStatus === "PAID" || registration.scrim.fee === 0;

        // If payment is pending/not verified, return limited registration info and hide room details
        if (!isVerified) {
            return res.status(200).json({
                success: true,
                data: {
                    registration,
                    scrim: registration.scrim,
                    slot: {
                        id: registration.slot.id,
                        time: registration.slot.time,
                        customTime: registration.slot.customTime,
                        status: registration.slot.status,
                        maxTeams: registration.slot.maxTeams,
                        roomReleased: false,
                        roomId: null,
                        roomPassword: null,
                    },
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
                registration,
                scrim: registration.scrim,
                slot: {
                    ...registration.slot,
                    roomId: registration.slot.roomReleased ? registration.slot.roomId : null,
                    roomPassword: registration.slot.roomReleased ? registration.slot.roomPassword : null,
                },
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
                paymentStatus: { in: ["PAID", "PENDING"] },
            },
            include: { scrim: true, slot: true },
            orderBy: { createdAt: "desc" },
        });

        res.json({
            success: true,
            data: registrations,
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
