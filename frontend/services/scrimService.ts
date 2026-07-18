const API = "http://localhost:5000";

export async function getScrims() {
  const response = await fetch(`${API}/api/scrims`);

  if (!response.ok) {
    throw new Error("Failed to fetch scrims");
  }

  return response.json();
}

export async function getScrim(id: number) {
  const response = await fetch(`${API}/api/scrims/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch scrim");
  }

  return response.json();
}