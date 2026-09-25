import type { SlotTime } from "@/lib/slotTime";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface RegistrationSlot {
  id: number;
  time: SlotTime;
  customTime?: string | null;
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
  paymentVerificationRequestedAt?: string | null;
  paymentVerifiedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  scrim: {
    id: number;
    title: string;
    image?: string;
    mode: "BR" | "CS";
    fee: number;
    date: string;
    maxTeams: number;
    status: string;
    rules: string;
  };
  slot: RegistrationSlot;
}

function getAuthHeaders(customHeaders: Record<string, string> = {}) {
  const headers: Record<string, string> = { ...customHeaders };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

export async function getMyRegistrations(): Promise<MyRegistration[]> {
  const response = await fetch(`${API_URL}/api/registrations/me`, {
    credentials: "include",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to load your registrations");
  }
  return data.data;
}

export async function getRegistrationById(id: number): Promise<MyRegistration> {
  const response = await fetch(`${API_URL}/api/registrations/${id}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to load registration");
  }
  return data.data;
}

export interface RegistrationDetails {
  registration: MyRegistration;
  scrim: MyRegistration["scrim"];
  slot: RegistrationSlot;
  teams: { id: number; teamName: string; slotNumber: number }[];
  totalTeams: number;
  remainingSlots: number;
  roomReleased: boolean;
  isVerified?: boolean;
}

export async function getRegistrationDetails(
  id: number
): Promise<RegistrationDetails> {
  const response = await fetch(`${API_URL}/api/registrations/${id}/details`, {
    credentials: "include",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to load match details");
  }
  return data.data;
}
