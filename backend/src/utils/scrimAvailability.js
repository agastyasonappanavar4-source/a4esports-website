// Tournament dates are entered as calendar dates in India. Keep registration
// open through that date, including the late-night slot.
export function isScrimDatePast(date, now = new Date()) {
    const eventDate = new Date(date);
    if (Number.isNaN(eventDate.getTime())) return true;

    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(now);
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    const todayInIndia = `${values.year}-${values.month}-${values.day}`;
    return eventDate.toISOString().slice(0, 10) < todayInIndia;
}
