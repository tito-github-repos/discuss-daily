import { createHmac, timingSafeEqual } from 'crypto';

export const MEMBERSHIP_AMOUNT_PAISE = 100; // ₹365

// Creates an order using Razorpay's REST API (no SDK needed)
export async function createRazorpayOrder(params: {
  amount: number;
  receipt: string;
  notes?: Record<string, string>;
}) {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) throw new Error('Razorpay keys are not set');

  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + Buffer.from(`${key_id}:${key_secret}`).toString('base64'),
    },
    body: JSON.stringify({ ...params, currency: 'INR' }),
  });

  if (!res.ok) {
    throw new Error(`Razorpay order failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as { id: string };
}

export function hmacSha256(secret: string, payload: string) {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}