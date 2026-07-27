export type SlotTime = "PM_3" | "PM_6" | "PM_9" | "AM_12";

export const BR_SLOT_TIMES: SlotTime[] = ["PM_3", "PM_6", "PM_9", "AM_12"];
export const CS_SLOT_TIMES: SlotTime[] = ["PM_3", "PM_6", "PM_9"];

export const SLOT_TIME_LABELS: Record<SlotTime, string> = {
  PM_3: "3:00 PM",
  PM_6: "6:00 PM",
  PM_9: "9:00 PM",
  AM_12: "12:00 AM",
};

// 24-hour clock hour for each slot, used for countdowns.
export const SLOT_TIME_HOURS: Record<SlotTime, number> = {
  PM_3: 15,
  PM_6: 18,
  PM_9: 21,
  AM_12: 0,
};

export function slotTimeLabel(time: SlotTime): string {
  return SLOT_TIME_LABELS[time] ?? time;
}

export function combineDateWithSlot(date: string, time: SlotTime): Date {
  const d = new Date(date);
  d.setHours(SLOT_TIME_HOURS[time], 0, 0, 0);
  return d;
}
