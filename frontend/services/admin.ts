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
  time: string;
  image: string;
  rules: string;
  maxTeams: number;
}

export async function createScrimRequest(input: ScrimInput) {
  const response = await fetch(`${API_URL}/api/scrims`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await handle(response);
  return data.data;
}

export async function updateScrimRequest(id: number, input: Partial<ScrimInput>) {
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

export async function updateScrimStatusRequest(id: number, status: "OPEN" | "CLOSED") {
  const response = await fetch(`${API_URL}/api/scrims/${id}/status`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const data = await handle(response);
  return data.data;
}

export async function releaseRoomRequest(id: number, roomId: string, roomPassword: string) {
  const response = await fetch(`${API_URL}/api/scrims/${id}/room`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomId, roomPassword }),
  });
  const data = await handle(response);
  return data.data;
}

export interface AdminRegistration {
  id: number;
  registrationCode: string;
  teamName: string;
  iglName: string;
  phone: string;
  slotNumber: number;
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