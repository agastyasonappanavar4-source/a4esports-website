import test from "node:test";
import assert from "node:assert/strict";
import { publicSlot } from "../src/utils/publicSlot.js";
import { isScrimDatePast } from "../src/utils/scrimAvailability.js";

test("room credentials stay hidden until the participant is paid and the admin releases the slot", () => {
    const slot = { id: 7, roomId: "private-room", roomPassword: "private-password", roomReleased: false };
    for (const canSeeRoom of [false, true]) {
        const result = publicSlot(slot, canSeeRoom);
        assert.equal(result.roomId, null);
        assert.equal(result.roomPassword, null);
    }

    slot.roomReleased = true;
    assert.equal(publicSlot(slot).roomId, null);
    assert.equal(publicSlot(slot).roomPassword, null);
    assert.equal(publicSlot(slot, true).roomId, "private-room");
    assert.equal(publicSlot(slot, true).roomPassword, "private-password");
});

test("an event remains open on its Indian calendar date and closes the next day", () => {
    const event = "2026-09-24T00:00:00.000Z";
    assert.equal(isScrimDatePast(event, new Date("2026-09-24T18:29:59Z")), false);
    assert.equal(isScrimDatePast(event, new Date("2026-09-24T18:30:00Z")), true);
});
