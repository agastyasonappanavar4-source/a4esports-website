const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
    time: string;
    maxTeams: number;
    status: string;
    rules: string;
    roomId: string | null;
    roomPassword: string | null;
    roomReleased: boolean;
  };
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