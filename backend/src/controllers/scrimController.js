import prisma from "../config/prisma.js";

// GET all scrims
export const getAllScrims = async (req, res) => {
    try {
        const scrims = await prisma.scrim.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });

        res.status(200).json({
            success: true,
            data: scrims,
        });
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
            where: {
                id: Number(id),
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
        console.error(error);

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

        const scrim = await prisma.scrim.create({
            data: {
                title,
                mode,
                fee,
                date: new Date(date),
                time,
                image,
                rules,
                maxTeams,
            },
        });

        res.status(201).json({
            success: true,
            data: scrim,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create scrim",
        });
    }
};