import prisma from "../config/prisma.js";

export const verifyAdmin = async (req, res, next) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(403).json({
                success: false,
                message: "Admin access required.",
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { isAdmin: true },
        });

        if (!user || !user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Admin access required.",
            });
        }

        next();
    } catch (error) {
        return res.status(503).json({
            success: false,
            message: "Authorization check failed.",
        });
    }
};