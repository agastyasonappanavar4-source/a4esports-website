export type ScrimMode = "BR" | "CS" | "SPECIAL";

export const SCRIM_MODE_LABELS: Record<ScrimMode, string> = {
  BR: "Battle Royale",
  CS: "Clash Squad",
  SPECIAL: "Special Lobbies",
};

export function scrimModeLabel(mode: ScrimMode): string {
  return SCRIM_MODE_LABELS[mode];
}
