import { apiRequest } from "./api";

export interface Scrim {
  id: number;
  title: string;
  mode: "BR" | "CS";
  fee: number;
  maxTeams: number;
  date: string;
  time: string;
  image: string;
  rules: string;
  status: string;
}

export async function getScrims(): Promise<Scrim[]> {
  const response = await apiRequest("/api/scrims");
  return response.data;
}

export async function getScrimById(
  id: number
): Promise<Scrim | null> {
  try {
    const response = await apiRequest(`/api/scrims/${id}`);
    return response.data;
  } catch {
    return null;
  }
}