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
    const error = new Error(data.message || "Something went wrong") as Error & { status: number };
    error.status = response.status;
    throw error;
  }
  return data;
}

export async function loginRequest(email: string, password: string) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ email, password }),
  });
  return handle(response);
}

export async function signupRequest(
  username: string,
  email: string,
  password: string
) {
  const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ username, email, password }),
  });
  return handle(response);
}

export async function googleLoginRequest(credential: string) {
  const response = await fetch(`${API_URL}/api/auth/google`, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ credential }),
  });
  return handle(response);
}

export async function forgotPasswordRequest(email: string) {
  const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ email }),
  });
  return handle(response);
}

export async function resetPasswordRequest(
  email: string,
  newPassword: string,
  resetToken?: string
) {
  const response = await fetch(`${API_URL}/api/auth/reset-password`, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ email, newPassword, resetToken }),
  });
  return handle(response);
}

export async function updateProfileRequest(data: Record<string, unknown>) {
  const response = await fetch(`${API_URL}/api/auth/profile`, {
    method: "PUT",
    credentials: "include",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  return handle(response);
}

export async function logoutRequest() {
  const response = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders(),
  });
  return handle(response);
}

export async function getMe() {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    credentials: "include",
    headers: getAuthHeaders(),
  });
  return handle(response);
}
