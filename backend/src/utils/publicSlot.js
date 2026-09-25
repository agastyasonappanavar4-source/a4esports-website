// Never rely on the frontend to hide room credentials. Only a paid participant
// may receive them, and only after an admin explicitly releases that slot.
export function publicSlot(slot, canSeeRoom = false) {
    if (!slot) return slot;
    const { roomId, roomPassword, ...safeSlot } = slot;
    const released = canSeeRoom && Boolean(slot.roomReleased);
    return {
        ...safeSlot,
        roomReleased: released,
        roomId: released ? roomId : null,
        roomPassword: released ? roomPassword : null,
    };
}
