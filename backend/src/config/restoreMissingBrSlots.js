const BR_SLOT_TIMES = [
    { time: "PM_3", customTime: "3:00 PM" },
    { time: "PM_6", customTime: "6:00 PM" },
    { time: "PM_9", customTime: "9:00 PM" },
    { time: "AM_12", customTime: "12:00 AM" },
];

// Old BR lobbies can exist without Slot rows. The admin UI and room release
// both require a persisted slot, so restore only lobbies with none.
export async function restoreMissingBrSlots(prisma) {
    const scrims = await prisma.scrim.findMany({
        where: { mode: "BR", slots: { none: {} } },
        select: { id: true },
    });

    let restored = 0;
    for (const { id } of scrims) {
        const result = await prisma.slot.createMany({
            data: BR_SLOT_TIMES.map(({ time, customTime }) => ({
                scrimId: id,
                time,
                customTime,
                status: "OPEN",
            })),
            skipDuplicates: true,
        });
        restored += result.count;
    }

    return restored;
}
