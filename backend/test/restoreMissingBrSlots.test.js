import test from "node:test";
import assert from "node:assert/strict";
import { restoreMissingBrSlots } from "../src/config/restoreMissingBrSlots.js";

test("restores the four room-manageable slots only for BR lobbies with none", async () => {
    const stored = new Map([[35, new Set()], [36, new Set(["PM_3"])]]);
    const prisma = {
        scrim: {
            findMany: async ({ where, select }) => {
                assert.deepEqual(where, { mode: "BR", slots: { none: {} } });
                assert.deepEqual(select, { id: true });
                return [...stored].filter(([, times]) => times.size === 0).map(([id]) => ({ id }));
            },
        },
        slot: {
            createMany: async ({ data, skipDuplicates }) => {
                assert.equal(skipDuplicates, true);
                let count = 0;
                for (const slot of data) {
                    assert.equal(slot.status, "OPEN");
                    assert.ok(slot.customTime);
                    const times = stored.get(slot.scrimId);
                    if (!times.has(slot.time)) {
                        times.add(slot.time);
                        count++;
                    }
                }
                return { count };
            },
        },
    };

    assert.equal(await restoreMissingBrSlots(prisma), 4);
    assert.deepEqual([...stored.get(35)].sort(), ["AM_12", "PM_3", "PM_6", "PM_9"]);
    assert.deepEqual([...stored.get(36)], ["PM_3"]);
    assert.equal(await restoreMissingBrSlots(prisma), 0);
});
