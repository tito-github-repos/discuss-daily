import { NextResponse } from 'next/server';
import { activateByPayment } from '@/lib/membership';
import { hmacSha256, safeEqual } from '@/lib/razorpay';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const orderId = String(body.razorpay_order_id ?? '');
  const paymentId = String(body.razorpay_payment_id ?? '');
  const signature = String(body.razorpay_signature ?? '');
  if (!orderId || !paymentId || !signature) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    console.error('RAZORPAY_KEY_SECRET is not set');
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }

  const expected = hmacSha256(secret, `${orderId}|${paymentId}`);
  if (!safeEqual(expected, signature)) {
    return NextResponse.json({ error: 'Payment verification failed.' }, { status: 400 });
  }

  try {
    const result = await activateByPayment(orderId, paymentId, undefined, signature);
    if (!result) {
      return NextResponse.json({ error: 'Payment record not found.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, expiryDate: result.expiryDate?.toISOString() ?? null });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Could not activate the membership.' }, { status: 500 });
  }
}