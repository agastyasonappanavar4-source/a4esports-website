import prisma from "../config/prisma.js";

// GET ALL MATCHES AND RESULTS FOR A SLOT
export const getMatchesBySlot = async (req, res) => {
    try {
        const slotId = Number(req.params.slotId);

        const matches = await prisma.match.findMany({
            where: { slotId },
            include: {
                results: {
                    include: {
                        registration: {
                            select: {
                                id: true,
                                teamName: true,
                                iglName: true,
                                slotNumber: true,
                            },
                        },
                    },
                    orderBy: { rank: "asc" },
                },
            },
            orderBy: { matchNumber: "asc" },
        });

        // Compute aggregate sums across matches per registered team (without hardcoding arbitrary formulas)
        const teamAggregates = new Map();

        matches.forEach((m) => {
            m.results.forEach((r) => {
                const regId = r.registrationId;
                const teamName = r.registration?.teamName || "Unknown Team";
                const slotNumber = r.registration?.slotNumber ?? 0;

                if (!teamAggregates.has(regId)) {
                    teamAggregates.set(regId, {
                        registrationId: regId,
                        teamName,
                        slotNumber,
                        matchesPlayed: 0,
                        won: 0,
                        pp: 0,
                        kp: 0,
                        tp: 0,
                    });
                }

                const agg = teamAggregates.get(regId);
                agg.matchesPlayed += 1;
                agg.won += r.won || 0;
                agg.pp += r.pp || 0;
                agg.kp += r.kp || 0;
                agg.tp += r.tp || 0;
            });
        });

        const overallStandings = Array.from(teamAggregates.values());

        res.json({
            success: true,
            data: {
                matches,
                overallStandings,
            },
        });
    } catch (error) {
        console.error("Get Matches Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch matches for this slot",
        });
    }
};

// CREATE A NEW MATCH (ADMIN ONLY)
export const createMatch = async (req, res) => {
    try {
        const slotId = Number(req.params.slotId);
        const { matchNumber, title, results } = req.body;

        const slot = await prisma.slot.findUnique({
            where: { id: slotId },
        });

        if (!slot) {
            return res.status(404).json({ success: false, message: "Slot not found" });
        }

        // Determine matchNumber if not provided
        let num = Number(matchNumber);
        if (!num) {
            const highestMatch = await prisma.match.aggregate({
                where: { slotId },
                _max: { matchNumber: true },
            });
            num = (highestMatch._max.matchNumber ?? 0) + 1;
        }

        const match = await prisma.$transaction(async (tx) => {
            const newMatch = await tx.match.create({
                data: {
                    slotId,
                    matchNumber: num,
                    title: title || `Match ${num}`,
                    status: "COMPLETED",
                },
            });

            if (Array.isArray(results) && results.length > 0) {
                // Verify all registrations belong to this slot
                const validResults = results
                    .filter((r) => r.registrationId)
                    .map((r, index) => ({
                        matchId: newMatch.id,
                        registrationId: Number(r.registrationId),
                        rank: Number(r.rank || index + 1),
                        won: Number(r.won || 0),
                        pp: Number(r.pp || 0),
                        kp: Number(r.kp || 0),
                        tp: Number(r.tp || 0),
                    }));

                if (validResults.length > 0) {
                    await tx.matchResult.createMany({
                        data: validResults,
                    });
                }
            }

            return tx.match.findUnique({
                where: { id: newMatch.id },
                include: {
                    results: {
                        include: {
                            registration: {
                                select: { id: true, teamName: true, iglName: true, slotNumber: true },
                            },
                        },
                        orderBy: { rank: "asc" },
                    },
                },
            });
        });

        res.status(201).json({
            success: true,
            message: "Match created successfully",
            data: match,
        });
    } catch (error) {
        console.error("Create Match Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to create match",
        });
    }
};

// UPDATE MATCH AND ITS RESULTS (ADMIN ONLY)
export const updateMatch = async (req, res) => {
    try {
        const matchId = Number(req.params.matchId);
        const { title, matchNumber, status, results } = req.body;

        const existing = await prisma.match.findUnique({
            where: { id: matchId },
        });

        if (!existing) {
            return res.status(404).json({ success: false, message: "Match not found" });
        }

        const updatedMatch = await prisma.$transaction(async (tx) => {
            await tx.match.update({
                where: { id: matchId },
                data: {
                    ...(title !== undefined && { title }),
                    ...(matchNumber !== undefined && { matchNumber: Number(matchNumber) }),
                    ...(status !== undefined && { status }),
                },
            });

            if (Array.isArray(results)) {
                // Replace results
                await tx.matchResult.deleteMany({
                    where: { matchId },
                });

                const validResults = results
                    .filter((r) => r.registrationId)
                    .map((r, index) => ({
                        matchId,
                        registrationId: Number(r.registrationId),
                        rank: Number(r.rank || index + 1),
                        won: Number(r.won || 0),
                        pp: Number(r.pp || 0),
                        kp: Number(r.kp || 0),
                        tp: Number(r.tp || 0),
                    }));

                if (validResults.length > 0) {
                    await tx.matchResult.createMany({
                        data: validResults,
                    });
                }
            }

            return tx.match.findUnique({
                where: { id: matchId },
                include: {
                    results: {
                        include: {
                            registration: {
                                select: { id: true, teamName: true, iglName: true, slotNumber: true },
                            },
                        },
                        orderBy: { rank: "asc" },
                    },
                },
            });
        });

        res.json({
            success: true,
            message: "Match updated successfully",
            data: updatedMatch,
        });
    } catch (error) {
        console.error("Update Match Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update match",
        });
    }
};

// DELETE MATCH (ADMIN ONLY)
export const deleteMatch = async (req, res) => {
    try {
        const matchId = Number(req.params.matchId);

        await prisma.match.delete({
            where: { id: matchId },
        });

        res.json({
            success: true,
            message: "Match deleted successfully",
        });
    } catch (error) {
        console.error("Delete Match Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete match",
        });
    }
};
