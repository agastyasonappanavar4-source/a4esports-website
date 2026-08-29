const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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

export async function getScrims() {
  const response = await fetch(`${API}/api/scrims`, {
    cache: "no-store",
    credentials: "include",
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch scrim");
  }

  const data = await response.json();

  return data.data;
}