// Scrim dates represent calendar dates in India, not UTC start-of-day instants.
export function isScrimDatePast(date: string, now = new Date()): boolean {
  const eventDate = new Date(date);
  if (Number.isNaN(eventDate.getTime())) return true;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return eventDate.toISOString().slice(0, 10) < `${values.year}-${values.month}-${values.day}`;
}

export function canRegisterForScrim(scrim: { date: string; status: string }): boolean {
  return scrim.status === "OPEN" && !isScrimDatePast(scrim.date);
}
