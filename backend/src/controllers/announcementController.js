import prisma from "../config/prisma.js";

// GET POPUP ANNOUNCEMENT
export const getActivePopup = async (req, res) => {
    try {
        const announcement = await prisma.announcement.findFirst({
            where: { active: true, isPopup: true },
            orderBy: { createdAt: "desc" },
        });

        res.json({ success: true, announcement: announcement || null });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// GET ALL ANNOUNCEMENTS (Admin)
export const getAnnouncements = async (req, res) => {
    try {
        const announcements = await prisma.announcement.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.json({ success: true, announcements });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// CREATE ANNOUNCEMENT (Admin)
export const createAnnouncement = async (req, res) => {
    try {
        const { title, description, image, scrimId, isPopup } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, message: "Title is required." });
        }

        // If creating a popup, set all other popups to inactive
        if (isPopup) {
            await prisma.announcement.updateMany({
                where: { isPopup: true },
                data: { isPopup: false },
            });
        }

        const announcement = await prisma.announcement.create({
            data: {
                title,
                description,
                image,
                scrimId: scrimId ? Number(scrimId) : null,
                isPopup: isPopup ?? true,
                active: true,
            },
        });

        res.status(201).json({ success: true, announcement });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// UPDATE ANNOUNCEMENT (Admin)
export const updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, image, scrimId, isPopup, active } = req.body;

        const existing = await prisma.announcement.findUnique({ where: { id: Number(id) } });
        if (!existing) {
            return res.status(404).json({ success: false, message: "Announcement not found." });
        }

        if (isPopup && active) {
            await prisma.announcement.updateMany({
                where: { isPopup: true, id: { not: Number(id) } },
                data: { active: false },
            });
        }

        const announcement = await prisma.announcement.update({
            where: { id: Number(id) },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(image !== undefined && { image }),
                ...(scrimId !== undefined && { scrimId: scrimId ? Number(scrimId) : null }),
                ...(isPopup !== undefined && { isPopup }),
                ...(active !== undefined && { active }),
            },
        });

        res.json({ success: true, announcement });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// DELETE ANNOUNCEMENT (Admin)
export const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.announcement.delete({ where: { id: Number(id) } });
        res.json({ success: true, message: "Announcement deleted." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

