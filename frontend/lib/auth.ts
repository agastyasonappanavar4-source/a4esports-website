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

export async function googleLoginRequest(payload: {
  email: string;
  name?: string;
  googleId?: string;
  avatar?: string;
}) {
  const response = await fetch(`${API_URL}/api/auth/google`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle(response);
}

export async function forgotPasswordRequest(email: string) {
  const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, newPassword, resetToken }),
  });
  return handle(response);
}

export async function updateProfileRequest(data: Record<string, any>) {
  const response = await fetch(`${API_URL}/api/auth/profile`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
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