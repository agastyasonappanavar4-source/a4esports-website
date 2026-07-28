import prisma from "../config/prisma.js";

const slotInclude = {
    slots: {
        include: {
            _count: {
                select: {
                    registrations: {
                        where: { paymentStatus: "PAID" },
                    },
                },
            },
        },
        orderBy: { time: "asc" },
    },
};

// GET all scrims
export const getAllScrims = async (req, res) => {
    try {
        const scrims = await prisma.scrim.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                _count: { select: { registrations: true } },
                ...slotInclude,
            },
        });

        res.status(200).json({ success: true, data: scrims });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch scrims",
        });
    }
};

// GET one scrim
export const getScrimById = async (req, res) => {
    try {
        const { id } = req.params;

        const scrim = await prisma.scrim.findUnique({
            where: { id: Number(id) },
            include: slotInclude,
        });

        if (!scrim) {
            return res.status(404).json({
                success: false,
                message: "Scrim not found",
            });
        }

        res.status(200).json({ success: true, data: scrim });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch scrim",
        });
    }
};

// CREATE scrim (lobby). Optionally accepts `slots: string[]` of SlotTime values to create alongside it.
export const createScrim = async (req, res) => {
    try {
        const { title, mode, fee, date, image, prizePool, rules, maxTeams, slots } = req.body;

        if (!title || !mode || !date || !maxTeams) {
            return res.status(400).json({
                success: false,
                message: "Title, mode, date and maxTeams are required.",
            });
        }

        const scrim = await prisma.scrim.create({
            data: {
                title,
                mode,
                fee: Number(fee) || 0,
                date: new Date(date),
                image: image || "",
                prizePool: prizePool || "TBD",
                rules: rules || "",
                maxTeams: Number(maxTeams),
                ...(Array.isArray(slots) && slots.length > 0 && {
                    slots: {
                        create: slots.map((time) => ({ time })),
                    },
                }),
            },
            include: slotInclude,
        });

        res.status(201).json({ success: true, data: scrim });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create scrim",
        });
    }
};

// UPDATE scrim
export const updateScrim = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, mode, fee, date, image, prizePool, rules, maxTeams } = req.body;

        const scrim = await prisma.scrim.update({
            where: { id: Number(id) },
            data: {
                ...(title !== undefined && { title }),
                ...(mode !== undefined && { mode }),
                ...(fee !== undefined && { fee: Number(fee) }),
                ...(date !== undefined && { date: new Date(date) }),
                ...(image !== undefined && { image }),
                ...(prizePool !== undefined && { prizePool }),
                ...(rules !== undefined && { rules }),
                ...(maxTeams !== undefined && { maxTeams: Number(maxTeams) }),
            },
            include: slotInclude,
        });

        res.json({ success: true, data: scrim });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update scrim",
        });
    }
};

// DELETE scrim
export const deleteScrim = async (req, res) => {
    try {
        const { id } = req.params;
        const scrimId = Number(id);

        const existingScrim = await prisma.scrim.findUnique({
            where: { id: scrimId },
            select: { id: true },
        });
        if (!existingScrim) {
            return res.status(404).json({ success: false, message: "Scrim not found" });
        }

        // An admin deleting a lobby also removes its payment and registration records.
        // Payments are deleted first because they reference registrations.
        await prisma.$transaction([
            prisma.payment.deleteMany({ where: { registration: { scrimId } } }),
            prisma.registration.deleteMany({ where: { scrimId } }),
            prisma.scrim.delete({ where: { id: scrimId } }),
        ]);

        res.json({ success: true, message: "Scrim and its registrations deleted." });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete scrim",
        });
    }
};

// TOGGLE open/closed for the whole lobby (all slots' visibility gate)
export const updateScrimStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["OPEN", "CLOSED"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be OPEN or CLOSED.",
            });
        }

        const scrim = await prisma.scrim.update({
            where: { id: Number(id) },
            data: { status },
        });

        res.json({ success: true, data: scrim });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update status",
        });
    }
};
