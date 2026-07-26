import prisma from "../config/prisma.js";

export const getDashboardStats = async (req, res) => {
    try {
        const [totalUsers, totalScrims, openScrims, totalRegistrations, paidRegistrations] =
            await Promise.all([
                prisma.user.count(),
                prisma.scrim.count(),
                prisma.scrim.count({ where: { status: "OPEN" } }),
                prisma.registration.count(),
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