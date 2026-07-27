import prisma from "../config/prisma.js";

const VALID_TIMES = ["PM_3", "PM_6", "PM_9", "AM_12"];

// CREATE slot under a scrim
export const createSlot = async (req, res) => {
    try {
        const { scrimId } = req.params;
        const { time, maxTeams } = req.body;

        if (!VALID_TIMES.includes(time)) {
            return res.status(400).json({
                success: false,
                message: `Time must be one of ${VALID_TIMES.join(", ")}`,
            });
        }

        const scrim = await prisma.scrim.findUnique({ where: { id: Number(scrimId) } });

        if (!scrim) {
            return res.status(404).json({ success: false, message: "Scrim not found" });
        }

        const existing = await prisma.slot.findUnique({
            where: { scrimId_time: { scrimId: Number(scrimId), time } },
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "This time slot already exists for this lobby.",
            });
        }

        const slot = await prisma.slot.create({
            data: {
                time,
                scrimId: Number(scrimId),
                ...(maxTeams !== undefined && maxTeams !== null && { maxTeams: Number(maxTeams) }),
            },
        });

        res.status(201).json({ success: true, data: slot });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to create slot" });
    }
};

// UPDATE slot (maxTeams override, etc.)
export const updateSlot = async (req, res) => {
    try {
        const { id } = req.params;
        const { maxTeams } = req.body;

        const slot = await prisma.slot.update({
            where: { id: Number(id) },
            data: {
                ...(maxTeams !== undefined && { maxTeams: maxTeams === null ? null : Number(maxTeams) }),
            },
        });

        res.json({ success: true, data: slot });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to update slot" });
    }
};

// DELETE slot
export const deleteSlot = async (req, res) => {
    try {
        const { id } = req.params;

        const registrationCount = await prisma.registration.count({
            where: { slotId: Number(id) },
        });

        if (registrationCount > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete a slot that already has registrations. Close it instead.",
            });
        }

        await prisma.slot.delete({ where: { id: Number(id) } });

        res.json({ success: true, message: "Slot deleted." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to delete slot" });
    }
};

// TOGGLE slot open/closed (this is the "turn off today's 3pm lobby" action)
export const updateSlotStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["OPEN", "CLOSED"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be OPEN or CLOSED.",
            });
        }

        const slot = await prisma.slot.update({
            where: { id: Number(id) },
            data: { status },
        });

        res.json({ success: true, data: slot });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to update slot status" });
    }
};

// RELEASE room ID + password for a specific slot
export const releaseSlotRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { roomId, roomPassword } = req.body;

        if (!roomId || !roomPassword) {
            return res.status(400).json({
                success: false,
                message: "Room ID and password are required.",
            });
        }

        const slot = await prisma.slot.update({
            where: { id: Number(id) },
            data: { roomId, roomPassword, roomReleased: true },
        });

        res.json({ success: true, data: slot });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to release room details" });
    }
};
