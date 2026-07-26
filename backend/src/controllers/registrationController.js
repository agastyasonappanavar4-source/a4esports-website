import prisma from "../config/prisma.js";

export const registerTeam = async (req, res) => {
    try {
        const { scrimId, teamName, iglName, phone } = req.body;

        const scrim = await prisma.scrim.findUnique({
            where: { id: Number(scrimId) },
        });

        if (!scrim) {
            return res.status(404).json({
                success: false,
                message: "Scrim not found",
            });
        }

        const totalRegistrations = await prisma.registration.count({
            where: { scrimId: Number(scrimId) },
        });

        if (totalRegistrations >= scrim.maxTeams) {
            return res.status(400).json({
                success: false,
                message: "Scrim is full",
            });
        }

        const existingTeam = await prisma.registration.findFirst({
            where: {
                scrimId: Number(scrimId),
                teamName,
            },
        });

        if (existingTeam) {
            return res.status(400).json({
                success: false,
                message: "Team already registered",
            });
        }

        const slotNumber = totalRegistrations + 1;

        const registrationCode =
            `${scrim.mode}${scrim.id}-${String(slotNumber).padStart(4, "0")}`;

        const registration = await prisma.registration.create({
            data: {
                registrationCode,
                teamName,
                iglName,
                phone,
                slotNumber,
                scrimId: Number(scrimId),
                userId: req.user.userId,
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
            },
        });

        if (!registration) {
            return res.status(404).json({
                success: false,
                message: "Registration not found",
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
            },
        });

        if (!registration) {
            return res.status(404).json({
                success: false,
                message: "Registration not found",
            });
        }

        const teams = await prisma.registration.findMany({
            where: {
                scrimId: registration.scrimId,
            },
            select: {
                teamName: true,
                slotNumber: true,
            },
            orderBy: {
                slotNumber: "asc",
            },
        });

        res.status(200).json({
            success: true,
            data: {
                registration,
                scrim: registration.scrim,
                teams,
                totalTeams: teams.length,
                remainingSlots: registration.scrim.maxTeams - teams.length,
                roomReleased: registration.scrim.roomReleased,
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
            where: { userId: req.user.userId },
            include: { scrim: true },
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
// chatgpt
export const getRegistrationsByScrim = async (req, res) => {
    try {
        const scrimId = Number(req.params.scrimId);

        const registrations = await prisma.registration.findMany({
            where: {
                scrimId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                slotNumber: "asc",
            },
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