import type { SlotTime } from "@/lib/slotTime";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface RegistrationSlot {
  id: number;
  time: SlotTime;
  status: "OPEN" | "CLOSED";
  maxTeams: number | null;
  roomId: string | null;
  roomPassword: string | null;
  roomReleased: boolean;
}

export interface MyRegistration {
  id: number;
  registrationCode: string;
  teamName: string;
  iglName: string;
  phone: string;
  slotNumber: number;
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  createdAt: string;
  scrim: {
    id: number;
    title: string;
    mode: "BR" | "CS";
    fee: number;
    date: string;
    maxTeams: number;
    status: string;
    rules: string;
  };
  slot: RegistrationSlot;
}

export async function getMyRegistrations(): Promise<MyRegistration[]> {
  const response = await fetch(`${API_URL}/api/registrations/me`, {
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to load your registrations");
  }
  return data.data;
}

export interface RegistrationDetails {
  registration: MyRegistration;
  scrim: MyRegistration["scrim"];
  slot: RegistrationSlot;
  teams: { teamName: string; slotNumber: number }[];
  totalTeams: number;
  remainingSlots: number;
  roomReleased: boolean;
}

export async function getRegistrationDetails(
  id: number
): Promise<RegistrationDetails> {
  const response = await fetch(`${API_URL}/api/registrations/${id}/details`, {
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to load match details");
  }
  return data.data;
}
