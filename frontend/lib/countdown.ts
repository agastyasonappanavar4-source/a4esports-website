export function combineDateTime(date: string, time: string): Date {
  const d = new Date(date);
  const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);

  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    d.setHours(hours, minutes, 0, 0);
  }

  return d;
}

export function getCountdown(target: Date): string {
  const diff = target.getTime() - Date.now();

  if (diff <= 0) return "Started";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}