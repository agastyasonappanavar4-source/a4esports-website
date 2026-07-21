const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function handle(response: Response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
}

export async function loginRequest(email: string, password: string) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  return handle(response);
}

export async function logoutRequest() {
  const response = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  return handle(response);
}

export async function getMe() {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    credentials: "include",
  });
  return handle(response);
}