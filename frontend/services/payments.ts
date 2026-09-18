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

export async function createOrder(registrationId: number) {
  const response = await fetch(`${API_URL}/api/payments/create-order`, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ registrationId }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create order");
  }

  return data.order;
}

interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  registrationId: number;
  method: string;
}

export async function verifyPayment(payload: VerifyPaymentPayload) {
  const response = await fetch(`${API_URL}/api/payments/verify-payment`, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Payment verification failed");
  }

  return data;
}

export async function requestPaymentVerification(registrationId: number) {
  const response = await fetch(`${API_URL}/api/payments/request-verification`, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ registrationId }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to submit payment verification request");
  }

  return data;
}

export async function getPaymentStatus(registrationId: number) {
  const response = await fetch(`${API_URL}/api/payments/status/${registrationId}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch payment status");
  }

  return data.data;
}

