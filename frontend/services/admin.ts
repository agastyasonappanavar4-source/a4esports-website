import type { Scrim, Slot } from "@/lib/scrims";
import type { SlotTime } from "@/lib/slotTime";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function handle(response: Response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
}

export interface DashboardStats {
  totalUsers: number;
  totalScrims: number;
  openScrims: number;
  totalRegistrations: number;
  totalRevenue: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${API_URL}/api/admin/stats`, {
    credentials: "include",
  });
  const data = await handle(response);
  return data.data;
}

export interface ScrimInput {
  title: string;
  mode: "BR" | "CS";
  fee: number;
  date: string;
  image: string;
  rules: string;
  maxTeams: number;
  slots?: SlotTime[];
}

export async function createScrimRequest(input: ScrimInput): Promise<Scrim> {
  const response = await fetch(`${API_URL}/api/scrims`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await handle(response);
  return data.data;
}

export async function updateScrimRequest(
  id: number,
  input: Partial<Omit<ScrimInput, "slots">>
): Promise<Scrim> {
  const response = await fetch(`${API_URL}/api/scrims/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await handle(response);
  return data.data;
}

export async function deleteScrimRequest(id: number) {
  const response = await fetch(`${API_URL}/api/scrims/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handle(response);
}

export async function updateScrimStatusRequest(id: number, status: "OPEN" | "CLOSED"): Promise<Scrim> {
  const response = await fetch(`${API_URL}/api/scrims/${id}/status`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const data = await handle(response);
  return data.data;
}

// ---- Slot management ----

export async function createSlotRequest(
  scrimId: number,
  time: SlotTime,
  maxTeams?: number | null
): Promise<Slot> {
  const response = await fetch(`${API_URL}/api/scrims/${scrimId}/slots`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ time, maxTeams }),
  });
  const data = await handle(response);
  return data.data;
}

export async function updateSlotRequest(
  slotId: number,
  maxTeams: number | null
): Promise<Slot> {
  const response = await fetch(`${API_URL}/api/scrims/slots/${slotId}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ maxTeams }),
  });
  const data = await handle(response);
  return data.data;
}

export async function deleteSlotRequest(slotId: number) {
  const response = await fetch(`${API_URL}/api/scrims/slots/${slotId}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handle(response);
}

// This is the "turn off today's 3pm lobby" toggle — closes just that slot,
// leaving other slots under the same lobby untouched.
export async function updateSlotStatusRequest(
  slotId: number,
  status: "OPEN" | "CLOSED"
): Promise<Slot> {
  const response = await fetch(`${API_URL}/api/scrims/slots/${slotId}/status`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const data = await handle(response);
  return data.data;
}

export async function releaseSlotRoomRequest(
  slotId: number,
  roomId: string,
  roomPassword: string
): Promise<Slot> {
  const response = await fetch(`${API_URL}/api/scrims/slots/${slotId}/room`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomId, roomPassword }),
  });
  const data = await handle(response);
  return data.data;
}

// ---- Registrations ----

export interface AdminRegistration {
  id: number;
  registrationCode: string;
  teamName: string;
  iglName: string;
  phone: string;
  slotNumber: number;
  slotId: number;
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  createdAt: string;
}

export async function getRegistrationsByScrimRequest(
  scrimId: number
): Promise<AdminRegistration[]> {
  const response = await fetch(`${API_URL}/api/registrations/scrim/${scrimId}`, {
    credentials: "include",
  });
  const data = await handle(response);
  return data.data;
}

export async function getRegistrationsBySlotRequest(
  slotId: number
): Promise<AdminRegistration[]> {
  const response = await fetch(`${API_URL}/api/registrations/slot/${slotId}`, {
    credentials: "include",
  });
  const data = await handle(response);
  return data.data;
}
