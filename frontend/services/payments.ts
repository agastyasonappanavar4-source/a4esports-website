const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function createOrder(amount: number) {
  const response = await fetch(`${API_URL}/api/payments/create-order`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
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
  amount: number;
  method: string;
}

export async function verifyPayment(payload: VerifyPaymentPayload) {
  const response = await fetch(`${API_URL}/api/payments/verify-payment`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Payment verification failed");
  }

  return data;
}