import { apiRequest } from "./api";
import type { SlotTime } from "./slotTime";

export interface Slot {
  id: number;
  time: SlotTime;
  status: "OPEN" | "CLOSED";
  maxTeams: number | null;
  roomId?: string | null;
  roomPassword?: string | null;
  roomReleased?: boolean;
  scrimId: number;
  _count?: { registrations: number };
}

export interface Scrim {
  id: number;
  title: string;
  mode: "BR" | "CS";
  fee: number;
  maxTeams: number;
  date: string;
  image: string;
  prizePool?: string;
  rules: string;
  status: string;
  slots: Slot[];
  _count?: { registrations: number };
}


export async function getScrims(): Promise<Scrim[]> {
  try {
    const response = await apiRequest("/api/scrims");
    return response.data || [];
  } catch {
    return [];
  }
}

export async function getScrimById(id: number): Promise<Scrim | null> {
  try {
    const response = await apiRequest(`/api/scrims/${id}`);
    return response.data;
  } catch {
    return null;
  }
}