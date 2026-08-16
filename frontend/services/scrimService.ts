const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function getScrims() {
  const response = await fetch(`${API}/api/scrims`, {
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch scrims");
  }

  const data = await response.json();

  return data.data;
}

export async function getScrim(id: number) {
  const response = await fetch(`${API}/api/scrims/${id}`, {
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch scrim");
  }

  const data = await response.json();

  return data.data;
}