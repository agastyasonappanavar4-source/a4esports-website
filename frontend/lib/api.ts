const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

// ----------------------
// Scrims API
// ----------------------

export async function getScrims() {
  return apiRequest("/api/scrims");
}

export async function getScrim(id: number) {
  return apiRequest(`/api/scrims/${id}`);
}