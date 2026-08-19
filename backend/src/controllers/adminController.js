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

