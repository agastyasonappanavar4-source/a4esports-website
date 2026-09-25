import type { Scrim, Slot } from "@/lib/scrims";
import type { SlotTime } from "@/lib/slotTime";
import type { ScrimMode } from "@/lib/scrimMode";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
    headers: getAuthHeaders(),
  });
  const data = await handle(response);
  return data.data;
}

export async function getAdminScrimByIdRequest(id: number): Promise<Scrim> {
  const response = await fetch(`${API_URL}/api/scrims/${id}/admin`, {
    credentials: "include",
    headers: getAuthHeaders(),
  });
  const data = await handle(response);
  return data.data;
}

export interface ScrimInput {
  title: string;
  mode: ScrimMode;
  fee: number;
  date: string;
  image: string;
  paymentQrImage?: string | null;
  paymentUpiId?: string | null;
  prizePool?: string;
  rules: string;
  maxTeams: number;
  slots?: SlotTime[];
}


export async function createScrimRequest(input: ScrimInput): Promise<Scrim> {
  const response = await fetch(`${API_URL}/api/scrims`, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
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
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(input),
  });
  const data = await handle(response);
  return data.data;
}

export async function deleteScrimRequest(id: number) {
  const response = await fetch(`${API_URL}/api/scrims/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: getAuthHeaders(),
  });
  return handle(response);
}

export async function updateScrimStatusRequest(id: number, status: "OPEN" | "CLOSED"): Promise<Scrim> {
  const response = await fetch(`${API_URL}/api/scrims/${id}/status`, {
    method: "PATCH",
    credentials: "include",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
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
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
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
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ maxTeams }),
  });
  const data = await handle(response);
  return data.data;
}

export async function deleteSlotRequest(slotId: number) {
  const response = await fetch(`${API_URL}/api/scrims/slots/${slotId}`, {
    method: "DELETE",
    credentials: "include",
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
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
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
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
  paymentVerificationRequestedAt?: string | null;
  paymentVerifiedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export async function getRegistrationsByScrimRequest(
  scrimId: number
): Promise<AdminRegistration[]> {
  const response = await fetch(`${API_URL}/api/registrations/scrim/${scrimId}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  });
  const data = await handle(response);
  return data.data;
}

export async function getRegistrationsBySlotRequest(
  slotId: number
): Promise<AdminRegistration[]> {
  const response = await fetch(`${API_URL}/api/registrations/slot/${slotId}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  });
  const data = await handle(response);
  return data.data;
}

export async function removeRegistrationRequest(id: number) {
  const response = await fetch(`${API_URL}/api/registrations/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: getAuthHeaders(),
  });
  return handle(response);
}

export async function uploadImageRequest(
  filename: string,
  base64Data: string
): Promise<{ success: boolean; url: string; message: string }> {
  const response = await fetch(`${API_URL}/api/admin/upload`, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ filename, base64Data }),
  });
  return handle(response);
}

export interface AdminRegistrationWithDetails extends AdminRegistration {
  scrim: {
    id: number;
    title: string;
    fee: number;
    mode: ScrimMode;
    paymentUpiId?: string | null;
  };
  slot: {
    id: number;
    time: SlotTime;
    customTime?: string | null;
  };
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export async function getAllRegistrationsRequest(): Promise<AdminRegistrationWithDetails[]> {
  const response = await fetch(`${API_URL}/api/admin/registrations`, {
    credentials: "include",
    headers: getAuthHeaders(),
  });
  const data = await handle(response);
  return data.data;
}

export async function adminRegisterTeamRequest(payload: {
  slotId: number;
  teamName: string;
  iglName: string;
  phone: string;
  paymentStatus: "PENDING" | "PAID";
}): Promise<AdminRegistration> {
  const response = await fetch(`${API_URL}/api/admin/registrations`, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  const data = await handle(response);
  return data.data;
}

// ---- Pending payment verifications & actions ----

export interface PendingPaymentItem {
  id: number;
  registrationCode: string;
  teamName: string;
  iglName: string;
  phone: string;
  slotNumber: number;
  paymentStatus: "PENDING";
  paymentVerificationRequestedAt: string;
  createdAt: string;
  user?: { id: number; username: string; email: string };
  scrim: { id: number; title: string; fee: number; mode: ScrimMode; paymentUpiId?: string | null };
  slot: { id: number; time: SlotTime; customTime?: string | null };
}

export async function getPendingPaymentsRequest(): Promise<{ count: number; data: PendingPaymentItem[] }> {
  const response = await fetch(`${API_URL}/api/admin/pending-payments`, {
    credentials: "include",
    headers: getAuthHeaders(),
  });
  const data = await handle(response);
  return { count: data.count, data: data.data };
}

export async function verifyPaymentRequest(registrationId: number) {
  const response = await fetch(`${API_URL}/api/admin/verify-payment/${registrationId}`, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders(),
  });
  return handle(response);
}

export async function rejectPaymentRequest(registrationId: number, reason?: string) {
  const response = await fetch(`${API_URL}/api/admin/reject-payment/${registrationId}`, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ reason }),
  });
  return handle(response);
}

export async function moveRegistrationSlotRequest(registrationId: number, newSlotId: number) {
  const response = await fetch(`${API_URL}/api/admin/registrations/${registrationId}/move-slot`, {
    method: "PATCH",
    credentials: "include",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ newSlotId }),
  });
  return handle(response);
}

// ---- Matches & Results ----

export interface MatchResultItem {
  id?: number;
  registrationId: number;
  rank: number;
  won: number;
  pp: number;
  kp: number;
  tp: number;
  registration?: {
    id: number;
    teamName: string;
    iglName: string;
    slotNumber: number;
  };
}

export interface SlotMatch {
  id: number;
  slotId: number;
  matchNumber: number;
  title: string;
  status: string;
  results: MatchResultItem[];
}

export interface OverallStandingItem {
  registrationId: number;
  teamName: string;
  slotNumber: number;
  matchesPlayed: number;
  won: number;
  pp: number;
  kp: number;
  tp: number;
}

export async function getSlotMatchesRequest(
  slotId: number
): Promise<{ matches: SlotMatch[]; overallStandings: OverallStandingItem[] }> {
  const response = await fetch(`${API_URL}/api/matches/slot/${slotId}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  });
  const data = await handle(response);
  return data.data;
}

export async function createSlotMatchRequest(
  slotId: number,
  payload: {
    matchNumber?: number;
    title?: string;
    results?: {
      registrationId: number;
      rank: number;
      won?: number;
      pp?: number;
      kp?: number;
      tp?: number;
    }[];
  }
): Promise<SlotMatch> {
  const response = await fetch(`${API_URL}/api/matches/slot/${slotId}`, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  const data = await handle(response);
  return data.data;
}

export async function updateSlotMatchRequest(
  matchId: number,
  payload: {
    matchNumber?: number;
    title?: string;
    status?: string;
    results?: {
      registrationId: number;
      rank: number;
      won?: number;
      pp?: number;
      kp?: number;
      tp?: number;
    }[];
  }
): Promise<SlotMatch> {
  const response = await fetch(`${API_URL}/api/matches/${matchId}`, {
    method: "PUT",
    credentials: "include",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  const data = await handle(response);
  return data.data;
}

export async function deleteSlotMatchRequest(matchId: number) {
  const response = await fetch(`${API_URL}/api/matches/${matchId}`, {
    method: "DELETE",
    credentials: "include",
    headers: getAuthHeaders(),
  });
  return handle(response);
}
