import prisma from "../config/prisma.js";

// GET all scrims
export const getAllScrims = async (req, res) => {
    try {
        const scrims = await prisma.scrim.findMany({
            orderBy: {
                createdAt: "desc",
            },
            include: {
                _count: {
                    select: {
                        registrations: true,
                    },
                },
            },
        });

        res.status(200).json({
            success: true,
            data: scrims,
        });
    } catch (error) {
        console.error("GET ALL SCRIMS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch scrims",
        });
    }
};

// GET one scrim with registrations
export const getScrimById = async (req, res) => {
    try {
        const scrimId = Number(req.params.id);

        if (!Number.isInteger(scrimId) || scrimId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid scrim ID",
            });
        }

        const scrim = await prisma.scrim.findUnique({
            where: {
                id: scrimId,
            },
            include: {
                registrations: {
                    orderBy: {
                        slotNumber: "asc",
                    },
                    select: {
                        id: true,
                        registrationCode: true,
                        teamName: true,
                        iglName: true,
                        phone: true,
                        slotNumber: true,
                        paymentStatus: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!scrim) {
            return res.status(404).json({
                success: false,
                message: "Scrim not found",
            });
        }

        res.status(200).json({
            success: true,
            data: scrim,
        });
    } catch (error) {
        console.error("GET SCRIM ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch scrim",
        });
    }
};

// CREATE scrim
export const createScrim = async (req, res) => {
    try {
        const {
            title,
            mode,
            fee,
            date,
            time,
            image,
            rules,
            maxTeams,
        } = req.body;

        if (
            !title ||
            !mode ||
            fee === undefined ||
            !date ||
            !time ||
            !rules ||
            maxTeams === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required scrim fields",
            });
        }

        if (!["BR", "CS"].includes(mode)) {
            return res.status(400).json({
                success: false,
                message: "Mode must be BR or CS",
            });
        }

        const numericFee = Number(fee);
        const numericMaxTeams = Number(maxTeams);
        const parsedDate = new Date(date);

        if (!Number.isFinite(numericFee) || numericFee < 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid scrim fee",
            });
        }

        if (
            !Number.isInteger(numericMaxTeams) ||
            numericMaxTeams <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Maximum teams must be a positive integer",
            });
        }

        if (Number.isNaN(parsedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid scrim date",
            });
        }

        const scrim = await prisma.scrim.create({
            data: {
                title: title.trim(),
                mode,
                fee: numericFee,
                date: parsedDate,
                time,
                image: image?.trim() || "default-scrim.jpg",
                rules: rules.trim(),
                maxTeams: numericMaxTeams,
            },
        });

        res.status(201).json({
            success: true,
            message: "Scrim created successfully",
            data: scrim,
        });
    } catch (error) {
        console.error("CREATE SCRIM ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create scrim",
        });
    }
};

// OPEN or CLOSE scrim
export const updateScrimStatus = async (req, res) => {
    try {
        const scrimId = Number(req.params.id);
        const { status } = req.body;

        if (!Number.isInteger(scrimId) || scrimId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid scrim ID",
            });
        }

        if (!["OPEN", "CLOSED"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be OPEN or CLOSED",
            });
        }

        const existingScrim = await prisma.scrim.findUnique({
            where: {
                id: scrimId,
            },
        });

        if (!existingScrim) {
            return res.status(404).json({
                success: false,
                message: "Scrim not found",
            });
        }

        const updatedScrim = await prisma.scrim.update({
            where: {
                id: scrimId,
            },
            data: {
                status,
            },
        });

        res.status(200).json({
            success: true,
            message: `Scrim ${status.toLowerCase()} successfully`,
            data: updatedScrim,
        });
    } catch (error) {
        console.error("UPDATE SCRIM STATUS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update scrim status",
        });
    }
};

// RELEASE or UPDATE room credentials
export const updateRoomDetails = async (req, res) => {
    try {
        const scrimId = Number(req.params.id);

        const {
            roomId,
            roomPassword,
            roomReleased = true,
        } = req.body;

        if (!Number.isInteger(scrimId) || scrimId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid scrim ID",
            });
        }

        if (
            roomReleased &&
            (!roomId?.trim() || !roomPassword?.trim())
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Room ID and password are required before releasing the room",
            });
        }

        const existingScrim = await prisma.scrim.findUnique({
            where: {
                id: scrimId,
            },
        });

        if (!existingScrim) {
            return res.status(404).json({
                success: false,
                message: "Scrim not found",
            });
        }

        const updatedScrim = await prisma.scrim.update({
            where: {
                id: scrimId,
            },
            data: {
                roomId: roomId?.trim() || null,
                roomPassword: roomPassword?.trim() || null,
                roomReleased: Boolean(roomReleased),
            },
        });

        res.status(200).json({
            success: true,
            message: roomReleased
                ? "Room credentials released successfully"
                : "Room credentials hidden successfully",
            data: updatedScrim,
        });
    } catch (error) {
        console.error("UPDATE ROOM DETAILS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update room details",
        });
    }
};

// DELETE scrim
export const deleteScrim = async (req, res) => {
    try {
        const scrimId = Number(req.params.id);

        if (!Number.isInteger(scrimId) || scrimId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid scrim ID",
            });
        }

        const existingScrim = await prisma.scrim.findUnique({
            where: {
                id: scrimId,
            },
            include: {
                _count: {
                    select: {
                        registrations: true,
                    },
                },
            },
        });

        if (!existingScrim) {
            return res.status(404).json({
                success: false,
                message: "Scrim not found",
            });
        }

        if (existingScrim._count.registrations > 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Cannot delete a scrim that already has registrations",
            });
        }

        await prisma.scrim.delete({
            where: {
                id: scrimId,
            },
        });

        res.status(200).json({
            success: true,
            message: "Scrim deleted successfully",
        });
    } catch (error) {
        console.error("DELETE SCRIM ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete scrim",
        });
    }
};